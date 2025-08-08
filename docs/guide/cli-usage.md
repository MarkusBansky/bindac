# CLI Usage

Master the BINDAC command-line interface for compiling DNS zones.

## Basic Usage

The BINDAC CLI compiles TypeScript zone configurations into BIND9-compatible files:

```bash
bindac <input> <outputDir>
```

- **input**: Path to your TypeScript zone file
- **outputDir**: Directory where BIND9 config will be written

## Examples

### Simple Compilation

```bash
# Compile a zone file
bindac my-zone.ts ./output

# Using npx (if installed locally)
npx bindac my-zone.ts ./output

# Using bunx
bunx bindac my-zone.ts ./output
```

### Different Input Paths

```bash
# Relative path
bindac ./zones/example.ts ./dist

# Absolute path
bindac /home/user/dns/zones/example.ts ./output

# Current directory
bindac zone.ts ./build
```

### Output Directories

The CLI creates the output directory if it doesn't exist:

```bash
# Creates nested directories
bindac my-zone.ts ./output/zones/bind9

# Output to temporary directory
bindac my-zone.ts /tmp/bind9-config
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
  <input>         Path to your IaC TypeScript file exporting a ZoneConfig
  <outputDir>     Output directory for BIND9 config

Options:
  -h, --help      Show this help message

Example:
  bindac ./my-iac.ts ./dist
```

## Input File Requirements

Your TypeScript file must export a `ZoneConfig` as the default export:

```typescript
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
    "build:dns": "bindac zones/production.ts ./dist/bind9",
    "build:dev": "bindac zones/development.ts ./dist/dev",
    "compile:all": "bindac zones/*.ts ./output"
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
- name: Compile DNS zones
  run: |
    npm install -g @markusbansky/bindac
    bindac ./zones/production.ts ./dist/bind9

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

# Compile zones
RUN bindac /app/zones/production.ts /etc/bind/

# Install and configure BIND9
RUN apk add --no-cache bind
```

## Advanced Usage

### Multiple Zones

Compile multiple zone files:

```bash
# Create a script to compile multiple zones
for zone in zones/*.ts; do
  basename=$(basename "$zone" .ts)
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
NODE_ENV=production bindac my-zone.ts ./output
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