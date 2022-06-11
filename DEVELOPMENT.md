# Development Docs

### Manually Backup and Restore Database

Replace DB_ROOT_USER, DB_ROOT_PASSWORD, and BACKUP_DATE in the following commands:

**Backup**
docker exec -i mongodb-praise /usr/bin/mongodump --authenticationDatabase admin --archive -u DB_ROOT_USER -p DB_ROOT_PASSWORD --db praise_db > database-backup-$(date -I).archive


**Restore**
```
docker exec -i mongodb-praise sh -c 'mongorestore --authenticationDatabase admin -u DB_ROOT_USER -p DB_ROOT_PASSWORD --db praise_db --archive' < database-backup-BACKUP_DATE.archive
```