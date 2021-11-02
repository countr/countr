FROM node:16-alpine
RUN apk add python3 make gcc g++ dumb-init

WORKDIR /countr-app
ENV IS_THIS_DOCKER=yes

COPY package*.json ./
RUN npm i

COPY ./src ./
COPY tsconfig.json ./
RUN npm run build

COPY . ./

CMD ["dumb-init", "npm", "start"]