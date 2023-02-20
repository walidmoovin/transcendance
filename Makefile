NAME = transcendence
USER = gavaniwast

all: clean start

start:
	BACK_RUN=start docker compose -f docker-compose.yml up --build

debug:
	BUILDKIT_PROGRESS=plain BACK_RUN=start:debug docker compose -f docker-compose.yml up --build

stop:
	docker compose -f docker-compose.yml down

clean: stop
	docker system prune -f

fclean: stop
	rm -rf */volumes/node_modules
	docker system prune -af --volumes

re: fclean start
