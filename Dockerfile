FROM node:16-alpine

WORKDIR /usr/src/app

RUN mkdir /rootDir

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install -g typescript

RUN npm install

COPY . .

RUN npm run build

CMD [ "node", 'dist/scr/index.js', '/rootDir' ]