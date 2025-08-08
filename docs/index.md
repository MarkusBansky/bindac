# BINDAC

BIND9 Infrastructure-as-Code library for TypeScript.

::: tip What is BINDAC?
BINDAC is a TypeScript library that allows you to define BIND9 DNS server configurations as code. You can write your DNS zones using TypeScript classes and compile them into valid BIND9 configuration files that can be used by BIND9 DNS servers.
:::

## Features

- 🚀 **TypeScript-first**: Write DNS configurations with full type safety
- 🔧 **CLI Tool**: Compile your configurations with a simple command
- 🐳 **Docker Ready**: Pre-built Docker image for easy deployment
- ✅ **Validation**: Built-in validation using Zod schemas
- 📦 **Lightweight**: Minimal dependencies, built with Bun

## Quick Start

Install BINDAC and create your first DNS zone:

```bash
# Install the package
npm install @markusbansky/bindac

# Create a zone configuration
npx bindac my-zone.ts ./output

# Run with Docker
docker run -p 53:53/udp -v ./output:/etc/bind bindac:latest
```

## Example Zone

Here's a simple example of defining a DNS zone:

```typescript
import { ZoneConfigBuilder, ZoneRecordBuilder, ZoneRecordType, ZoneRecordName } from '@markusbansky/bindac'

const myZone = new ZoneConfigBuilder()
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

export default myZone
```

## Next Steps

- [Get Started](/guide/getting-started) - Learn how to install and use BINDAC
- [Examples](/examples/) - See practical examples
- [CLI Usage](/guide/cli-usage) - Master the command line tool
- [Docker Usage](/guide/docker-usage) - Deploy with Docker