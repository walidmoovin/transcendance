FROM alpine:3.15

RUN apk update && apk upgrade && apk add npm \
  && npm install -g @nestjs/cli

WORKDIR /var/www/html
ENTRYPOINT npm install; \
  if [[ $NODE_ENV == "production" ]]; then \
    npm run build && npm run start:prod; \
  elif [[ $NODE_ENV == "debug" ]]; then \
    npm run test:debug; \
  elif [[ $NODE_ENV == "development" ]]; then \
    npm run dev; \
  else echo "NODE_ENV value isn't known."; \
  fi;
