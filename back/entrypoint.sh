npm install;
cat >.env <<EOF
POSTGRES_HOST= $POSTGRES_HOST
POSTGRES_PORT= $POSTGRES_PORT
POSTGRES_USER= $POSTGRES_USER
POSTGRES_PASSWORD= $POSTGRES_PASSWORD
POSTGRES_DB= $POSTGRES_DB

BACK_PORT=$BACK_PORT

JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION_TIME_SECONDS=$JWT_EXPIRATION_TIME_SECONDS

FT_OAUTH_CLIENT_ID=$FT_OAUTH_CLIENT_ID
FT_OAUTH_CLIENT_SECRET=$FT_OAUTH_CLIENT_SECRET
FT_OAUTH_CALLBACK_URL=$FT_OAUTH_CALLBACK_URL
EOF

if [[ $NODE_ENV == "production" ]]; then
  npm run build && npm run start:prod;
elif [[ $NODE_ENV == "debug" ]]; then
  npm run start:debug;
elif [[ $NODE_ENV == "check" ]]; then
  npm run format && npm run lint; echo "=== FINISH ===";
elif [[ $NODE_ENV == "development" ]]; then
  npm run dev;
else echo "NODE_ENV value isn't known.";
fi;
