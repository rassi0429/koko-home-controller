FROM node:16-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY index.mjs .
COPY .env .
RUN npm i
CMD ["node","index.mjs"]