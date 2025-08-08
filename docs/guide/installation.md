# Installation

Learn how to install BINDAC in different environments and with different package managers.

## Package Managers

BINDAC is available on GitHub Packages and can be installed using any Node.js package manager.

### npm

```bash
# Install from GitHub Packages
npm install @markusbansky/bindac

# Or install globally for CLI access
npm install -g @markusbansky/bindac
```

### yarn

```bash
# Install locally
yarn add @markusbansky/bindac

# Or install globally
yarn global add @markusbansky/bindac
```

### bun

```bash
# Install locally
bun add @markusbansky/bindac

# Or install globally
bun add -g @markusbansky/bindac
```

## Registry Configuration

BINDAC is published to GitHub Packages. You may need to configure your package manager to use the GitHub registry:

### .npmrc Configuration

Create or update your `.npmrc` file:

```ini
@markusbansky:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

You'll need a GitHub Personal Access Token with `read:packages` permission.

### Environment Variables

Set your GitHub token:

```bash
export GITHUB_TOKEN=your_personal_access_token
```

## Verification

Verify your installation by checking the version:

```bash
# If installed globally
bindac --help

# If installed locally
npx bindac --help

# Or with bun
bunx bindac --help
```

You should see the help output:

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

## Requirements

### System Requirements

- **Node.js**: 18.0.0 or higher
- **Bun**: 1.0.0 or higher (if using Bun)
- **Operating System**: Linux, macOS, or Windows

### TypeScript Setup

BINDAC works with any TypeScript setup. If you don't have TypeScript installed:

```bash
# Install TypeScript globally
npm install -g typescript

# Or locally in your project
npm install --save-dev typescript
```

### Docker (Optional)

For Docker usage, you'll need:

- **Docker**: 20.0.0 or higher
- **Docker Compose**: 2.0.0 or higher (for complex setups)

## Troubleshooting

### Authentication Issues

If you encounter authentication errors:

1. Verify your GitHub token has `read:packages` permission
2. Check your `.npmrc` configuration
3. Ensure the token is set in your environment

### Permission Errors

If you get permission errors during global installation:

```bash
# Use npm with prefix
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Then install globally
npm install -g @markusbansky/bindac
```

### TypeScript Errors

If you encounter TypeScript compilation errors:

1. Ensure you have TypeScript 5.0+ installed
2. Check your `tsconfig.json` configuration
3. Try running with `--skipLibCheck` flag

## Next Steps

Once installed, you can:

- [Create your first zone](/guide/getting-started)
- [Learn basic usage patterns](/guide/basic-usage)
- [Explore the CLI features](/guide/cli-usage)