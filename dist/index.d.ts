export declare enum ZoneRecordName {
    AT = "@",
    WWW = "www",
    MAIL = "mail",
    NS1 = "ns1",
    NS2 = "ns2"
}
export declare enum ZoneRecordType {
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
    HTTPS = "HTTPS"
}
export declare class ZoneConfigBuilder {
    private origin?;
    private ttl?;
    private records;
    setOrigin(origin: string): this;
    setTTL(ttl: number): this;
    addRecord(record: ZoneRecord): this;
    addRecords(records: ZoneRecord[]): this;
    build(): ZoneConfig;
}
import { z } from "zod";
export declare const ZoneRecordSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<typeof ZoneRecordType>;
    value: z.ZodString;
    ttl: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const ZoneConfigSchema: z.ZodObject<{
    origin: z.ZodString;
    ttl: z.ZodOptional<z.ZodNumber>;
    records: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<typeof ZoneRecordType>;
        value: z.ZodString;
        ttl: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ZoneRecord = z.infer<typeof ZoneRecordSchema>;
export type ZoneConfig = z.infer<typeof ZoneConfigSchema>;
export declare class ZoneRecordBuilder {
    private record;
    setName(name: string | ZoneRecordName): this;
    setType(type: ZoneRecordType): this;
    setValue(value: string): this;
    setTTL(ttl: number): this;
    build(): ZoneRecord;
}
export declare class Bind9Zone {
    config: ZoneConfig;
    constructor(config: ZoneConfig);
    toBindConfig(): string;
}
export declare function generateBind9Config(zones: Bind9Zone[]): string;
