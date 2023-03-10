npm install;
cat >.env <<EOF
VITE_FRONT_FPS=$FRONT_FPS
VITE_HOST=$HOST
VITE_BACK_PORT=$BACK_PORT
EOF

npm install;
if [[ $NODE_ENV == "production" ]]; then
  npm run build && npm run preview;
elif [[ $NODE_ENV == "development" ]]; then
  npm run dev;
elif [[ $NODE_ENV == "debug"  ]]; then
  npm run dev;
elif [[ $NODE_ENV == "check" ]]; then
  npm run format && npm run check; echo "=== FINISH ==="
else echo "Nothing to do for that NODE_ENV context.";
fi;
