# Examples

Explore practical examples of using BINDAC to create DNS zones.

## Overview

This section provides real-world examples of creating DNS zones with BINDAC. Each example demonstrates different concepts and record types commonly used in DNS configurations.

## Quick Reference

| Example | Description | Complexity |
|---------|-------------|------------|
| [Simple Zone](/examples/simple-zone) | Basic zone with essential records | Beginner |
| [Complex Zone](/examples/complex-zone) | Advanced zone with multiple record types | Intermediate |
| [Multiple Zones](/examples/multiple-zones) | Managing multiple domains | Advanced |

## Example Categories

### Basic Examples
- **Simple Zone**: A minimal zone configuration with A and NS records
- **Web Services**: Common web service configurations

### Advanced Examples  
- **Email Setup**: Complete email server DNS configuration
- **CDN Integration**: DNS setup for content delivery networks
- **Subdomain Management**: Organizing complex subdomain structures

### Production Examples
- **High Availability**: DNS configurations for redundant services
- **Geographic Distribution**: DNS for globally distributed applications
- **Security Hardening**: DNS security best practices

## Getting Started

If you're new to BINDAC, start with the [Simple Zone](/examples/simple-zone) example and work your way up to more complex configurations.

Each example includes:
- Complete TypeScript source code
- Generated BIND9 configuration
- Explanation of concepts used
- Testing instructions

## Repository Examples

You can also find example files in the [repository](https://github.com/MarkusBansky/bindac/tree/main/examples):

```bash
git clone https://github.com/MarkusBansky/bindac.git
cd bindac/examples
ls *.ts
```

## Testing Examples

All examples can be compiled and tested:

```bash
# Compile an example
bindac examples/simple-zone.ts ./output

# View the generated configuration
cat ./output/named.conf

# Test with BIND9
named-checkzone example.com ./output/named.conf
```