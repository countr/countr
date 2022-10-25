# compile typescript to normal javascript

FROM node:18-alpine@sha256:7d74f7ef0433aca0c9f646031c84be459fc073d7a095545553a435fe1b1bc01e AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:18-alpine@sha256:7d74f7ef0433aca0c9f646031c84be459fc073d7a095545553a435fe1b1bc01e AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
