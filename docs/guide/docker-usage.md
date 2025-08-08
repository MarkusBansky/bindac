# Docker Usage

Deploy BIND9 with your compiled DNS zones using Docker.

## Overview

BINDAC includes a pre-built Docker image that runs BIND9 with your compiled DNS configurations. This makes it easy to deploy your DNS server in any container environment.

## Quick Start

### 1. Compile Your Zones

First, compile your TypeScript zones to BIND9 format:

```bash
bindac my-zone.ts ./bind9-config
```

### 2. Run with Docker

Mount your compiled configuration and run BIND9:

```bash
docker run --rm -p 53:53/udp \
  -v $(pwd)/bind9-config:/etc/bind \
  bindac:latest
```

Your DNS server is now running on port 53!

## Building the Docker Image

### From Repository

Build the image from the BINDAC repository:

```bash
git clone https://github.com/MarkusBansky/bindac.git
cd bindac
docker build -t bindac:latest ./docker
```

### Custom Dockerfile

Create your own Dockerfile based on BINDAC:

```dockerfile
FROM alpine:latest

# Install BIND9
RUN apk add --no-cache bind bind-tools

# Copy your compiled zones
COPY ./zones/ /etc/bind/

# Create necessary directories
RUN mkdir -p /var/cache/bind /var/lib/bind /var/log/bind

# Set permissions
RUN chown -R named:named /var/cache/bind /var/lib/bind /var/log/bind /etc/bind

# Expose DNS port
EXPOSE 53/udp 53/tcp

# Start BIND9
CMD ["named", "-g", "-c", "/etc/bind/named.conf"]
```

## Configuration Examples

### Basic Setup

For a simple DNS server with one zone:

```bash
# 1. Create zone file
cat > my-zone.ts << 'EOF'
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
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.NS)
      .setValue('ns1.example.com.')
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.A)
      .setValue('192.0.2.1')
      .build()
  )
  .build()

export default zone
EOF

# 2. Compile zone
bindac my-zone.ts ./dns-config

# 3. Run Docker container
docker run -d --name my-dns \
  -p 53:53/udp \
  -v $(pwd)/dns-config:/etc/bind \
  bindac:latest
```

### Multiple Zones

For multiple zones, create a directory structure:

```
zones/
├── example.com.ts
├── test.com.ts
└── dev.local.ts

compiled/
├── example.com/
│   └── named.conf
├── test.com/
│   └── named.conf
└── dev.local/
    └── named.conf
```

Compile all zones:
```bash
for zone in zones/*.ts; do
  basename=$(basename "$zone" .ts)
  mkdir -p "compiled/$basename"
  bindac "$zone" "compiled/$basename"
done
```

## Docker Compose

### Simple Setup

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  dns:
    build: ./docker
    ports:
      - "53:53/udp"
      - "53:53/tcp"
    volumes:
      - ./bind9-config:/etc/bind:ro
    restart: unless-stopped
    networks:
      - dns-network

networks:
  dns-network:
    driver: bridge
```

Run with:
```bash
docker-compose up -d
```

### Advanced Setup with Logging

```yaml
version: '3.8'

services:
  dns:
    build: ./docker
    ports:
      - "53:53/udp"
      - "53:53/tcp"
    volumes:
      - ./bind9-config:/etc/bind:ro
      - dns-logs:/var/log/bind
      - dns-cache:/var/cache/bind
    environment:
      - BIND_LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "dig", "@localhost", "example.com"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - dns-network

  dns-admin:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - dns-logs:/var/log/bind:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - dns
    networks:
      - dns-network

volumes:
  dns-logs:
  dns-cache:

networks:
  dns-network:
    driver: bridge
```

## Environment Variables

Configure BIND9 behavior with environment variables:

```bash
docker run -e BIND_LOG_LEVEL=debug \
  -e BIND_QUERY_LOG=yes \
  -p 53:53/udp \
  -v $(pwd)/config:/etc/bind \
  bindac:latest
```

Available variables:
- `BIND_LOG_LEVEL`: debug, info, warning, error
- `BIND_QUERY_LOG`: yes/no for query logging
- `BIND_FORWARDERS`: Comma-separated list of DNS forwarders

## Networking

### Bridge Network

Default Docker networking works for most use cases:

```bash
docker network create dns-net
docker run --network dns-net \
  -p 53:53/udp \
  -v $(pwd)/config:/etc/bind \
  bindac:latest
```

### Host Network

For direct access to host networking:

```bash
docker run --network host \
  -v $(pwd)/config:/etc/bind \
  bindac:latest
```

### Custom Network

For integration with other services:

```bash
# Create custom network
docker network create --subnet=172.20.0.0/16 dns-network

# Run DNS server
docker run --network dns-network \
  --ip 172.20.0.10 \
  -p 53:53/udp \
  -v $(pwd)/config:/etc/bind \
  bindac:latest
```

## Monitoring and Logging

### View Logs

```bash
# Container logs
docker logs my-dns

# Follow logs
docker logs -f my-dns

# BIND9 logs (if mounted)
tail -f ./logs/bind.log
```

### Health Checks

Test your DNS server:

```bash
# Test from host
dig @localhost example.com

# Test from another container
docker run --rm alpine:latest \
  sh -c "apk add --no-cache bind-tools && dig @dns_container_ip example.com"
```

### Metrics Collection

Integrate with Prometheus:

```yaml
services:
  dns:
    build: ./docker
    # ... other config
    
  dns-exporter:
    image: prometheuscommunity/bind-exporter
    command:
      - '--bind.pid-file=/var/run/named/named.pid'
      - '--bind.timeout=10s'
      - '--web.listen-address=0.0.0.0:9119'
    volumes:
      - /var/run/named:/var/run/named:ro
    ports:
      - "9119:9119"
    depends_on:
      - dns
```

## Production Deployment

### Security Considerations

1. **Non-root user**: Run BIND9 as named user
2. **Read-only volumes**: Mount config as read-only
3. **Resource limits**: Set memory and CPU limits
4. **Network policies**: Restrict network access

```yaml
services:
  dns:
    build: ./docker
    user: named
    read_only: true
    volumes:
      - ./config:/etc/bind:ro
      - dns-tmp:/tmp
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    security_opt:
      - no-new-privileges:true
```

### High Availability

Deploy multiple instances behind a load balancer:

```yaml
services:
  dns-primary:
    build: ./docker
    volumes:
      - ./config:/etc/bind:ro
    networks:
      - dns-net
      
  dns-secondary:
    build: ./docker
    volumes:
      - ./config:/etc/bind:ro
    networks:
      - dns-net
      
  load-balancer:
    image: haproxy:alpine
    ports:
      - "53:53/udp"
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    depends_on:
      - dns-primary
      - dns-secondary
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure port 53 isn't already in use
2. **Permission errors**: Check file permissions on mounted volumes
3. **Config errors**: Validate your BIND9 configuration

### Debug Mode

Run in debug mode to see detailed logs:

```bash
docker run --rm -it \
  -e BIND_LOG_LEVEL=debug \
  -v $(pwd)/config:/etc/bind \
  bindac:latest
```

### Container Shell Access

Access the running container:

```bash
docker exec -it my-dns sh
```

## Next Steps

- [Explore complex examples](/examples/complex-zone)
- [Learn about basic usage patterns](/guide/basic-usage)
- [Review CLI options](/guide/cli-usage)