FROM alpine:3.15

RUN apk update && apk upgrade && apk add npm
WORKDIR /var/www/html
ENTRYPOINT npm install && npm run dev
