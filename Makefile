NAME = transcendence
USER = gavaniwast

all: clean dev

dev:
	docker-compose up --build

stop:
	docker-compose down

clean: stop
	docker system prune -f

fclean: stop
	rm -rf postgres
	rm -rf back/volumes/avatars
	rm -rf */node_modules
	docker system prune -af --volumes

re: fclean dev

.PHONY: all dev stop clean fclean re 
