
FROM node:20

WORKDIR /app


COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps


COPY .env .env

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
