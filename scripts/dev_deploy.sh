#!/bin/bash

set -e

cd "$(git rev-parse --show-toplevel)"
git pull origin dev
docker pull hngtechie/telex:dev
docker compose --project-name telex-dev -f docker/development/docker-compose.yml up -d