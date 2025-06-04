FROM node:22-bookworm

WORKDIR /frontend

# package.jsonとpackage-lock.jsonをコピー
COPY ./frontend/package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY ./frontend ./

# ポート3000を公開
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
