ecr=registry.digitalocean.com/yourmumsregistry
.PHONY: docker-build
docker-build: ## - build docker image
	@ docker build -f Dockerfile --platform linux/amd64  -t $(ecr)/aa:latest .

.PHONY: docker-push
docker-push:
	@ docker push $(ecr)/aa:latest