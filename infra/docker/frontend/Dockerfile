FROM node:lts-bookworm AS node

WORKDIR /frontend

COPY ./frontend/package.json ./frontend/package-lock.json ./

RUN npm install

COPY ./frontend ./

CMD ["npm", "run", "dev"]