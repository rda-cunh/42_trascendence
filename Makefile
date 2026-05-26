# =====================================================================================================
# 										DEPLOYMENT TOOL
# =====================================================================================================
# USAGE:
#   make              - Full deployment (Setup deps -> Sync files -> Run)
#   make dev          - Full deployment and immediately attach to logs
#   make restart      - Restart the containers
#   make restart dev  - Restart the containers and attach to logs
#   make stop         - Stop the containers
#   make status       - Check Docker stats on the target (Local or Remote)
#   make logs         - Attach to logs without redeploying (Specify SERVICE=service_name to filter)
#                         e.g. 'make logs SERVICE=web' to view only the 'web' service logs
#   make clean        - Stop and remove containers, networks, and volumes (Keep images)
#   make fclean       - Stop and remove containers, networks, volumes, images and builder cache
#   make re           - Rebuild and redeploy (Same as clean + all)
#   make fre          - Force rebuild and redeploy (Same as fclean + all)
#   make setup-docker - Install Docker on the target machine (Requires root)
#   make ssh-setup    - Setup SSH keys for remote server access using ssh-copy-id
#                         (Requires root password and 'PermitRootLogin yes' on target)
#   make ssh-wipe     - Dangerous: Wipes all SSH keys from target's root account (Remote only)
#   make purge        - Dangerous: Removes Docker, files, and SSH keys on target
# =====================================================================================================


# =====================================================================================================
# 									   ENVIRONMENT SETUP
# =====================================================================================================
#
# PROJECT_NAME: Name of the project
# COMPOSE_FILE: Path to the docker-compose file (Default: srcs/docker-compose.yaml)
# SERVER: Target server for deployment (Default: local)
# PROJECT_MAKEFILE: Optional project-specific Makefile that can override or extend base targets
# =====================================================================================================


include .env

COMPOSE_FILE ?= srcs/docker-compose.yaml
PROJECT_NAME ?= server
SERVER ?=
PROJECT_MAKEFILE ?= srcs/project.mk
LOAD_ENV = set -a; . .env; set +a;
.DEFAULT_GOAL := all

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

restart: stop run

restart dev: restart logs

re: clean all

fre: fclean all

check-root:
	@if [ "$$(id -u)" -ne 0 ]; then \
		echo "Error: You must run this command as root or with 'sudo'."; \
		exit 1; \
	fi

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

check-docker:
	@$(EXEC) 'if ! command -v docker >/dev/null 2>&1; then \
       printf "\nError: Docker is not installed on $(SERVER).\n"; \
       printf "Please run: sudo make setup-docker\n\n"; \
       exit 1; \
    fi'
	@$(EXEC) 'if ! docker info >/dev/null 2>&1; then \
       printf "\nError: You do not have permission to run Docker on $(SERVER).\n"; \
       printf "Please run with sudo or add your user to the docker group.\n\n"; \
       exit 1; \
    fi'

OS_ID := $(shell . /etc/os-release && echo $$ID)
OS_CODENAME := $(shell . /etc/os-release && echo $$VERSION_CODENAME)

setup-docker: check-root
	@$(EXEC) "if ! command -v docker >/dev/null 2>&1; then \
       apt-get update -o Dir::Etc::sourcelist=\"sources.list\" -o Dir::Etc::sourceparts=\"-\" && \
       apt-get install -y ca-certificates curl && \
       install -m 0755 -d /etc/apt/keyrings && \
       curl -fsSL https://download.docker.com/linux/$(OS_ID)/gpg -o /etc/apt/keyrings/docker.asc && \
       chmod a+r /etc/apt/keyrings/docker.asc && \
       printf \"Types: deb\nURIs: https://download.docker.com/linux/$(OS_ID)\nSuites: $(OS_CODENAME)\nComponents: stable\nSigned-By: /etc/apt/keyrings/docker.asc\n\" | tee /etc/apt/sources.list.d/docker.sources > /dev/null && \
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

run: ssh-check check-docker sync-files
	@$(EXEC) "$(PRE_CMD) $(LOAD_ENV) docker compose --env-file .env -f $(COMPOSE_FILE) up -d"

logs: check-docker
	@$(EXEC) "$(PRE_CMD) $(LOAD_ENV) docker compose --env-file .env -f $(COMPOSE_FILE) logs -f $(SERVICE) || true"

status: check-docker
	@$(EXEC) "$(PRE_CMD) $(LOAD_ENV) \
		printf '\n=== CONTAINERS ===\n' && docker compose --env-file .env -f $(COMPOSE_FILE) ps -a; \
		printf '\n=== IMAGES ===\n' && docker images 2>/dev/null || true; \
		printf '\n=== VOLUMES ===\n' && docker volume ls 2>/dev/null || true; \
		printf '\n=== NETWORKS ===\n' && docker network ls 2>/dev/null || true"

stop: check-docker
	@$(EXEC) "$(PRE_CMD) $(LOAD_ENV) docker compose --env-file .env -f $(COMPOSE_FILE) down"

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

clean: stop
	@$(EXEC) "$(PRE_CMD) $(LOAD_ENV) docker compose --env-file .env -f $(COMPOSE_FILE) down -v"

fclean: stop
	@$(EXEC) "$(PRE_CMD) $(LOAD_ENV) docker compose --env-file .env -f $(COMPOSE_FILE) down -v --rmi all --remove-orphans"
	@$(EXEC) "docker builder prune -af"

purge: fclean uninstall-docker remove-files ssh-wipe

.PHONY: all re fre check-root check-docker ssh-check ssh-setup setup-docker sync-files remove-files run logs status stop uninstall-docker ssh-wipe fclean purge

ifneq ($(wildcard $(PROJECT_MAKEFILE)),)
    include $(PROJECT_MAKEFILE)
endif
