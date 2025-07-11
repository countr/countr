FROM node:22-alpine@sha256:10962e8568729b0cfd506170c5a2d1918a2c10ac08c0e6900180b4bac061adc9 AS base
RUN apk --no-cache add g++ make python3

WORKDIR /app
ENV IS_DOCKER=true


# install prod dependencies

FROM base AS deps

# corepack has had issues with pnpm in earlier versions, and since we only use corepack to download pnpm then we can safely use the latest version
RUN \
  npm i -g corepack@latest \
  corepack enable pnpm

COPY pnpm-lock.yaml package.json .npmrc ./
RUN pnpm install --frozen-lockfile --prod


# install all dependencies and build typescript

FROM deps AS ts-builder
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY ./src ./src
RUN pnpm run build


# production image

FROM base
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json .env* ./
COPY --from=ts-builder /app/build ./build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
