# Multiple Zones

Manage multiple DNS zones for different domains and environments.

## Overview

This example shows how to organize and manage multiple DNS zones, including production domains, development environments, and different services.

## What You'll Learn

- Managing multiple domain zones
- Environment-specific configurations
- Zone organization patterns
- Shared configuration management

## Project Structure

For multiple zones, organize your project like this:

```
zones/
├── production/
│   ├── example.com.ts
│   ├── myapp.com.ts
│   └── api.example.com.ts
├── development/
│   ├── dev.example.com.ts
│   └── staging.myapp.com.ts
├── shared/
│   ├── common-records.ts
│   └── config.ts
└── build-all.ts
```

## Shared Configuration

Create reusable components in `shared/config.ts`:

```typescript
import { ZoneRecordBuilder, ZoneRecordType } from '@markusbansky/bindac'

export const DEFAULT_TTL = 3600
export const SHORT_TTL = 300
export const LONG_TTL = 86400

export const NAME_SERVERS = [
  'ns1.example.com.',
  'ns2.example.com.'
]

export const MAIL_SERVERS = [
  { priority: 10, server: 'mail1.example.com.' },
  { priority: 20, server: 'mail2.example.com.' }
]

export function createSOARecord(domain: string, adminEmail: string) {
  return new ZoneRecordBuilder()
    .setName('@')
    .setType(ZoneRecordType.SOA)
    .setValue(`ns1.example.com. ${adminEmail.replace('@', '.')}. ${getSerial()} 7200 3600 1209600 3600`)
    .build()
}

export function createNSRecords() {
  return NAME_SERVERS.map(ns =>
    new ZoneRecordBuilder()
      .setName('@')
      .setType(ZoneRecordType.NS)
      .setValue(ns)
      .build()
  )
}

export function createMXRecords() {
  return MAIL_SERVERS.map(mx =>
    new ZoneRecordBuilder()
      .setName('@')
      .setType(ZoneRecordType.MX)
      .setValue(`${mx.priority} ${mx.server}`)
      .build()
  )
}

function getSerial(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const sequence = '01' // Increment for multiple changes per day
  return `${year}${month}${day}${sequence}`
}
```

## Production Zone: example.com

Create `production/example.com.ts`:

```typescript
import {
  ZoneConfigBuilder,
  ZoneRecordBuilder,
  ZoneRecordType
} from '@markusbansky/bindac'
import {
  DEFAULT_TTL,
  SHORT_TTL,
  createSOARecord,
  createNSRecords,
  createMXRecords
} from '../shared/config'

const productionZone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  .setTTL(DEFAULT_TTL)
  
  // Core records
  .addRecord(createSOARecord('example.com', 'admin@example.com'))
  .addRecords(createNSRecords())
  .addRecords(createMXRecords())
  
  // Main website
  .addRecord(
    new ZoneRecordBuilder()
      .setName('@')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.1')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('@')
      .setType(ZoneRecordType.AAAA)
      .setValue('2001:db8::1')
      .build()
  )
  
  // WWW
  .addRecord(
    new ZoneRecordBuilder()
      .setName('www')
      .setType(ZoneRecordType.CNAME)
      .setValue('@')
      .build()
  )
  
  // Production services
  .addRecord(
    new ZoneRecordBuilder()
      .setName('api')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.10')
      .setTTL(SHORT_TTL) // API might change frequently
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('cdn')
      .setType(ZoneRecordType.CNAME)
      .setValue('d1234567890.cloudfront.net.')
      .build()
  )
  
  // Email security
  .addRecord(
    new ZoneRecordBuilder()
      .setName('@')
      .setType(ZoneRecordType.TXT)
      .setValue('"v=spf1 include:_spf.google.com ~all"')
      .build()
  )
  
  .build()

export default productionZone
```

## Development Zone: dev.example.com

Create `development/dev.example.com.ts`:

```typescript
import {
  ZoneConfigBuilder,
  ZoneRecordBuilder,
  ZoneRecordType
} from '@markusbansky/bindac'
import {
  SHORT_TTL,
  createSOARecord,
  createNSRecords
} from '../shared/config'

const devZone = new ZoneConfigBuilder()
  .setOrigin('dev.example.com')
  .setTTL(SHORT_TTL) // Short TTL for development
  
  // Core records
  .addRecord(createSOARecord('dev.example.com', 'dev-admin@example.com'))
  .addRecords(createNSRecords())
  
  // Development servers
  .addRecord(
    new ZoneRecordBuilder()
      .setName('@')
      .setType(ZoneRecordType.A)
      .setValue('10.0.1.100')
      .build()
  )
  
  // Development services
  .addRecord(
    new ZoneRecordBuilder()
      .setName('api')
      .setType(ZoneRecordType.A)
      .setValue('10.0.1.101')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('db')
      .setType(ZoneRecordType.A)
      .setValue('10.0.1.102')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('redis')
      .setType(ZoneRecordType.A)
      .setValue('10.0.1.103')
      .build()
  )
  
  // Feature branches (examples)
  .addRecord(
    new ZoneRecordBuilder()
      .setName('feature-auth')
      .setType(ZoneRecordType.A)
      .setValue('10.0.1.110')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('feature-dashboard')
      .setType(ZoneRecordType.A)
      .setValue('10.0.1.111')
      .build()
  )
  
  .build()

export default devZone
```

## Multi-Domain Application

Create `production/myapp.com.ts` for a separate application:

```typescript
import {
  ZoneConfigBuilder,
  ZoneRecordBuilder,
  ZoneRecordType
} from '@markusbansky/bindac'
import {
  DEFAULT_TTL,
  SHORT_TTL,
  createSOARecord,
  createNSRecords
} from '../shared/config'

const myAppZone = new ZoneConfigBuilder()
  .setOrigin('myapp.com')
  .setTTL(DEFAULT_TTL)
  
  // Core records
  .addRecord(createSOARecord('myapp.com', 'admin@myapp.com'))
  .addRecords(createNSRecords())
  
  // Main app
  .addRecord(
    new ZoneRecordBuilder()
      .setName('@')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.50')
      .build()
  )
  
  // App services
  .addRecord(
    new ZoneRecordBuilder()
      .setName('app')
      .setType(ZoneRecordType.CNAME)
      .setValue('@')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('api')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.51')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('admin')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.52')
      .build()
  )
  
  // Regional endpoints
  .addRecord(
    new ZoneRecordBuilder()
      .setName('us')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.60')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('eu')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.61')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName('asia')
      .setType(ZoneRecordType.A)
      .setValue('203.0.113.62')
      .build()
  )
  
  .build()

export default myAppZone
```

## Build Script

Create `zones/build-all.ts` to compile all zones:

```typescript
import { execSync } from 'child_process'
import { readdirSync, statSync } from 'fs'
import path from 'path'

const ZONES_DIR = __dirname
const OUTPUT_DIR = path.join(__dirname, '../dist/zones')

function findZoneFiles(dir: string): string[] {
  const files: string[] = []
  const entries = readdirSync(dir)
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory() && entry !== 'shared' && entry !== 'dist') {
      files.push(...findZoneFiles(fullPath))
    } else if (stat.isFile() && entry.endsWith('.ts') && entry !== 'build-all.ts') {
      files.push(fullPath)
    }
  }
  
  return files
}

function compilezone(zoneFile: string) {
  const relativePath = path.relative(ZONES_DIR, zoneFile)
  const outputPath = path.join(OUTPUT_DIR, path.dirname(relativePath), path.basename(relativePath, '.ts'))
  
  console.log(`Compiling ${relativePath}...`)
  
  try {
    execSync(`bindac ${zoneFile} ${outputPath}`, { stdio: 'inherit' })
    console.log(`✓ Compiled to ${outputPath}`)
  } catch (error) {
    console.error(`✗ Failed to compile ${relativePath}:`, error)
    process.exit(1)
  }
}

function main() {
  console.log('Building all DNS zones...\n')
  
  const zoneFiles = findZoneFiles(ZONES_DIR)
  
  if (zoneFiles.length === 0) {
    console.log('No zone files found.')
    return
  }
  
  for (const zoneFile of zoneFiles) {
    compilezone(zoneFile)
  }
  
  console.log(`\n✓ Successfully compiled ${zoneFiles.length} zone(s)`)
}

main()
```

## Package Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "build:zones": "bun run zones/build-all.ts",
    "build:prod": "bindac zones/production/example.com.ts dist/production/example.com",
    "build:dev": "bindac zones/development/dev.example.com.ts dist/development/dev.example.com",
    "deploy:prod": "npm run build:prod && docker run -v $(pwd)/dist/production:/etc/bind bindac:latest",
    "deploy:dev": "npm run build:dev && docker run -p 5353:53/udp -v $(pwd)/dist/development:/etc/bind bindac:latest"
  }
}
```

## Environment-Specific Configuration

Use environment variables for different deployments:

```typescript
const ENV = process.env.NODE_ENV || 'development'
const IS_PRODUCTION = ENV === 'production'

const zone = new ZoneConfigBuilder()
  .setOrigin(IS_PRODUCTION ? 'example.com' : 'dev.example.com')
  .setTTL(IS_PRODUCTION ? 3600 : 300)
  
  // Environment-specific records
  .addRecord(
    new ZoneRecordBuilder()
      .setName('@')
      .setType(ZoneRecordType.A)
      .setValue(IS_PRODUCTION ? '203.0.113.1' : '10.0.1.100')
      .build()
  )
  
  .build()
```

## CI/CD Integration

GitHub Actions workflow for multiple zones:

```yaml
name: Deploy DNS Zones

on:
  push:
    branches: [main]
    paths: ['zones/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install BINDAC
        run: npm install -g @markusbansky/bindac
        
      - name: Build all zones
        run: bun run build:zones
        
      - name: Deploy production zones
        if: github.ref == 'refs/heads/main'
        run: |
          # Deploy to production DNS servers
          rsync -av dist/production/ dns-server:/etc/bind/zones/
          
      - name: Deploy development zones
        run: |
          # Deploy to development DNS servers
          rsync -av dist/development/ dev-dns-server:/etc/bind/zones/
```

## Best Practices

1. **Shared Configuration**: Use common functions for repeated patterns
2. **Environment Separation**: Keep production and development zones separate
3. **Consistent Naming**: Use clear, consistent naming conventions
4. **Version Control**: Track all zone files in version control
5. **Automated Building**: Use scripts to build all zones consistently
6. **Testing**: Validate zones before deployment

## Next Steps

- [Deploy with Docker](/guide/docker-usage)
- [Review CLI options](/guide/cli-usage)
- [Learn basic usage patterns](/guide/basic-usage)