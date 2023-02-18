FROM alpine:3.15

RUN apk update && apk upgrade && apk add npm nginx

RUN mkdir -p /var/ssl

WORKDIR /var/www/html
ENTRYPOINT npm install && npm build && npm preview 
