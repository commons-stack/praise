#!/bin/bash
docker compose -f ./docker-compose.production.yml pull
docker compose -f ./docker-compose.production.yml down
docker compose -f ./docker-compose.production.yml up -d --remove-orphans