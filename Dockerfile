# compile typescript to normal javascript

FROM node:16-alpine@sha256:88d9d8da697877a4a771a40e5cbc10a12c2ad959e82f3b0f36ef35635e17f693 AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:16-alpine@sha256:88d9d8da697877a4a771a40e5cbc10a12c2ad959e82f3b0f36ef35635e17f693 AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
