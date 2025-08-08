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
3. Compile your IaC to BIND9 config:
	```sh
	bun run compile:bind9
	```
4. Build and run the Docker image:
	```sh
	bun run docker:build
	bun run docker:run
	```

## Example
See `examples/example-zone.ts` for a sample zone definition.

## License
MIT
