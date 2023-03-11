FROM alpine:3.15

RUN apk update && apk upgrade && apk add npm

WORKDIR /var/www/html
COPY entrypoint.sh /tmp/entrypoint.sh

COPY ../.env .env

ENTRYPOINT npm install; \
if [[ $NODE_ENV == "production" ]]; then \
  npm run build && npm run preview; \
elif [[ $NODE_ENV == "development" ]]; then \
  npm run dev; \
elif [[ $NODE_ENV == "debug"  ]]; then \
  npm run dev; \
elif [[ $NODE_ENV == "check" ]]; then \
  npm run format && npm run check; echo "=== FINISH ===" \
else echo "Nothing to do for that NODE_ENV context."; \
fi;

