// src/index.ts
class Bind9Zone {
  config;
  constructor(config) {
    this.config = config;
  }
  toBindConfig() {
    const lines = [
      `$ORIGIN ${this.config.origin}.`,
      this.config.ttl ? `$TTL ${this.config.ttl}` : undefined,
      ...this.config.records.map((r) => `${r.name}	${r.ttl ? r.ttl + " " : ""}IN	${r.type}	${r.value}`)
    ].filter(Boolean);
    return lines.join(`
`);
  }
}
function generateBind9Config(zones) {
  return zones.map((z) => z.toBindConfig()).join(`

`);
}
export {
  generateBind9Config,
  Bind9Zone
};
