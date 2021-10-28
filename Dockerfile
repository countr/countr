FROM node:16-alpine
RUN apk add python3 make gcc g++ dumb-init

ENV IS_THIS_DOCKER=yes

COPY package*.json .
RUN npm i

COPY . .
RUN npm run build

CMD ["dumb-init", "npm", "start"]