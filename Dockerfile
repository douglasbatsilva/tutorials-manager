FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g @nestjs/cli

RUN npm run build

EXPOSE 3000

CMD npm run test && npm run start:prod
