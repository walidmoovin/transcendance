NAME = transcendence
USER = gavaniwast

all: clean dev

prod:
	NODE_ENV="production" docker compose -f docker-compose.yml up --build

dev:
	NODE_ENV="development" docker compose -f docker-compose.yml up --build

check:
	NODE_ENV="check" docker compose -f docker-compose.yml run back --build
	NODE_ENV="check" docker compose -f docker-compose.yml run front --build
	docker compose -f docker-compose.yml down
	
debug:
	NODE_ENV="debug" BUILDKIT_PROGRESS=plain docker compose -f docker-compose.yml up --build

stop:
	docker compose -f docker-compose.yml down

clean: stop
	docker system prune -f

fclean: stop
	rm -rf */volume/node_modules
	docker system prune -af --volumes

re: fclean dev

.PHONY: all prod dev check debug stop clean fclean re 
