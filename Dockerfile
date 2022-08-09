# compile typescript to normal javascript

FROM node:16-alpine@sha256:e28958d905390c70b5323906b81121ee664c9b4531a6187b4aa5e73e962cee41 AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:16-alpine@sha256:e28958d905390c70b5323906b81121ee664c9b4531a6187b4aa5e73e962cee41 AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
