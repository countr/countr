# compile typescript to normal javascript

FROM node:16-alpine@sha256:c9f2ec65f312d3f253c58ca1f0981bd81a53ac6936b2d66dd824eca526a0db61 AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:16-alpine@sha256:c9f2ec65f312d3f253c58ca1f0981bd81a53ac6936b2d66dd824eca526a0db61 AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
