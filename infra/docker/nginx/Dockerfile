# ====================================
# base
# ====================================
FROM nginx:1.27 AS base

SHELL ["/bin/bash", "-oeux", "pipefail", "-c"]
WORKDIR /var/www/backend

ENV TZ=UTC

ARG UID ${UID}
ARG GID ${GID}

# COPY ./backend/public /var/www/backend/public

RUN <<EOF
  groupmod -g $GID nginx
  usermod -u $UID nginx
  chown -R nginx:nginx /var/cache/nginx/ \
    /var/run/ \
    /var/log/nginx/ \
    /var/www/backend
EOF

# ====================================
# local
# ====================================
FROM base AS local

COPY ./infra/docker/nginx/default.local.conf /etc/nginx/conf.d/default.conf

USER nginx