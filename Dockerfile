FROM node:16-alpine
RUN apk add python3 make gcc g++ dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY ./src ./
COPY tsconfig.json ./
RUN npm run build

COPY . ./

CMD ["dumb-init", "npm", "start"]