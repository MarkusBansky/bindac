# Getting Started

This guide will walk you through setting up BINDAC and creating your first DNS zone configuration.

## What You'll Learn

- How to install BINDAC
- Create your first zone configuration
- Compile it to BIND9 format
- Validate your configuration

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Basic understanding of DNS concepts
- TypeScript knowledge (helpful but not required)

## Installation

You can install BINDAC using npm, yarn, or bun:

::: code-group

```bash [npm]
npm install @markusbansky/bindac
```

```bash [yarn]
yarn add @markusbansky/bindac
```

```bash [bun]
bun add @markusbansky/bindac
```

:::

## Your First Zone

Let's create a simple DNS zone for `example.com`. Create a file called `my-zone.ts`:

```typescript
import {
  ZoneConfigBuilder,
  ZoneRecordBuilder,
  ZoneRecordType,
  ZoneRecordName
} from '@markusbansky/bindac'

// Create a zone configuration for example.com
const exampleZone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  .setTTL(3600) // 1 hour default TTL
  .addRecord(
    // Start of Authority (SOA) record - required for every zone
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.SOA)
      .setValue('ns1.example.com. admin.example.com. 2025010101 7200 3600 1209600 3600')
      .build()
  )
  .addRecord(
    // Name server (NS) record - required for every zone
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.NS)
      .setValue('ns1.example.com.')
      .build()
  )
  .addRecord(
    // A record for the domain root
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.A)
      .setValue('192.0.2.1')
      .build()
  )
  .addRecord(
    // A record for www subdomain
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.WWW)
      .setType(ZoneRecordType.A)
      .setValue('192.0.2.1')
      .build()
  )
  .build()

export default exampleZone
```

## Compile Your Zone

Use the BINDAC CLI to compile your TypeScript zone into BIND9 configuration:

```bash
npx bindac my-zone.ts ./output
```

This will generate a `named.conf` file in the `./output` directory:

```bind
$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. admin.example.com. 2025010101 7200 3600 1209600 3600
@	IN	NS	ns1.example.com.
@	IN	A	192.0.2.1
www	IN	A	192.0.2.1
```

## Understanding the Output

The generated BIND9 configuration includes:

- **$ORIGIN**: The domain name for this zone
- **$TTL**: Default time-to-live for records
- **SOA**: Start of Authority record with zone metadata
- **NS**: Name server record
- **A**: Address records mapping names to IP addresses

## Validation

BINDAC automatically validates your configuration:

- **Required Records**: Ensures SOA and NS records are present
- **Type Safety**: TypeScript prevents invalid record types
- **Value Validation**: Zod schemas validate record values
- **BIND9 Syntax**: Checks for BIND9-specific requirements

If validation fails, you'll see detailed error messages:

```
⨯ BIND9 IaC Validation Errors

  ● BIND9 Config Error in zone 'example.com':
    Missing record type: SOA
    Missing SOA record
```

## Next Steps

Now that you have a basic zone working:

- [Learn about the CLI](/guide/cli-usage) for advanced options
- [Explore more examples](/examples/) for complex configurations
- [Set up Docker](/guide/docker-usage) for production deployment
- Read about [advanced usage patterns](/guide/basic-usage)