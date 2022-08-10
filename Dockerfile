# compile typescript to normal javascript

FROM node:16-alpine@sha256:e2423ec956aaee105fd85084c9e5cbbfbc49339a79aaa95b6568e16b3ed6efb3 AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:16-alpine@sha256:e2423ec956aaee105fd85084c9e5cbbfbc49339a79aaa95b6568e16b3ed6efb3 AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
