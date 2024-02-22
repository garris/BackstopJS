#!/usr/bin/env bash
echo starting a fire
set -e
set -o errexit

docker stop `docker ps -qa` > /dev/null 2>&1; ## Stop all running containers
docker buildx stop; ## Stop the buildx builder
docker system prune --all --force --volumes; ## Remove all volumes, images, and containers
docker buildx rm --all-inactive --force; ## Remove all buildx builders
docker buildx prune --all --force; ## Prune buildx builder caches

echo builders are burned
