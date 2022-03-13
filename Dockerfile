FROM node:16-alpine
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]