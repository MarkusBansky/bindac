#!/bin/sh
set -e

# Start BIND9 with the generated config
echo "Starting BIND9 with config at /etc/bind/named.conf"
exec named -g -c /etc/bind/named.conf
