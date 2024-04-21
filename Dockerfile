FROM node:lts-bullseye-slim

WORKDIR /app

COPY package*.json ./
COPY .yarn .yarn
COPY .yarnrc.yml ./
COPY yarn.lock ./

RUN yarn

COPY src ./src
COPY tsconfig.json ./
COPY next.config.mjs ./
COPY next-env.d.ts ./
COPY public ./public

RUN yarn next build

CMD ["/app/node_modules/.bin/next", "start"]