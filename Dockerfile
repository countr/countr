FROM node:22-alpine@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS base

WORKDIR /app
ENV IS_DOCKER=true


# install prod dependencies

FROM base AS deps
RUN apk --no-cache add g++ make python3

# corepack has had issues with pnpm in earlier versions, and since we only use corepack to download pnpm then we can safely use the latest version
RUN npm i -g corepack@latest && corepack enable pnpm

COPY package.json pnpm-*.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod


# install all dependencies and build typescript

FROM deps AS ts-builder
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY ./src ./src
RUN pnpm run build


# production image

FROM base

COPY --from=deps /app/node_modules ./node_modules
COPY --from=ts-builder /app/build ./build

ENV NODE_ENV=production
COPY package.json .env* ./
ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
