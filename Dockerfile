FROM risingstack/alpine:3.4-v6.9.4-4.2.0

ENV PORT 3000
EXPOSE 3000

WORKDIR /app

ADD dist /app/dist
ADD .env /app
ADD package.json /app

RUN npm install

CMD ["node", "dist/"]