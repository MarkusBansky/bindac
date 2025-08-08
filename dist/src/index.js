export var ZoneRecordName;
(function (ZoneRecordName) {
    ZoneRecordName["AT"] = "@";
    ZoneRecordName["WWW"] = "www";
    ZoneRecordName["MAIL"] = "mail";
    ZoneRecordName["NS1"] = "ns1";
    ZoneRecordName["NS2"] = "ns2";
    // Add more as needed for common DNS names
})(ZoneRecordName || (ZoneRecordName = {}));
export var ZoneRecordType;
(function (ZoneRecordType) {
    ZoneRecordType["A"] = "A";
    ZoneRecordType["AAAA"] = "AAAA";
    ZoneRecordType["CNAME"] = "CNAME";
    ZoneRecordType["MX"] = "MX";
    ZoneRecordType["NS"] = "NS";
    ZoneRecordType["TXT"] = "TXT";
    ZoneRecordType["SRV"] = "SRV";
    ZoneRecordType["PTR"] = "PTR";
    ZoneRecordType["SOA"] = "SOA";
    ZoneRecordType["CAA"] = "CAA";
    ZoneRecordType["DS"] = "DS";
    ZoneRecordType["DNSKEY"] = "DNSKEY";
    ZoneRecordType["RRSIG"] = "RRSIG";
    ZoneRecordType["NSEC"] = "NSEC";
    ZoneRecordType["NSEC3"] = "NSEC3";
    ZoneRecordType["TLSA"] = "TLSA";
    ZoneRecordType["SPF"] = "SPF";
    ZoneRecordType["NAPTR"] = "NAPTR";
    ZoneRecordType["LOC"] = "LOC";
    ZoneRecordType["SSHFP"] = "SSHFP";
    ZoneRecordType["CERT"] = "CERT";
    ZoneRecordType["DNAME"] = "DNAME";
    ZoneRecordType["URI"] = "URI";
    ZoneRecordType["SVCB"] = "SVCB";
    ZoneRecordType["HTTPS"] = "HTTPS";
})(ZoneRecordType || (ZoneRecordType = {}));
export class ZoneConfigBuilder {
    origin;
    ttl;
    records = [];
    setOrigin(origin) {
        this.origin = origin;
        return this;
    }
    setTTL(ttl) {
        this.ttl = ttl;
        return this;
    }
    addRecord(record) {
        this.records.push(record);
        return this;
    }
    addRecords(records) {
        this.records.push(...records);
        return this;
    }
    build() {
        const config = {
            origin: this.origin,
            ttl: this.ttl,
            records: this.records,
        };
        const parsed = ZoneConfigSchema.safeParse(config);
        if (!parsed.success) {
            throw new ZoneValidationError("ZoneConfig", parsed.error);
        }
        return parsed.data;
    }
}
// src/index.ts
import { z } from "zod";
// Zod schemas for validation
export const ZoneRecordSchema = z.object({
    name: z.string().min(1, "Record name is required"),
    type: z.enum(ZoneRecordType),
    value: z.string().min(1, "Record value is required"),
    ttl: z.number().int().positive().optional(),
});
export const ZoneConfigSchema = z.object({
    origin: z.string().min(1, "Zone origin is required"),
    ttl: z.number().int().positive().optional(),
    records: z.array(ZoneRecordSchema).min(1, "At least one record is required"),
});
export class ZoneRecordBuilder {
    record = {};
    setName(name) {
        this.record.name = name;
        return this;
    }
    setType(type) {
        this.record.type = type;
        return this;
    }
    setValue(value) {
        this.record.value = value;
        return this;
    }
    setTTL(ttl) {
        this.record.ttl = ttl;
        return this;
    }
    build() {
        const parsed = ZoneRecordSchema.safeParse(this.record);
        if (!parsed.success) {
            throw new ZoneValidationError("ZoneRecord", parsed.error);
        }
        return parsed.data;
    }
}
export class Bind9Zone {
    config;
    constructor(config) {
        const parsed = ZoneConfigSchema.safeParse(config);
        if (!parsed.success) {
            throw new ZoneValidationError("ZoneConfig", parsed.error);
        }
        this.config = parsed.data;
    }
    toBindConfig() {
        // Additional logic for BIND9 config validation can be added here
        const lines = [
            `$ORIGIN ${this.config.origin}.`,
            this.config.ttl ? `$TTL ${this.config.ttl}` : undefined,
            ...this.config.records.map((r) => `${r.name}\t${r.ttl ? r.ttl + " " : ""}IN\t${r.type}\t${r.value}`),
        ].filter(Boolean);
        // Simple BIND9 syntax check: at least one SOA and NS record
        const types = this.config.records.map((r) => r.type);
        if (!types.includes(ZoneRecordType.SOA)) {
            throw new Bind9ConfigError("Missing SOA record", this.config.origin, ZoneRecordType.SOA);
        }
        if (!types.includes(ZoneRecordType.NS)) {
            throw new Bind9ConfigError("Missing NS record", this.config.origin, ZoneRecordType.NS);
        }
        return lines.join("\n");
    }
}
export function generateBind9Config(zones) {
    const results = [];
    const errors = [];
    for (const zone of zones) {
        try {
            results.push(zone.toBindConfig());
        }
        catch (e) {
            errors.push(e instanceof ZoneValidationError || e instanceof Bind9ConfigError
                ? e.format()
                : e);
        }
    }
    if (errors.length > 0) {
        printStructuredErrors(errors);
        throw new Error("BIND9 config generation failed. See errors above.");
    }
    return results.join("\n\n");
}
// Error classes and reporting
class ZoneValidationError extends Error {
    source;
    zodError;
    constructor(source, zodError) {
        super(`Validation failed for ${source}`);
        this.source = source;
        this.zodError = zodError;
    }
    format() {
        return {
            type: "ValidationError",
            source: this.source,
            issues: this.zodError.issues.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            })),
        };
    }
}
class Bind9ConfigError extends Error {
    message;
    origin;
    missingType;
    constructor(message, origin, missingType) {
        super(message);
        this.message = message;
        this.origin = origin;
        this.missingType = missingType;
    }
    format() {
        return {
            type: "Bind9ConfigError",
            origin: this.origin,
            missingType: this.missingType,
            message: this.message,
        };
    }
}
function printStructuredErrors(errors) {
    // Vitest-like output
    console.error("⨯ BIND9 IaC Validation Errors\n");
    errors.forEach((err, i) => {
        if (err.type === "ValidationError") {
            console.error(`  ● ${err.source} Validation Error:`);
            err.issues.forEach((issue) => {
                console.error(`    ${issue.path}: ${issue.message}`);
            });
        }
        else if (err.type === "Bind9ConfigError") {
            console.error(`  ● BIND9 Config Error in zone '${err.origin}':`);
            console.error(`    Missing record type: ${err.missingType}`);
            console.error(`    ${err.message}`);
        }
        else {
            console.error(`  ● Unknown Error:`, err);
        }
        if (i < errors.length - 1)
            console.error("");
    });
}
