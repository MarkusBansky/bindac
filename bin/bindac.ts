#!/usr/bin/env node

import { generateBind9Config, Bind9Zone } from "../dist/index.js";
import { writeFileSync, mkdirSync, statSync, existsSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

function printHelp() {
  console.log(
    `bindac - BIND9 IaC Compiler\n\nUsage:\n  bindac <input> <outputDir>\n\nArguments:\n  <input>         Path to your compiled JavaScript file exporting a ZoneConfig\n  <outputDir>     Output directory for BIND9 config\n\nOptions:\n  -h, --help      Show this help message\n\nExample:\n  # First compile TypeScript to JavaScript\n  npx tsc my-zone.ts --outDir ./compiled --target ES2022 --module ESNext\n  \n  # Then run bindac\n  bindac ./compiled/my-zone.js ./output\n  \n  # Or use the provided example\n  bindac examples/example-zone.js ./output\n\nNote: This tool works with Node.js, Bun, and Deno runtimes.`
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
    // Dynamic import for user IaC file - resolve path from current working directory
    const inputPath = path.resolve(input);
    
    if (inputPath.endsWith('.ts')) {
      // For TypeScript files, recommend compiling first
      console.error('\n⚠ TypeScript files need to be compiled to JavaScript first.');
      console.error('Run: npx tsc ' + input + ' --outDir ./compiled --target ES2022 --module ESNext --moduleResolution Node');
      console.error('Then use: bindac ./compiled/' + path.basename(input, '.ts') + '.js <outputDir>');
      process.exit(1);
    }
    
    const imported = await import(pathToFileURL(inputPath).href);
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
