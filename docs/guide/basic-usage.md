# Basic Usage

Learn the core concepts and patterns for using BINDAC to define DNS zones.

## Core Concepts

BINDAC provides several key classes and patterns for building DNS configurations:

- **ZoneRecordBuilder**: Creates individual DNS records
- **ZoneConfigBuilder**: Builds complete zone configurations
- **Bind9Zone**: Represents a complete BIND9 zone
- **Validation**: Built-in validation using Zod schemas

## Record Types

BINDAC supports all common DNS record types through the `ZoneRecordType` enum:

```typescript
import { ZoneRecordType } from '@markusbansky/bindac'

// Common record types
ZoneRecordType.A      // IPv4 address
ZoneRecordType.AAAA   // IPv6 address
ZoneRecordType.CNAME  // Canonical name
ZoneRecordType.MX     // Mail exchange
ZoneRecordType.NS     // Name server
ZoneRecordType.TXT    // Text record
ZoneRecordType.SOA    // Start of authority

// And many more...
```

## Record Names

Use predefined record names or custom strings:

```typescript
import { ZoneRecordName } from '@markusbansky/bindac'

// Predefined names
ZoneRecordName.AT     // @ (root domain)
ZoneRecordName.WWW    // www
ZoneRecordName.MAIL   // mail
ZoneRecordName.NS1    // ns1
ZoneRecordName.NS2    // ns2

// Or use custom strings
.setName('api')       // Custom subdomain
.setName('_dmarc')    // Underscore prefixed
```

## Building Records

Create DNS records using the builder pattern:

```typescript
import { ZoneRecordBuilder, ZoneRecordType, ZoneRecordName } from '@markusbansky/bindac'

// Simple A record
const aRecord = new ZoneRecordBuilder()
  .setName(ZoneRecordName.WWW)
  .setType(ZoneRecordType.A)
  .setValue('192.0.2.1')
  .build()

// MX record with priority
const mxRecord = new ZoneRecordBuilder()
  .setName(ZoneRecordName.AT)
  .setType(ZoneRecordType.MX)
  .setValue('10 mail.example.com.')
  .build()

// TXT record with custom TTL
const txtRecord = new ZoneRecordBuilder()
  .setName(ZoneRecordName.AT)
  .setType(ZoneRecordType.TXT)
  .setValue('"v=spf1 include:_spf.google.com ~all"')
  .setTTL(300) // 5 minutes
  .build()
```

## Building Zones

Combine records into complete zone configurations:

```typescript
import { ZoneConfigBuilder } from '@markusbansky/bindac'

const zone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  .setTTL(3600) // Default TTL for all records
  .addRecord(soaRecord)
  .addRecord(nsRecord)
  .addRecord(aRecord)
  .addRecords([mxRecord, txtRecord]) // Add multiple records
  .build()
```

## Complete Example

Here's a comprehensive example showing various record types:

```typescript
import {
  ZoneConfigBuilder,
  ZoneRecordBuilder,
  ZoneRecordType,
  ZoneRecordName
} from '@markusbansky/bindac'

const fullZone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  .setTTL(3600)
  
  // SOA record (required)
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.SOA)
      .setValue('ns1.example.com. admin.example.com. 2025010101 7200 3600 1209600 3600')
      .build()
  )
  
  // NS records (required)
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.NS)
      .setValue('ns1.example.com.')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.NS)
      .setValue('ns2.example.com.')
      .build()
  )
  
  // A records
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.A)
      .setValue('192.0.2.1')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.WWW)
      .setType(ZoneRecordType.A)
      .setValue('192.0.2.1')
      .build()
  )
  
  // CNAME record
  .addRecord(
    new ZoneRecordBuilder()
      .setName('blog')
      .setType(ZoneRecordType.CNAME)
      .setValue('www.example.com.')
      .build()
  )
  
  // MX record
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.MX)
      .setValue('10 mail.example.com.')
      .build()
  )
  
  // TXT records
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.TXT)
      .setValue('"v=spf1 include:_spf.google.com ~all"')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('_dmarc')
      .setType(ZoneRecordType.TXT)
      .setValue('"v=DMARC1; p=none; rua=mailto:dmarc@example.com"')
      .build()
  )
  
  .build()

export default fullZone
```

## Error Handling

BINDAC provides comprehensive validation and error reporting:

### Validation Errors

If a record is missing required fields:

```typescript
// This will throw a validation error
const invalidRecord = new ZoneRecordBuilder()
  .setName(ZoneRecordName.WWW)
  // Missing type and value
  .build() // Throws ZoneValidationError
```

### BIND9 Configuration Errors

If a zone is missing required records:

```typescript
const incompleteZone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  .addRecord(aRecord) // Missing SOA and NS records
  .build()

// This will fail when generating BIND9 config
const bind9Zone = new Bind9Zone(incompleteZone)
bind9Zone.toBindConfig() // Throws Bind9ConfigError
```

## Best Practices

### 1. Always Include Required Records

Every zone must have SOA and NS records:

```typescript
// Always start with SOA and NS
.addRecord(soaRecord)
.addRecord(nsRecord)
```

### 2. Use Meaningful TTL Values

Set appropriate TTLs for different record types:

```typescript
// Short TTL for frequently changing records
.setTTL(300) // 5 minutes

// Longer TTL for stable records
.setTTL(86400) // 24 hours
```

### 3. Validate Early and Often

Use the builder pattern to catch errors early:

```typescript
try {
  const record = new ZoneRecordBuilder()
    .setName(name)
    .setType(type)
    .setValue(value)
    .build() // Validates immediately
} catch (error) {
  console.error('Record validation failed:', error)
}
```

## Next Steps

- [Learn CLI usage](/guide/cli-usage) for compiling your zones
- [Explore examples](/examples/) for more complex scenarios
- [Set up Docker](/guide/docker-usage) for production deployment