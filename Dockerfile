FROM  node:current-bullseye-slim
WORKDIR /app

COPY package.json ./

RUN npm install

COPY ./src ./src

CMD [ "npm","run","start" ]