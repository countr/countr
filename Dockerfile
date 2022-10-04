# compile typescript to normal javascript

FROM node:18-alpine@sha256:d4935e4a77d3a9aca897dc3610f7a9abc83732ba4075439fbdb46a517c07d81e AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:18-alpine@sha256:d4935e4a77d3a9aca897dc3610f7a9abc83732ba4075439fbdb46a517c07d81e AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
