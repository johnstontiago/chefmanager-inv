FROM node:18-alpine

WORKDIR /app

# Instalar openssl para Prisma
RUN apk add --no-cache openssl libc6-compat

# Copiar archivos de configuración
COPY package.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Generar Prisma Client
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Build de la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start"]
