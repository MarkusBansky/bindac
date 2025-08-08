# CLI Usage

Master the BINDAC command-line interface for compiling DNS zones.

## Basic Usage

The BINDAC CLI compiles JavaScript zone configurations into BIND9-compatible files:

```bash
bindac <input> <outputDir>
```

- **input**: Path to your compiled JavaScript zone file
- **outputDir**: Directory where BIND9 config will be written

## Workflow

BINDAC works with JavaScript files for maximum runtime compatibility. Here's the recommended workflow:

### 1. Write TypeScript Zone Configuration

```typescript
// my-zone.ts
import { ZoneConfigBuilder, ZoneRecordBuilder, ZoneRecordType, ZoneRecordName } from '@markusbansky/bindac'

const zone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  .setTTL(3600)
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.SOA)
      .setValue('ns1.example.com. admin.example.com. 2025010101 7200 3600 1209600 3600')
      .build()
  )
  .build()

export default zone
```

### 2. Compile TypeScript to JavaScript

```bash
# Compile with TypeScript compiler
npx tsc my-zone.ts --outDir ./compiled --target ES2022 --module ESNext --moduleResolution Node

# This creates: ./compiled/my-zone.js
```

### 3. Run BINDAC CLI

```bash
# Compile the zone configuration
bindac ./compiled/my-zone.js ./output

# Output: ./output/named.conf
```

## Cross-Runtime Compatibility

The CLI works with multiple JavaScript runtimes:

### Node.js (Default)
```bash
node bin/bindac.js my-zone.js ./output
npx bindac my-zone.js ./output
```

### Bun
```bash
bun bin/bindac.js my-zone.js ./output
bunx bindac my-zone.js ./output
```

### Deno
```bash
deno run --allow-read --allow-write bin/bindac.js my-zone.js ./output
```

## Examples

### Quick Start with Provided Example

```bash
# Use the included JavaScript example
bindac examples/example-zone.js ./output
```

### Custom Zone

```bash
# 1. Create TypeScript zone
cat > my-zone.ts << 'EOF'
import { ZoneConfigBuilder, ZoneRecordBuilder, ZoneRecordType, ZoneRecordName } from '@markusbansky/bindac'

export default new ZoneConfigBuilder()
  .setOrigin('mysite.com')
  .setTTL(3600)
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.SOA)
      .setValue('ns1.mysite.com. admin.mysite.com. 2025010101 7200 3600 1209600 3600')
      .build()
  )
  .build()
EOF

# 2. Compile to JavaScript
npx tsc my-zone.ts --outDir ./compiled --target ES2022 --module ESNext --moduleResolution Node

# 3. Generate BIND9 config
bindac ./compiled/my-zone.js ./dns-config
```

### TypeScript File Handling

If you try to use TypeScript files directly, the CLI provides helpful guidance:

```bash
bindac my-zone.ts ./output
```

Output:
```
⚠ TypeScript files need to be compiled to JavaScript first.
Run: npx tsc my-zone.ts --outDir ./compiled --target ES2022 --module ESNext --moduleResolution Node
Then use: bindac ./compiled/my-zone.js ./output
```

## CLI Options

### Help

Display usage information:

```bash
bindac --help
# or
bindac -h
```

Output:
```
bindac - BIND9 IaC Compiler

Usage:
  bindac <input> <outputDir>

Arguments:
  <input>         Path to your compiled JavaScript file exporting a ZoneConfig
  <outputDir>     Output directory for BIND9 config

Options:
  -h, --help      Show this help message

Example:
  # First compile TypeScript to JavaScript
  npx tsc my-zone.ts --outDir ./compiled --target ES2022 --module ESNext
  
  # Then run bindac
  bindac ./compiled/my-zone.js ./output
  
  # Or use the provided example
  bindac examples/example-zone.js ./output

Note: This tool works with Node.js, Bun, and Deno runtimes.
```

## Input File Requirements

Your JavaScript file must export a `ZoneConfig` as the default export:

```javascript
// Compiled from TypeScript
import { ZoneConfigBuilder } from '@markusbansky/bindac'

const myZone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  // ... add records
  .build()

// Required: default export
export default myZone
```

## Output Format

The CLI generates a `named.conf` file in the specified output directory:

```
output/
└── named.conf
```

Example output:
```bind
$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. admin.example.com. 2025010101 7200 3600 1209600 3600
@	IN	NS	ns1.example.com.
@	IN	A	192.0.2.1
www	IN	CNAME	@
```

## Error Handling

The CLI provides detailed error messages for different failure scenarios:

### File Not Found

```bash
bindac nonexistent.ts ./output
```

Output:
```
⨯ Input file does not exist or is not a file: nonexistent.ts
```

### Invalid Output Directory

```bash
bindac my-zone.ts /etc
```

Output:
```
⨯ Output directory is forbidden or unsafe: /etc
```

### Import Errors

If your TypeScript file has syntax errors:

```bash
bindac broken-zone.ts ./output
```

Output:
```
⨯ Failed to load IaC file: broken-zone.ts
SyntaxError: Unexpected token ']'
```

### Missing Default Export

If your file doesn't export a zone configuration:

```bash
bindac no-export.ts ./output
```

Output:
```
⨯ Failed to load IaC file: no-export.ts
Error: No default export found in input file.
```

### Validation Errors

If your zone configuration is invalid:

```typescript
// Invalid zone - missing SOA record
const invalidZone = new ZoneConfigBuilder()
  .setOrigin('example.com')
  .addRecord(/* just an A record */)
  .build()

export default invalidZone
```

Output:
```
⨯ Failed to compile BIND9 config:

⨯ BIND9 IaC Validation Errors

  ● BIND9 Config Error in zone 'example.com':
    Missing record type: SOA
    Missing SOA record
```

## Security Features

The CLI includes security measures to prevent writing to dangerous locations:

### Forbidden Directories

These system directories are protected:
- `/etc`
- `/bin`
- `/usr`
- `/root`
- And other system paths

### Allowed Directories

These locations are safe to use:
- User home directories (`/home/user/`)
- Temporary directories (`/tmp/`)
- Project-relative paths (`./output`)
- Current working directory subdirectories

## Integration Examples

### With Package Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "compile:zones": "tsc zones/*.ts --outDir ./compiled --target ES2022 --module ESNext --moduleResolution Node",
    "build:dns": "npm run compile:zones && bindac compiled/zones/production.js ./dist/bind9",
    "build:dev": "npm run compile:zones && bindac compiled/zones/development.js ./dist/dev"
  }
}
```

Run with:
```bash
npm run build:dns
```

### With CI/CD

In your GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: npm install

- name: Compile TypeScript zones
  run: npx tsc zones/*.ts --outDir ./compiled --target ES2022 --module ESNext --moduleResolution Node

- name: Install BINDAC CLI
  run: npm install -g @markusbansky/bindac

- name: Compile DNS zones
  run: bindac ./compiled/zones/production.js ./dist/bind9

- name: Upload BIND9 config
  uses: actions/upload-artifact@v3
  with:
    name: bind9-config
    path: ./dist/bind9/
```

### With Docker

Build and use in a Docker container:

```dockerfile
FROM node:18-alpine

# Install bindac
RUN npm install -g @markusbansky/bindac

# Copy zone files
COPY zones/ /app/zones/
COPY package.json tsconfig.json /app/

WORKDIR /app

# Install dependencies and compile TypeScript
RUN npm install && \
    npx tsc zones/*.ts --outDir ./compiled --target ES2022 --module ESNext --moduleResolution Node

# Compile zones to BIND9 config
RUN bindac ./compiled/zones/production.js /etc/bind/

# Install and configure BIND9
RUN apk add --no-cache bind
```

## Advanced Usage

### Multiple Zones

Compile multiple zone files:

```bash
# 1. First compile TypeScript files
npx tsc zones/*.ts --outDir ./compiled --target ES2022 --module ESNext --moduleResolution Node

# 2. Then compile each zone with bindac
for zone in compiled/zones/*.js; do
  basename=$(basename "$zone" .js)
  bindac "$zone" "./output/$basename"
done
```

### Conditional Compilation

Use environment variables in your zone files:

```typescript
const isProduction = process.env.NODE_ENV === 'production'

const zone = new ZoneConfigBuilder()
  .setOrigin(isProduction ? 'example.com' : 'dev.example.com')
  .setTTL(isProduction ? 3600 : 300)
  // ... rest of configuration
  .build()

export default zone
```

Compile with:
```bash
# 1. Compile TypeScript with environment variable
NODE_ENV=production npx tsc my-zone.ts --outDir ./compiled --target ES2022 --module ESNext --moduleResolution Node

# 2. Run bindac on compiled JavaScript
NODE_ENV=production bindac ./compiled/my-zone.js ./output
```

## Troubleshooting

### Permission Denied

If you get permission errors:

```bash
# Make sure output directory is writable
chmod 755 ./output
bindac my-zone.ts ./output
```

### Memory Issues

For large zone files:

```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 $(which bindac) large-zone.ts ./output
```

### TypeScript Compilation Issues

If you encounter TypeScript errors in your zone files:

1. Ensure your TypeScript configuration is correct
2. Check that all imports are valid
3. Verify your zone file syntax

## Next Steps

- [Learn Docker deployment](/guide/docker-usage)
- [Explore complex examples](/examples/complex-zone)
- [Understand basic usage patterns](/guide/basic-usage)