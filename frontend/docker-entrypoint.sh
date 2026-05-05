#!/bin/sh

# Replace environment variables in nginx config if needed
# This script allows runtime environment variable injection

cat > /usr/share/nginx/html/env-config.js << EOF
window._env_ = {
  REACT_APP_API_URL: "${REACT_APP_API_URL:-}",
  REACT_APP_WS_URL: "${REACT_APP_WS_URL:-}",
  REACT_APP_ENVIRONMENT: "${REACT_APP_ENVIRONMENT:-}"
};
EOF

# Execute the command passed to docker run
exec "$@"