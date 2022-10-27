# compile typescript to normal javascript

FROM node:18-alpine@sha256:425697ebaacf068407fb64373b30276943e434e3dd99162f8472a3d1f3c228a5 AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:18-alpine@sha256:425697ebaacf068407fb64373b30276943e434e3dd99162f8472a3d1f3c228a5 AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
