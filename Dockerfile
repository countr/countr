# compile typescript to normal javascript

FROM node:18-alpine@sha256:d74a0806291538913c808aef1a7b5bb8281a3d6a33b92a8c61926283ec069e1b AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:18-alpine@sha256:d74a0806291538913c808aef1a7b5bb8281a3d6a33b92a8c61926283ec069e1b AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
