#!/bin/bash
echo
echo "⚠ Running this script will delete ALL Praise data!"  
read -p "Are you sure? (N/y) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo
  echo "Shutting down containers..."
  echo
  docker compose -f ./docker-compose.production.yml down
  echo
  echo "Deleting images..."
  echo
  docker rmi -f $(docker images -aq)
  echo
  echo "Deleting volumes..."
  echo
  docker volume rm $(docker volume ls -q)
fi
