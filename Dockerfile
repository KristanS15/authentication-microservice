FROM node:10.8.0

RUN mkdir -p /opt/app
WORKDIR /opt/app

RUN npm i npm@latest -g

WORKDIR /opt
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force && npm install knex -g
ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . /opt/app

CMD ["knex", "migrate:latest", "&&", "npm", "run", "dev"]

EXPOSE 5001