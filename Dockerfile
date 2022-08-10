# compile typescript to normal javascript

FROM node:16-alpine@sha256:7f6b81abe71e4de65f09b4ad1913e17fc7f354efbbbcfd35370deaa41d3a07f2 AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:16-alpine@sha256:7f6b81abe71e4de65f09b4ad1913e17fc7f354efbbbcfd35370deaa41d3a07f2 AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
