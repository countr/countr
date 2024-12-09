FROM node:22-alpine@sha256:96cc8323e25c8cc6ddcb8b965e135cfd57846e8003ec0d7bcec16c5fd5f6d39f AS base

WORKDIR /app
ENV IS_DOCKER=true


# install prod dependencies

FROM base AS deps
RUN apk --no-cache add g++ make python3
RUN corepack enable pnpm

COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY package.json .npmrc ./
RUN pnpm install --frozen-lockfile --prod --offline


# install all dependencies and build typescript

FROM deps AS ts-builder
RUN pnpm install --frozen-lockfile --offline

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
