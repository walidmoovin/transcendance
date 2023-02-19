NAME = transcendence
USER = gavaniwast

CERT = volumes/ssl/$(NAME).pem

all: clean start

$(CERT):
	openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
	-out $(NAME).pem -keyout $(NAME).pem \
	-subj "/C=FR/ST=Nice/L=Nice/O=42/OU=student/CN=$(NAME)_$(USER)/"
	mkdir -p volumes/ssl
	mv $(NAME).pem volumes/ssl

start: $(CERT)
	BACK_RUN=start docker compose -f docker-compose.yml up --build

debug: $(CERT)
	BUILDKIT_PROGRESS=plain BACK_RUN=start:debug docker compose -f docker-compose.yml up --build

stop:
	docker compose -f docker-compose.yml down

clean: stop
	docker system prune -f

fclean: stop
	docker system prune -af --volumes

re: fclean start
