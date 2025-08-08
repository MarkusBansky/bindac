# BIND9 IaC Library (Bun + TypeScript)

This project lets you define BIND9 DNS server configuration as TypeScript code, compile it to BIND9 config files, and run BIND9 in Docker with your generated config.

## Features
- TypeScript library for BIND9 config as code
- Compile to BIND9 config files
- Docker image to run BIND9 with your config

## Quick Start

1. Install dependencies:
	```sh
	bun install
	```
2. Build the library:
	```sh
	bun run build
	```
3. Compile your IaC to BIND9 config using the CLI:
	```sh
	# With Bun (local dev)
	bun run build:cli
	bunx bindac ./examples/example-zone.ts ./dist

	# Or, after publishing, with npm or Bunx globally:
	npx bindac ./examples/example-zone.ts ./dist
	npmx bindac ./examples/example-zone.ts ./dist
	bunx bindac ./examples/example-zone.ts ./dist
	```
## CLI Usage

After publishing, you can use the CLI directly:

```
npx bindac <input> <outputDir>
# or
npmx bindac <input> <outputDir>
# or
bunx bindac <input> <outputDir>
```

Where `<input>` is your TypeScript IaC file and `<outputDir>` is the output directory for BIND9 config.

4. Build and run the Docker image:
	```sh
	bun run docker:build
	bun run docker:run
	```

## Example
See `examples/example-zone.ts` for a sample zone definition.

## License
MIT



## Publishing a New Version

Before publishing, make sure to compile the CLI:

```sh
bun run build:cli
```

Then follow the usual npm release steps:

1. Make sure you are on the `main` branch and your working directory is clean.
2. Run one of the following commands to bump the version:
	- Patch release: `npm version patch -m "chore(release): %s"`
	- Minor release: `npm version minor -m "chore(release): %s"`
	- Major release: `npm version major -m "chore(release): %s"`
3. Push the commit and tag to GitHub:
	```sh
	git push origin main --follow-tags
	```
4. The GitHub Actions workflow will automatically publish the new version to the GitHub npm registry when a new tag is pushed.

**Note:** You must have permission to push to the `main` branch and publish to the registry.
