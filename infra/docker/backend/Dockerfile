# ====================================
# base
# ====================================
FROM php:8.4-fpm-alpine3.21 AS base

# timezone environment
ENV TZ=UTC \
  # locale
  LANG=en_US.UTF-8 \
  LANGUAGE=en_US:en \
  LC_ALL=en_US.UTF-8

ARG USER_NAME ${USER_NAME}
ARG UID ${UID}
ARG GID ${GID}

RUN apk add --no-cache bash

RUN addgroup -g $GID $USER_NAME && \
    adduser -s /bin/bash -D -u $UID -G $USER_NAME $USER_NAME

# ====================================
# local
# ====================================
FROM base AS local

WORKDIR /var/www/backend

RUN apk add --no-cache \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    libpng-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    git \
    vim

RUN docker-php-ext-configure gd \
        --with-freetype=/usr/include/ \
        --with-jpeg=/usr/include/ && \
    docker-php-ext-install \
    pdo_mysql \
    zip \
    bcmath \
    gd

COPY ./infra/docker/backend/php.local.ini /usr/local/etc/php/php.ini
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

RUN chown -R $USER_NAME:$USER_NAME /var/www/backend

USER $USER_NAME