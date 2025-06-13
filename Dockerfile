FROM node:20-alpine

WORKDIR /app

# Instala dependencias necesarias del sistema
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Limpieza opcional
RUN apk del python3 make g++ && npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
