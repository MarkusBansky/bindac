# syntax=docker/dockerfile:1
FROM ubuntu:24.04

RUN apt-get update && \
    apt-get install -y bind9 bind9utils && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /etc/bind

COPY ../dist/bind9/named.conf /etc/bind/named.conf
COPY entrypoint.sh /entrypoint.sh

EXPOSE 53/udp

ENTRYPOINT ["/entrypoint.sh"]
