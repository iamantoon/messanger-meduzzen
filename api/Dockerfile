FROM node:20.11.1-alpine

WORKDIR /app

COPY ./api/package*.json ./

RUN npm cache clean --force
RUN npm install

COPY ./api/prisma ./prisma

COPY ./api/ .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:migrate:prod"]
