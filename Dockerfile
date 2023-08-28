
FROM alpine:3.18

RUN apk add --no-cache nodejs

RUN apk add --no-cache npm && npm install -g pnpm && apk del npm

# Run as user
ARG USER_UID=1000
ARG USER_GID=1000

RUN addgroup -S abc --gid ${USER_GID} && adduser -S abc -G abc --uid ${USER_UID}

USER abc

WORKDIR /app

COPY src ./src
COPY public ./public
COPY package.json pnpm-lock.yaml tsconfig.json vite.config.ts tailwind.config.cjs postcss.config.cjs ./

RUN pnpm install --frozen-lockfile
RUN pnpm build

ARG NODE_ENV=production

EXPOSE 3000

ENTRYPOINT [ "pnpm","start" ]
