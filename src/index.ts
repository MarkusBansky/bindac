export enum ZoneRecordName {
  AT = "@",
  WWW = "www",
  MAIL = "mail",
  NS1 = "ns1",
  NS2 = "ns2",
  // Add more as needed for common DNS names
}
export enum ZoneRecordType {
  A = "A",
  AAAA = "AAAA",
  CNAME = "CNAME",
  MX = "MX",
  NS = "NS",
  TXT = "TXT",
  SRV = "SRV",
  PTR = "PTR",
  SOA = "SOA",
  CAA = "CAA",
  DS = "DS",
  DNSKEY = "DNSKEY",
  RRSIG = "RRSIG",
  NSEC = "NSEC",
  NSEC3 = "NSEC3",
  TLSA = "TLSA",
  SPF = "SPF",
  NAPTR = "NAPTR",
  LOC = "LOC",
  SSHFP = "SSHFP",
  CERT = "CERT",
  DNAME = "DNAME",
  URI = "URI",
  SVCB = "SVCB",
  HTTPS = "HTTPS",
}
export class ZoneConfigBuilder {
  private origin?: string;
  private ttl?: number;
  private records: ZoneRecord[] = [];

  setOrigin(origin: string) {
    this.origin = origin;
    return this;
  }

  setTTL(ttl: number) {
    this.ttl = ttl;
    return this;
  }

  addRecord(record: ZoneRecord) {
    this.records.push(record);
    return this;
  }

  addRecords(records: ZoneRecord[]) {
    this.records.push(...records);
    return this;
  }

  build(): ZoneConfig {
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

export type ZoneRecord = z.infer<typeof ZoneRecordSchema>;
export type ZoneConfig = z.infer<typeof ZoneConfigSchema>;

export class ZoneRecordBuilder {
  private record: Partial<ZoneRecord> = {};

  setName(name: string | ZoneRecordName) {
    this.record.name = name;
    return this;
  }
  setType(type: ZoneRecordType) {
    this.record.type = type;
    return this;
  }
  setValue(value: string) {
    this.record.value = value;
    return this;
  }
  setTTL(ttl: number) {
    this.record.ttl = ttl;
    return this;
  }
  build(): ZoneRecord {
    const parsed = ZoneRecordSchema.safeParse(this.record);
    if (!parsed.success) {
      throw new ZoneValidationError("ZoneRecord", parsed.error);
    }
    return parsed.data;
  }
}

export class Bind9Zone {
  public config: ZoneConfig;
  constructor(config: ZoneConfig) {
    const parsed = ZoneConfigSchema.safeParse(config);
    if (!parsed.success) {
      throw new ZoneValidationError("ZoneConfig", parsed.error);
    }
    this.config = parsed.data;
  }

  toBindConfig(): string {
    // Additional logic for BIND9 config validation can be added here
    const lines = [
      `$ORIGIN ${this.config.origin}.`,
      this.config.ttl ? `$TTL ${this.config.ttl}` : undefined,
      ...this.config.records.map(
        (r: ZoneRecord) =>
          `${r.name}\t${r.ttl ? r.ttl + " " : ""}IN\t${r.type}\t${r.value}`
      ),
    ].filter(Boolean);
    // Simple BIND9 syntax check: at least one SOA and NS record
    const types = this.config.records.map((r: ZoneRecord) => r.type);
    if (!types.includes(ZoneRecordType.SOA)) {
      throw new Bind9ConfigError(
        "Missing SOA record",
        this.config.origin,
        ZoneRecordType.SOA
      );
    }
    if (!types.includes(ZoneRecordType.NS)) {
      throw new Bind9ConfigError(
        "Missing NS record",
        this.config.origin,
        ZoneRecordType.NS
      );
    }
    return lines.join("\n");
  }
}

export function generateBind9Config(zones: Bind9Zone[]): string {
  const results: string[] = [];
  const errors: any[] = [];
  for (const zone of zones) {
    try {
      results.push(zone.toBindConfig());
    } catch (e) {
      errors.push(
        e instanceof ZoneValidationError || e instanceof Bind9ConfigError
          ? e.format()
          : e
      );
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
  constructor(public source: string, public zodError: z.ZodError) {
    super(`Validation failed for ${source}`);
  }
  format() {
    return {
      type: "ValidationError",
      source: this.source,
      issues: this.zodError.issues.map((e: z.ZodIssue) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    };
  }
}

class Bind9ConfigError extends Error {
  constructor(
    public message: string,
    public origin: string,
    public missingType: string
  ) {
    super(message);
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

function printStructuredErrors(errors: any[]) {
  // Vitest-like output
  console.error("⨯ BIND9 IaC Validation Errors\n");
  errors.forEach((err, i) => {
    if (err.type === "ValidationError") {
      console.error(`  ● ${err.source} Validation Error:`);
      err.issues.forEach((issue: any) => {
        console.error(`    ${issue.path}: ${issue.message}`);
      });
    } else if (err.type === "Bind9ConfigError") {
      console.error(`  ● BIND9 Config Error in zone '${err.origin}':`);
      console.error(`    Missing record type: ${err.missingType}`);
      console.error(`    ${err.message}`);
    } else {
      console.error(`  ● Unknown Error:`, err);
    }
    if (i < errors.length - 1) console.error("");
  });
}
