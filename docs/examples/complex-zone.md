# Complex Zone

Create advanced DNS zones with multiple record types and services.

## Overview

This example demonstrates a complex DNS zone configuration including email, security records, and multiple services. It shows how to handle a production-ready domain setup.

## What You'll Learn

- Email server DNS configuration
- Security records (SPF, DKIM, DMARC)
- Multiple subdomains and services
- IPv6 (AAAA) records
- Service records (SRV)

## Complete Example

```typescript
import {
  ZoneConfigBuilder,
  ZoneRecordBuilder,
  ZoneRecordType,
  ZoneRecordName
} from '@markusbansky/bindac'

const complexZone = new ZoneConfigBuilder()
  .setOrigin('mycompany.com')
  .setTTL(3600)
  
  // SOA record
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.SOA)
      .setValue('ns1.mycompany.com. admin.mycompany.com. 2025010101 7200 3600 1209600 3600')
      .build()
  )
  
  // NS records
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.NS)
      .setValue('ns1.mycompany.com.')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.NS)
      .setValue('ns2.mycompany.com.')
      .build()
  )
  
  // Main domain records
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.1')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.AAAA)
      .setValue('2001:db8::1')
      .build()
  )
  
  // Web services
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.WWW)
      .setType(ZoneRecordType.CNAME)
      .setValue('@')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('api')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.10')
      .setTTL(300) // 5 minutes for API
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('cdn')
      .setType(ZoneRecordType.CNAME)
      .setValue('mycompany.fastly.com.')
      .build()
  )
  
  // Email configuration
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.MX)
      .setValue('10 mail.mycompany.com.')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.MAIL)
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.20')
      .build()
  )
  
  // Email security records
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.TXT)
      .setValue('"v=spf1 include:_spf.google.com include:spf.mailgun.org ~all"')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('_dmarc')
      .setType(ZoneRecordType.TXT)
      .setValue('"v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@mycompany.com; ruf=mailto:dmarc-failures@mycompany.com"')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('selector1._domainkey')
      .setType(ZoneRecordType.TXT)
      .setValue('"v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."')
      .build()
  )
  
  // Service discovery
  .addRecord(
    new ZoneRecordBuilder()
      .setName('_sip._tcp')
      .setType(ZoneRecordType.SRV)
      .setValue('10 5 5060 sip.mycompany.com.')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('_sips._tcp')
      .setType(ZoneRecordType.SRV)
      .setValue('10 5 5061 sip.mycompany.com.')
      .build()
  )
  
  // Additional services
  .addRecord(
    new ZoneRecordBuilder()
      .setName('ftp')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.30')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('db')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.40')
      .setTTL(7200) // Longer TTL for stable services
      .build()
  )
  
  .build()

export default complexZone
```

## Generated Output

The compiled BIND9 configuration would be quite extensive. Here's a portion:

```bind
$ORIGIN mycompany.com.
$TTL 3600
@	IN	SOA	ns1.mycompany.com. admin.mycompany.com. 2025010101 7200 3600 1209600 3600
@	IN	NS	ns1.mycompany.com.
@	IN	NS	ns2.mycompany.com.
@	IN	A	203.0.113.1
@	IN	AAAA	2001:db8::1
@	IN	MX	10 mail.mycompany.com.
@	IN	TXT	"v=spf1 include:_spf.google.com include:spf.mailgun.org ~all"
www	IN	CNAME	@
api	300 IN	A	203.0.113.10
cdn	IN	CNAME	mycompany.fastly.com.
mail	IN	A	203.0.113.20
_dmarc	IN	TXT	"v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@mycompany.com; ruf=mailto:dmarc-failures@mycompany.com"
selector1._domainkey	IN	TXT	"v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
_sip._tcp	IN	SRV	10 5 5060 sip.mycompany.com.
_sips._tcp	IN	SRV	10 5 5061 sip.mycompany.com.
ftp	IN	A	203.0.113.30
db	7200 IN	A	203.0.113.40
```

## Record Type Explanations

### Email Security Records

**SPF (Sender Policy Framework)**
```typescript
.setValue('"v=spf1 include:_spf.google.com include:spf.mailgun.org ~all"')
```
Specifies which servers can send email for your domain.

**DMARC (Domain-based Message Authentication)**
```typescript
.setValue('"v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@mycompany.com"')
```
Defines policy for handling failed authentication.

**DKIM (DomainKeys Identified Mail)**
```typescript
.setValue('"v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."')
```
Public key for email signature verification.

### Service Records (SRV)

```typescript
.setValue('10 5 5060 sip.mycompany.com.')
```

SRV record format: `priority weight port target`
- **Priority**: 10 (lower is higher priority)
- **Weight**: 5 (load balancing weight)
- **Port**: 5060 (SIP service port)
- **Target**: sip.mycompany.com. (server hostname)

### IPv6 Records (AAAA)

```typescript
.setType(ZoneRecordType.AAAA)
.setValue('2001:db8::1')
```

Maps domain names to IPv6 addresses.

## Testing the Complex Zone

### Email Configuration Test

```bash
# Test MX record
dig @your_dns_server mycompany.com MX

# Test SPF record
dig @your_dns_server mycompany.com TXT | grep spf

# Test DMARC policy
dig @your_dns_server _dmarc.mycompany.com TXT
```

### Service Discovery Test

```bash
# Test SIP service
dig @your_dns_server _sip._tcp.mycompany.com SRV

# Test HTTPS service
dig @your_dns_server _sips._tcp.mycompany.com SRV
```

### IPv6 Test

```bash
# Test AAAA record
dig @your_dns_server mycompany.com AAAA
```

## Best Practices Demonstrated

1. **Separate TTLs**: Different services have appropriate TTL values
2. **Email Security**: Complete email authentication setup
3. **Service Discovery**: SRV records for service location
4. **IPv6 Support**: AAAA records for modern networking
5. **CDN Integration**: CNAME records for external services

## Next Steps

- [Learn about multiple zones](/examples/multiple-zones)
- [Deploy with Docker](/guide/docker-usage)
- [Review basic patterns](/guide/basic-usage)