FROM  node:current-alpine
WORKDIR /app

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*


COPY package.json ./

RUN npm install

COPY ./src ./src

CMD [ "npm","run","start" ]