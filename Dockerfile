# compile typescript to normal javascript

FROM node:16-alpine@sha256:c306330f5837c0cc058dadb0165df76f8179078c961539cc73c1dc08a9f30e8e AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:16-alpine@sha256:c306330f5837c0cc058dadb0165df76f8179078c961539cc73c1dc08a9f30e8e AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
