FROM node:12-alpine AS base
WORKDIR /app
COPY package.json yarn.lock .npmrc /app/

FROM base AS build
ARG NPM_TOKEN
RUN yarn --pure-lockfile --prod
RUN rm .npmrc

FROM base
COPY --from=build /app/node_modules ./node_modules
COPY . /app/
EXPOSE 3000
CMD ["node", "/app/bin/www"]
