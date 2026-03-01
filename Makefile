# ======================================================================================
# TRANSCENDENCE DEPLOYMENT TOOL
# ======================================================================================
# USAGE:
#   make              - Full deployment (Setup deps -> Sync files -> Run)
#   make dev          - Full deployment and immediately attach to logs
#   make stop         - Stop the containers
#   make status       - Check Docker stats on the target (Local or Remote)
#   make logs         - Attach to logs without redeploying
#   make re           - Rebuild and redeploy (Same as fclean + all)
#   make ssh-setup    - Setup SSH keys for remote server access using ssh-copy-id
#                         (Requires root password and 'PermitRootLogin yes' on target)
#   make ssh-wipe     - Dangerous: Wipes all SSH keys from target's root account
#   make purge        - Dangerous: Nukes Docker, files, and SSH keys on target
# ======================================================================================

include .env

ifeq ($(strip $(SERVER)),)
    EXEC = bash -c
    COPY = null
    PRE_CMD =
    SERVER = local
else
    EXEC = ssh -t -q -o StrictHostKeyChecking=no root@$(strip $(SERVER))
    COPY = scp -r . root@$(strip $(SERVER)):/tmp/$(PROJECT_NAME)
    PRE_CMD = cd /tmp/$(PROJECT_NAME) &&
endif

all: run

dev: all logs

re: fclean all

check-root:
	@if [ "$$(id -u)" -ne 0 ]; then \
		echo "Error: This Makefile must be run as root priviliges."; \
		exit 1; \
	fi

check-env:
	@if [ -z "$(PROJECT_NAME)" ]; then echo "Error: PROJECT_NAME not set"; exit 1; fi
	@if [ -z "$(COMPOSE_FILE)" ]; then echo "Error: COMPOSE_FILE not set"; exit 1; fi

ssh-check:
	@if [ "$(SERVER)" != "local" ]; then \
		if ! ssh -q -o BatchMode=yes -o ConnectTimeout=3 -o StrictHostKeyChecking=no root@$(SERVER) "exit" 2>/dev/null; then \
			printf "\nSSH connection failed to $(SERVER).\n"; \
			printf "Manually copy your public key to the remote machine root account (/root/.ssh/authorized_keys)\n"; \
			printf "or ensure 'PermitRootLogin yes' is set in the remote SSH config\n"; \
			printf "and run 'sudo make ssh-setup' to provide the root password.\n\n"; \
			exit 1; \
		fi \
	fi

ssh-setup:
	@if [ "$(SERVER)" != "local" ]; then \
		if [ ! -f ~/.ssh/id_rsa ]; then \
			ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""; \
		fi; \
		ssh-copy-id -i ~/.ssh/id_rsa.pub root@$(SERVER); \
	fi

setup-deps:
	@$(EXEC) "if ! command -v docker >/dev/null 2>&1; then \
		apt-get update && \
		apt-get install -y ca-certificates curl && \
		install -m 0755 -d /etc/apt/keyrings && \
		curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
		chmod a+r /etc/apt/keyrings/docker.asc && \
		printf \"Types: deb\nURIs: https://download.docker.com/linux/debian\nSuites: \$$(. /etc/os-release && echo \"\$$VERSION_CODENAME\")\nComponents: stable\nSigned-By: /etc/apt/keyrings/docker.asc\n\" | tee /etc/apt/sources.list.d/docker.sources > /dev/null && \
		apt-get update && \
		apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin; \
	fi"

sync-files: remove-files
	@if [ "$(SERVER)" != "local" ]; then \
		$(EXEC) "mkdir -p /tmp/$(PROJECT_NAME)"; \
		$(COPY); \
	fi

remove-files:
	@if [ "$(SERVER)" != "local" ]; then \
  		$(EXEC) "rm -rf /tmp/$(PROJECT_NAME)"; \
	fi

run: check-root check-env ssh-check setup-deps sync-files
	@$(EXEC) "$(PRE_CMD) docker compose --env-file .env -f $(COMPOSE_FILE) up -d"

logs: check-root
	@$(EXEC) "$(PRE_CMD) docker compose --env-file .env -f $(COMPOSE_FILE) logs -f || true"

status: check-root
	@$(EXEC) "$(PRE_CMD) \
		printf '\n=== CONTAINERS ===\n' && docker compose -f $(COMPOSE_FILE) ps -a; \
		printf '\n=== IMAGES ===\n' && docker images 2>/dev/null || true; \
		printf '\n=== VOLUMES ===\n' && docker volume ls 2>/dev/null || true; \
		printf '\n=== NETWORKS ===\n' && docker network ls 2>/dev/null || true"

stop: check-root
	@$(EXEC) "$(PRE_CMD) docker compose --env-file .env -f $(COMPOSE_FILE) down"

uninstall-docker: check-root
	@$(EXEC) "apt-get remove -y docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc || true"
	@$(EXEC) "apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"
	@$(EXEC) "rm -rf /var/lib/docker /etc/apt/keyrings/docker.asc"

ssh-wipe: check-root
	@if [ "$(SERVER)" != "local" ]; then \
		echo "⚠️  WARNING: This will remove authorized_keys on $(SERVER)."; \
	    read -p "Are you sure you want to proceed? [y/N] " ans; \
		if [ "$$ans" = "y" ] || [ "$$ans" = "Y" ]; then \
			$(EXEC) "[ -f ~/.ssh/authorized_keys ] && rm ~/.ssh/authorized_keys || echo 'No keys found to delete.'"; \
		else echo "Wipe cancelled."; \
		fi \
	fi

fclean: stop
	@$(EXEC) "$(PRE_CMD) docker compose --env-file .env -f $(COMPOSE_FILE) down -v --rmi all --remove-orphans"

purge: fclean uninstall-docker remove-files ssh-wipe

.PHONY: all re check-root check-env ssh-check ssh-setup setup-deps sync-files remove-files run logs status stop uninstall-docker ssh-wipe fclean purge
