# ====================================
# base
# ====================================
FROM php:8.3-fpm AS base

# timezone environment
ENV TZ=UTC \
  # locale
  LANG=en_US.UTF-8 \
  LANGUAGE=en_US:en \
  LC_ALL=en_US.UTF-8

ARG USER_NAME ${USER_NAME}
ARG UID ${UID}
ARG GID ${GID}

# ユーザー作成
RUN groupadd -g $GID $USER_NAME && \
    useradd -m -s /bin/bash -u $UID -g $GID $USER_NAME

# ====================================
# local
# ====================================
FROM base AS local

WORKDIR /var/www/backend

RUN apt-get update && apt-get install -y --no-install-recommends \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libwebp-dev \
    libgd-dev \
    git \
    vim \
    unzip \
    locales \
    make \
    && locale-gen en_US.UTF-8 \
    && localedef -f UTF-8 -i en_US en_US.UTF-8 \
    && docker-php-ext-configure gd \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install \
        pdo_mysql \
        zip \
        bcmath \
        gd \
        exif

COPY ./infra/docker/backend/php.local.ini /usr/local/etc/php/php.ini
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

RUN chown -R $USER_NAME:$USER_NAME /var/www/backend

USER $USER_NAME