# compile typescript to normal javascript

FROM node:18-alpine@sha256:38f184d0c4fb07836f9408af0f6b493c54da862f49532ab9ca8d282488587749 AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:18-alpine@sha256:38f184d0c4fb07836f9408af0f6b493c54da862f49532ab9ca8d282488587749 AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
