# Instrucciones de Despliegue en Railway

## Pasos para desplegar:

### 1. Preparar el repositorio
Asegúrate de que tu repositorio NO incluya:
- `.yarnrc.yml` (eliminar si existe)
- `.yarn/` (eliminar si existe)
- `node_modules/` (debe estar en .gitignore)
- `.next/` y `.build/` (debe estar en .gitignore)

### 2. Archivos requeridos
- `package.json` - con las dependencias
- `prisma/schema.prisma` - sin binaryTargets ni output específico
- `.gitignore` - con las exclusiones apropiadas

### 3. Variables de entorno en Railway
Configura estas variables en Railway:
```
DATABASE_URL=postgresql://usuario:password@host:puerto/database
NEXTAUTH_URL=https://tu-app.up.railway.app
NEXTAUTH_SECRET=tu-secret-aleatorio
```

### 4. Comando de build
Railway detectará automáticamente Next.js. El build command es:
```
npm run build
```
Que ejecutará: `prisma generate && next build`

### 5. Start command
```
npm run start
```

## Solución de problemas comunes:

### Error de ESLint
Si hay conflictos de ESLint, el package.json ya está configurado sin ESLint para evitar conflictos.

### Error de Prisma
Asegúrate de que `prisma/schema.prisma` NO tenga:
- `binaryTargets`
- `output` con ruta específica

### Error de dependencias
Si hay errores ERESOLVE, Railway debería usar `npm install --legacy-peer-deps` automáticamente.
