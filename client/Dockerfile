FROM node:18-alpine as build 

WORKDIR /app

COPY ./client/package*.json ./

RUN npm install

COPY ./client/ .

RUN npm run build --prod

FROM nginx:stable-alpine

COPY --from=build /app/dist/client/browser /usr/share/nginx/html

COPY ./client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
