FROM alpine:3.15

RUN apk update && apk upgrade && apk add npm
WORKDIR /var/www/html

ENTRYPOINT npm install; \
  if [[ $NODE_ENV == "production" ]]; then \
    npm run build && npm run preview; \
	elif [[ $NODE_ENV == "development" || $NODE_ENV == "debug" ]]; then \
    npm run dev; \
  else echo "NODE_ENV value isn't known."; \
  fi;
