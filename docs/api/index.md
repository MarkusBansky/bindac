# API Reference

Complete API reference for BINDAC classes and functions.

## Core Classes

### ZoneConfigBuilder

Builds DNS zone configurations with validation.

```typescript
class ZoneConfigBuilder {
  setOrigin(origin: string): ZoneConfigBuilder
  setTTL(ttl: number): ZoneConfigBuilder  
  addRecord(record: ZoneRecord): ZoneConfigBuilder
  addRecords(records: ZoneRecord[]): ZoneConfigBuilder
  build(): ZoneConfig
}
```

#### Methods

**setOrigin(origin: string)**
- Sets the zone origin (domain name)
- **origin**: The domain name for this zone
- **Returns**: ZoneConfigBuilder for chaining

**setTTL(ttl: number)**
- Sets the default TTL for all records in the zone
- **ttl**: Time-to-live in seconds
- **Returns**: ZoneConfigBuilder for chaining

**addRecord(record: ZoneRecord)**
- Adds a single DNS record to the zone
- **record**: A ZoneRecord created with ZoneRecordBuilder
- **Returns**: ZoneConfigBuilder for chaining

**addRecords(records: ZoneRecord[])**
- Adds multiple DNS records to the zone
- **records**: Array of ZoneRecord objects
- **Returns**: ZoneConfigBuilder for chaining

**build()**
- Validates and builds the final ZoneConfig
- **Returns**: ZoneConfig object
- **Throws**: ZoneValidationError if validation fails

### ZoneRecordBuilder

Builds individual DNS records with validation.

```typescript
class ZoneRecordBuilder {
  setName(name: string | ZoneRecordName): ZoneRecordBuilder
  setType(type: ZoneRecordType): ZoneRecordBuilder
  setValue(value: string): ZoneRecordBuilder
  setTTL(ttl: number): ZoneRecordBuilder
  build(): ZoneRecord
}
```

#### Methods

**setName(name: string | ZoneRecordName)**
- Sets the record name
- **name**: Record name (e.g., '@', 'www', 'mail') or ZoneRecordName enum
- **Returns**: ZoneRecordBuilder for chaining

**setType(type: ZoneRecordType)**
- Sets the DNS record type
- **type**: Record type from ZoneRecordType enum
- **Returns**: ZoneRecordBuilder for chaining

**setValue(value: string)**
- Sets the record value
- **value**: The record data (e.g., IP address, domain name)
- **Returns**: ZoneRecordBuilder for chaining

**setTTL(ttl: number)**
- Sets a custom TTL for this record
- **ttl**: Time-to-live in seconds (optional)
- **Returns**: ZoneRecordBuilder for chaining

**build()**
- Validates and builds the final ZoneRecord
- **Returns**: ZoneRecord object
- **Throws**: ZoneValidationError if validation fails

### Bind9Zone

Represents a complete BIND9 zone with configuration generation.

```typescript
class Bind9Zone {
  constructor(config: ZoneConfig)
  toBindConfig(): string
}
```

#### Constructor

**new Bind9Zone(config: ZoneConfig)**
- Creates a new BIND9 zone instance
- **config**: Validated ZoneConfig object
- **Throws**: ZoneValidationError if config is invalid

#### Methods

**toBindConfig()**
- Generates BIND9-compatible configuration text
- **Returns**: String containing BIND9 zone configuration
- **Throws**: Bind9ConfigError if required records are missing

## Enums

### ZoneRecordType

Supported DNS record types.

```typescript
enum ZoneRecordType {
  A = "A",           // IPv4 address
  AAAA = "AAAA",     // IPv6 address
  CNAME = "CNAME",   // Canonical name
  MX = "MX",         // Mail exchange
  NS = "NS",         // Name server
  TXT = "TXT",       // Text record
  SRV = "SRV",       // Service record
  PTR = "PTR",       // Pointer record
  SOA = "SOA",       // Start of authority
  CAA = "CAA",       // Certificate authority authorization
  DS = "DS",         // Delegation signer
  DNSKEY = "DNSKEY", // DNS key
  RRSIG = "RRSIG",   // Resource record signature
  NSEC = "NSEC",     // Next secure
  NSEC3 = "NSEC3",   // Next secure v3
  TLSA = "TLSA",     // Transport layer security authentication
  SPF = "SPF",       // Sender policy framework
  NAPTR = "NAPTR",   // Name authority pointer
  LOC = "LOC",       // Location
  SSHFP = "SSHFP",   // SSH fingerprint
  CERT = "CERT",     // Certificate
  DNAME = "DNAME",   // Delegation name
  URI = "URI",       // Uniform resource identifier
  SVCB = "SVCB",     // Service binding
  HTTPS = "HTTPS"    // HTTPS service binding
}
```

### ZoneRecordName

Common DNS record names.

```typescript
enum ZoneRecordName {
  AT = "@",      // Root domain
  WWW = "www",   // World wide web
  MAIL = "mail", // Mail server
  NS1 = "ns1",   // Name server 1
  NS2 = "ns2"    // Name server 2
}
```

## Types

### ZoneRecord

Individual DNS record interface.

```typescript
interface ZoneRecord {
  name: string      // Record name
  type: ZoneRecordType // Record type
  value: string     // Record value
  ttl?: number      // Optional TTL override
}
```

### ZoneConfig

Complete zone configuration interface.

```typescript
interface ZoneConfig {
  origin: string         // Zone origin domain
  ttl?: number          // Default TTL
  records: ZoneRecord[] // Array of DNS records
}
```

## Functions

### generateBind9Config

Generates BIND9 configuration from multiple zones.

```typescript
function generateBind9Config(zones: Bind9Zone[]): string
```

- **zones**: Array of Bind9Zone objects
- **Returns**: Complete BIND9 configuration string
- **Throws**: Error if any zone fails validation

## Error Classes

### ZoneValidationError

Thrown when zone or record validation fails.

```typescript
class ZoneValidationError extends Error {
  constructor(source: string, zodError: ZodError)
  format(): ValidationErrorDetails
}
```

#### Properties
- **source**: The source that failed validation
- **zodError**: Underlying Zod validation error

### Bind9ConfigError

Thrown when BIND9-specific validation fails.

```typescript
class Bind9ConfigError extends Error {
  constructor(message: string, origin: string, missingType: string)
  format(): Bind9ErrorDetails
}
```

#### Properties
- **message**: Error description
- **origin**: Zone origin that failed
- **missingType**: Required record type that's missing

## Usage Examples

### Basic Zone Creation

```typescript
import {
  ZoneConfigBuilder,
  ZoneRecordBuilder,
  ZoneRecordType,
  ZoneRecordName
} from '@markusbansky/bindac'

const zone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  .setTTL(3600)
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.A)
      .setValue('192.0.2.1')
      .build()
  )
  .build()
```

### Error Handling

```typescript
try {
  const record = new ZoneRecordBuilder()
    .setName('')  // Invalid: empty name
    .setType(ZoneRecordType.A)
    .setValue('192.0.2.1')
    .build()
} catch (error) {
  if (error instanceof ZoneValidationError) {
    console.error('Validation failed:', error.format())
  }
}
```

### BIND9 Generation

```typescript
import { Bind9Zone, generateBind9Config } from '@markusbansky/bindac'

const bind9Zone = new Bind9Zone(zoneConfig)
const config = bind9Zone.toBindConfig()

// Or for multiple zones
const configs = generateBind9Config([zone1, zone2, zone3])
```

## Validation Rules

### ZoneConfig Validation
- Origin must be a non-empty string
- TTL must be a positive integer (if provided)
- Must contain at least one record

### ZoneRecord Validation
- Name must be a non-empty string
- Type must be a valid ZoneRecordType
- Value must be a non-empty string
- TTL must be a positive integer (if provided)

### BIND9 Validation
- Must contain exactly one SOA record
- Must contain at least one NS record
- Record values must be appropriate for their types

## TypeScript Support

BINDAC is built with TypeScript and provides full type safety:

```typescript
// Type-safe record creation
const record: ZoneRecord = new ZoneRecordBuilder()
  .setName(ZoneRecordName.WWW)          // Type: string | ZoneRecordName
  .setType(ZoneRecordType.A)            // Type: ZoneRecordType
  .setValue('192.0.2.1')                // Type: string
  .setTTL(3600)                         // Type: number
  .build()                              // Returns: ZoneRecord

// Type-safe zone creation
const config: ZoneConfig = new ZoneConfigBuilder()
  .setOrigin('example.com')             // Type: string
  .setTTL(3600)                         // Type: number
  .addRecord(record)                    // Type: ZoneRecord
  .build()                              // Returns: ZoneConfig
```