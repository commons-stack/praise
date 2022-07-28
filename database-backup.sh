#!/bin/bash
export $(grep -v '^#' .env | xargs)
docker exec -i mongodb-praise /usr/bin/mongodump --authenticationDatabase admin --archive -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --db praise_db > database-backup-$(date +"%F-%T").archive