# Simple Zone

Learn to create a basic DNS zone with essential records.

## Overview

This example demonstrates creating a simple DNS zone for `example.com` with the minimum required records. It's perfect for getting started with BINDAC.

## What You'll Learn

- Setting up SOA (Start of Authority) records
- Adding NS (Name Server) records  
- Creating A records for IPv4 addresses
- Basic zone configuration structure

## Code Example

Create a file called `simple-zone.ts`:

```typescript
import {
  ZoneConfigBuilder,
  ZoneRecordBuilder,
  ZoneRecordType,
  ZoneRecordName
} from '@markusbansky/bindac'

// Create a simple zone configuration
const simpleZone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  .setTTL(3600) // 1 hour default TTL
  
  // SOA record - required for every zone
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.SOA)
      .setValue('ns1.example.com. admin.example.com. 2025010101 7200 3600 1209600 3600')
      .build()
  )
  
  // NS record - required for every zone
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.NS)
      .setValue('ns1.example.com.')
      .build()
  )
  
  // A record for the root domain
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.A)
      .setValue('192.0.2.1')
      .build()
  )
  
  // A record for www subdomain
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.WWW)
      .setType(ZoneRecordType.A)
      .setValue('192.0.2.1')
      .build()
  )
  
  .build()

export default simpleZone
```

## Compiling the Zone

Compile your zone configuration:

```bash
bindac simple-zone.ts ./output
```

## Generated Output

The compiled BIND9 configuration (`output/named.conf`):

```bind
$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. admin.example.com. 2025010101 7200 3600 1209600 3600
@	IN	NS	ns1.example.com.
@	IN	A	192.0.2.1
www	IN	A	192.0.2.1
```

## Understanding the Records

### SOA Record
```
@	IN	SOA	ns1.example.com. admin.example.com. 2025010101 7200 3600 1209600 3600
```

The SOA record contains:
- **Primary NS**: `ns1.example.com.` - The primary name server
- **Admin Email**: `admin.example.com.` - Contact email (note the dot instead of @)
- **Serial**: `2025010101` - Zone version number (YYYYMMDDNN format)
- **Refresh**: `7200` - Secondary servers check interval (2 hours)
- **Retry**: `3600` - Retry interval if refresh fails (1 hour)
- **Expire**: `1209600` - Zone expires after this time (2 weeks)
- **Minimum TTL**: `3600` - Minimum cache time for negative responses (1 hour)

### NS Record
```
@	IN	NS	ns1.example.com.
```

Specifies `ns1.example.com` as the authoritative name server for this zone.

### A Records
```
@	IN	A	192.0.2.1
www	IN	A	192.0.2.1
```

Maps domain names to IPv4 addresses:
- `@` (root domain) points to `192.0.2.1`
- `www` subdomain points to `192.0.2.1`

## Testing the Zone

### Syntax Check

Validate the generated configuration:

```bash
named-checkzone example.com ./output/named.conf
```

Expected output:
```
zone example.com/IN: loaded serial 2025010101
OK
```

### DNS Queries

Test with dig (after deploying):

```bash
# Test root domain
dig @your_dns_server example.com A

# Test www subdomain
dig @your_dns_server www.example.com A

# Test NS record
dig @your_dns_server example.com NS
```

## Common Variations

### Adding More Subdomains

```typescript
// Add mail server
.addRecord(
  new ZoneRecordBuilder()
    .setName(ZoneRecordName.MAIL)
    .setType(ZoneRecordType.A)
    .setValue('192.0.2.10')
    .build()
)

// Add FTP server
.addRecord(
  new ZoneRecordBuilder()
    .setName('ftp')
    .setType(ZoneRecordType.A)
    .setValue('192.0.2.20')
    .build()
)
```

### Using CNAME Instead of A

```typescript
// CNAME for www instead of separate A record
.addRecord(
  new ZoneRecordBuilder()
    .setName(ZoneRecordName.WWW)
    .setType(ZoneRecordType.CNAME)
    .setValue('@')
    .build()
)
```

### Custom TTL Values

```typescript
// Short TTL for frequently changing record
.addRecord(
  new ZoneRecordBuilder()
    .setName('api')
    .setType(ZoneRecordType.A)
    .setValue('192.0.2.50')
    .setTTL(300) // 5 minutes
    .build()
)
```

## Troubleshooting

### Missing Required Records

If you forget the SOA or NS records:

```
⨯ BIND9 IaC Validation Errors

  ● BIND9 Config Error in zone 'example.com':
    Missing record type: SOA
    Missing SOA record
```

### Invalid Record Values

If you provide invalid data:

```
⨯ BIND9 IaC Validation Errors

  ● ZoneRecord Validation Error:
    value: String must contain at least 1 character(s)
```

## Next Steps

Once you're comfortable with simple zones:

- [Try a complex zone](/examples/complex-zone) with email and security records
- [Learn about multiple zones](/examples/multiple-zones)
- [Deploy with Docker](/guide/docker-usage)