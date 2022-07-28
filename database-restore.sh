#!/bin/bash
if ! test  -f "$1" ; then
  echo "Could not find database backup"
  echo "Usage: database-restore.sh filename\n"
fi
export $(grep -v '^#' .env | xargs)
docker compose -f ./docker-compose.production.yml down
docker volume rm $(docker volume ls -q)
docker compose -f ./docker-compose.production.yml up mongodb -d --remove-orphans
docker exec -i mongodb-praise sh -c 'mongorestore --authenticationDatabase admin -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --nsInclude=praise_db.* --archive' < $1
docker compose -f ./docker-compose.production.yml up -d --remove-orphans