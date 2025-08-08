#!/usr/bin/env bun

import { generateBind9Config, Bind9Zone } from "../src/index";
import { writeFileSync, mkdirSync, statSync, existsSync } from "fs";
import path from "path";

function printHelp() {
  console.log(
    `bindac - BIND9 IaC Compiler\n\nUsage:\n  bun run bin/compile-bind9.ts <input> <outputDir>\n\nArguments:\n  <input>         Path to your IaC TypeScript file exporting a ZoneConfig\n  <outputDir>     Output directory for BIND9 config\n\nOptions:\n  -h, --help      Show this help message\n\nExample:\n  bun run bin/compile-bind9.ts ./my-iac.ts ./dist\n`
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const input = args[0];
  const outDir = args[1];

  // Validate input file
  if (!existsSync(input) || !statSync(input).isFile()) {
    console.error(`\n⨯ Input file does not exist or is not a file: ${input}`);
    process.exit(1);
  }
  const forbiddenDirs = [
    "/",
    "/etc",
    "/bin",
    "/usr",
    "/lib",
    "/boot",
    "/dev",
    "/proc",
    "/sys",
    "/run",
    "/sbin",
    "/var/log",
    "/var/run",
    "/opt",
    "/root",
  ];
  const resolvedOut = path.resolve(outDir);
  // Allow user directories, tmp, and project-relative paths
  const isUserDir = resolvedOut.startsWith("/home/") && resolvedOut !== "/home";
  const isTmpDir = resolvedOut.startsWith("/tmp/");
  const isProjectRelative = !path.isAbsolute(outDir) || resolvedOut.includes(process.cwd());
  
  if (
    !isUserDir && !isTmpDir && !isProjectRelative &&
    forbiddenDirs.some(
      (dir) => resolvedOut === dir || resolvedOut.startsWith(dir + path.sep)
    )
  ) {
    console.error(`\n⨯ Output directory is forbidden or unsafe: ${outDir}`);
    process.exit(1);
  }

  let zoneConfig;
  try {
    // Dynamic import for user IaC file
    const imported = await import(input.startsWith(".") ? input : `./${input}`);
    zoneConfig = imported.default;
    if (!zoneConfig) throw new Error("No default export found in input file.");
  } catch (err) {
    console.error(`\n⨯ Failed to load IaC file: ${input}`);
    console.error(err);
    process.exit(1);
  }

  try {
    const zones = [new Bind9Zone(zoneConfig)];
    const config = generateBind9Config(zones);
    mkdirSync(resolvedOut, { recursive: true });
    writeFileSync(`${resolvedOut}/named.conf`, config);
    console.log(`\n✔ BIND9 config written to ${resolvedOut}/named.conf`);
  } catch (err) {
    console.error("\n⨯ Failed to compile BIND9 config:");
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

main();
