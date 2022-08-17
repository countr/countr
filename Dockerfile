# compile typescript to normal javascript

FROM node:16-alpine@sha256:f94079d73e46f76a250240f4d943f87998123d4b89b38a21407f1bdfa7b3e750 AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:16-alpine@sha256:f94079d73e46f76a250240f4d943f87998123d4b89b38a21407f1bdfa7b3e750 AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
