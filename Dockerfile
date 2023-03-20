FROM node:12-alpine AS base
WORKDIR /app
COPY package.json yarn.lock /app/

FROM base AS build
RUN yarn --pure-lockfile --prod

FROM base
COPY --from=build /app/node_modules ./node_modules
COPY . /app/
EXPOSE 3000
CMD ["node", "/app/bin/www"]
