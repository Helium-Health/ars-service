###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As build

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# USER node

FROM node:18-alpine as runtime

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --legacy-peer-deps --only=production && npm cache clean --force

COPY . .


COPY --from=build /usr/src/app/dist ./dist
RUN chmod +x ./entrypoint.sh

# USER node

ENV API_PORT=3000

EXPOSE 3000

CMD ./entrypoint.sh
