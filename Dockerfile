# compile typescript to normal javascript

FROM node:16-alpine@sha256:afa007fd9ed55e78a01998d79197c5f2d586b806ed031a595f4fbb25db03a607 AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:16-alpine@sha256:afa007fd9ed55e78a01998d79197c5f2d586b806ed031a595f4fbb25db03a607 AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
