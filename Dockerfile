# Usa una imagen Node oficial como base
FROM node:20-alpine

# Crea el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto
COPY package*.json ./
RUN npm install

COPY . .

# Compila la app NestJS
RUN npm run build

# Expón el puerto (debe coincidir con el puerto que escucha Nest)
EXPOSE 3000

# Comando para ejecutar la app
CMD ["npm", "run", "start:prod"]