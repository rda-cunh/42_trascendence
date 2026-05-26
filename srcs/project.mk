# =====================================================================================================
# TRANSCENDENCE DEPLOYMENT TOOL
# =====================================================================================================
# USAGE:
#   make database-backup              - Create a timestamped backup of the database and images
#   make database-backup NAME=name    - Create/update a named backup pair
#   make database-restore             - Restore the database and images from a backup
#   make database-restore NAME=name   - Restore directly from a named backup pair
#   make backend                      - Build and run the backend service
# =====================================================================================================

DATABASE_PATH = ./srcs/database
BACKUP_PATH = $(DATABASE_PATH)/db/backup
IMAGE_CONTAINER_NAME = image-service
IMAGE_STORAGE_PATH = /data/images

# Make a backup pair: database dump + image archive
database-backup:
	@mkdir -p "$(BACKUP_PATH)"; \
	if [ -n "$(NAME)" ]; then \
		base_name="$(NAME)"; \
	else \
		base_name="$(DB_NAME)_$$(date +%Y%m%d_%H%M%S)"; \
	fi; \
	sql_file="$(BACKUP_PATH)/$$base_name.sql"; \
	img_file="$(BACKUP_PATH)/$$base_name.images.tar.gz"; \
	if [ -f "$$sql_file" ] || [ -f "$$img_file" ]; then \
		printf "Backup '%s' already exists. Overwrite? [y/N] " "$$base_name"; \
		read confirm; \
		if [ "$$confirm" != "y" ] && [ "$$confirm" != "Y" ]; then \
			echo "Backup cancelled."; \
			exit 1; \
		fi; \
	fi; \
	echo "Creating database backup: $$sql_file"; \
	$(EXEC) "$(PRE_CMD) set -a; . .env; set +a; docker exec -e MYSQL_PWD=$(DB_ROOT_PASSWORD) $(DB_CONTAINER_NAME) mysqldump -u root $(DB_NAME)" > "$$sql_file"; \
	echo "Creating image backup: $$img_file"; \
	$(EXEC) "$(PRE_CMD) set -a; . .env; set +a; docker exec $(IMAGE_CONTAINER_NAME) tar -C $(IMAGE_STORAGE_PATH) -czf - ." > "$$img_file"; \
	echo "Backup completed."

# Select a backup to restore: database dump + matching image archive
database-restore:
	@files=$$(find "$(BACKUP_PATH)" -maxdepth 1 -type f -name '*.sql' -printf '%f\n' | sort -r); \
	if [ -z "$$files" ]; then \
		echo "No SQL backups found in $(BACKUP_PATH)"; \
		exit 1; \
	fi; \
	if [ -n "$(NAME)" ]; then \
		base_name="$(NAME)"; \
		file="$$base_name.sql"; \
	else \
		echo "Available backups:"; \
		echo "$$files"; \
		echo ""; \
		printf "Backup file (.sql): "; \
		read file; \
		base_name="$${file%.sql}"; \
	fi; \
	sql_path="$(BACKUP_PATH)/$$base_name.sql"; \
	img_path="$(BACKUP_PATH)/$$base_name.images.tar.gz"; \
	if [ ! -f "$$sql_path" ]; then \
		echo "SQL backup does not exist: $$(basename "$$sql_path")"; \
		exit 1; \
	fi; \
	if [ ! -f "$$img_path" ]; then \
		echo "Matching image backup does not exist: $$(basename "$$img_path")"; \
		exit 1; \
	fi; \
	echo "Restoring database from $$(basename "$$sql_path")..."; \
	$(EXEC) "$(PRE_CMD) set -a; . .env; set +a; docker exec -i -e MYSQL_PWD=$(DB_ROOT_PASSWORD) $(DB_CONTAINER_NAME) mysql -u root $(DB_NAME)" < "$$sql_path"; \
	echo "Restoring images from $$(basename "$$img_path")..."; \
	$(EXEC) "$(PRE_CMD) set -a; . .env; set +a; docker exec -i $(IMAGE_CONTAINER_NAME) sh -c 'find $(IMAGE_STORAGE_PATH) -mindepth 1 -delete && tar -C $(IMAGE_STORAGE_PATH) -xzf -'" < "$$img_path"; \
	echo "Restore completed."

backend:
	@$(EXEC) "$(PRE_CMD) $(LOAD_ENV) docker compose --env-file .env -f $(COMPOSE_FILE) up --build backend"

.phony: database-backup database-restore backend