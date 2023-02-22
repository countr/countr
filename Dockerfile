# base image

FROM node:18-alpine@sha256:3913e8ea6123759eb6b788de317a961727970ce5018ed28b40b2b50113196c31 AS base
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./


# compile typescript to normal javascript

FROM base AS builder
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM base AS final
RUN npm ci --omit=dev

COPY .env? ./.env
COPY --from=builder /app/build ./build

ENV NODE_ENV=production
ENTRYPOINT [ "dumb-init", "npm", "run" ]
CMD [ "start" ]
