# compile typescript to normal javascript

FROM node:18-alpine@sha256:f829c27f4f7059609e650023586726a126db25aded0c401e836cb81ab63475ff AS builder
RUN apk --no-cache add g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM node:18-alpine@sha256:f829c27f4f7059609e650023586726a126db25aded0c401e836cb81ab63475ff AS final
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./
RUN npm ci --only=production

COPY .env ./.env
COPY --from=builder /app/build ./build

CMD ["dumb-init", "npm", "start"]
