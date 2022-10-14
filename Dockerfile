# compile typescript to normal javascript

FROM node:18-alpine@sha256:99086216b9a030dd6d5b2c303e0b94de3d511f6c69b5b529f804bb7f41d4381e AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:18-alpine@sha256:99086216b9a030dd6d5b2c303e0b94de3d511f6c69b5b529f804bb7f41d4381e AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
