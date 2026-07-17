# 🚀 Guía de Despliegue - HelpingYou

<div align="center">

**Instrucciones completas para desplegar HelpingYou en todos los entornos**

![Deployment](https://img.shields.io/badge/Deployment-Production--Ready-green)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)

</div>

---

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Requisitos Previos](#requisitos-previos)
- [Comparativa de Entornos](#comparativa-de-entornos)
- [Despliegue Local](#despliegue-local)
- [Despliegue en Staging](#despliegue-en-staging)
- [Despliegue en Producción](#despliegue-en-producción)
- [Variables de Entorno](#variables-de-entorno)
- [Docker y Contenedores](#docker-y-contenedores)
- [CI/CD Pipeline](#cicd-pipeline)
- [Base de Datos](#base-de-datos)
- [Monitorización](#monitorización)
- [Troubleshooting](#troubleshooting)

---

## Introducción

HelpingYou está diseñada para desplegarse en tres entornos:

1. **Development** - Máquina local para desarrollo
2. **Staging** - Entorno pre-producción para testing
3. **Production** - Entorno final para usuarios reales

Cada entorno tiene configuración, recursos y protecciones específicas.

---

## Requisitos Previos

### Herramientas Requeridas

```bash
# Verificar versiones instaladas
node --version        # v22.0.0 o superior
npm --version        # 10.0.0 o superior
docker --version     # 20.0.0 o superior
docker-compose --version  # 2.0.0 o superior
git --version        # 2.30.0 o superior
```

### Instalación de Herramientas

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install -y \
  curl git build-essential \
  docker.io docker-compose \
  postgresql-client mongodb-mongosh
```

**macOS (Homebrew):**
```bash
brew install git node docker docker-compose postgresql mongodb-community redis
```

**Windows:**
- Usar WSL2 + Ubuntu, o descargar instaladores individuales
- Recomendado: Docker Desktop que incluye docker-compose

### Cuentas y Accesos Necesarios

- [ ] Cuenta GitHub con acceso al repositorio
- [ ] Docker Hub o registry privado (AWS ECR, Google Artifact Registry)
- [ ] Proveedor cloud (AWS, GCP, Azure)
- [ ] Base de datos managed (RDS, MongoDB Atlas)
- [ ] Dominio DNS configurado
- [ ] Certificado SSL/TLS válido

---

## Comparativa de Entornos

| Aspecto | Development | Staging | Production |
|---------|-------------|---------|-----------|
| **Ubicación** | Local | Cloud | Cloud (HA) |
| **Instancias** | 1 | 2-3 | 3-10+ |
| **Base de Datos** | Local | Managed | Managed (HA) |
| **SSL/TLS** | No | Sí | Sí |
| **Backups** | Manual | Automático | Automático (4h) |
| **Monitorización** | Básica | 24/7 | 24/7 |
| **SLA** | N/A | 99.5% | 99.99% |

---

## Despliegue Local

### Paso 1: Clonar Repositorio

```bash
git clone https://github.com/agabrianton-del/HelpingYou.git
cd HelpingYou
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar Entorno

```bash
# Copiar plantilla de variables
cp .env.example .env.local

# Editar con valores locales
nano .env.local
```

**Contenido básico de .env.local:**
```env
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=helpingyou_dev
DB_USER=helpingyou
DB_PASSWORD=dev_password

# MongoDB
MONGODB_URI=mongodb://localhost:27017/helpingyou_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRATION=24h

# Storage
STORAGE_TYPE=local
STORAGE_PATH=./uploads

# Logging
LOG_LEVEL=debug
```

### Paso 4: Iniciar Servicios

```bash
# Iniciar PostgreSQL, MongoDB, Redis con Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Verificar servicios
docker-compose -f docker-compose.dev.yml ps
```

### Paso 5: Migraciones de BD

```bash
# Ejecutar migraciones
npm run db:migrate

# (Opcional) Cargar datos de prueba
npm run db:seed
```

### Paso 6: Ejecutar Aplicación

**Terminal 1 - Backend:**
```bash
cd packages/api
npm run dev
# Accesible en http://localhost:3000
```

**Terminal 2 - Frontend Web:**
```bash
cd packages/web
npm run dev
# Accesible en http://localhost:3001
```

### Paso 7: Verificar Despliegue

```bash
# Health check
curl http://localhost:3000/health

# Ejecutar tests
npm test

# Verificar linting
npm run lint
```

---

## Despliegue en Staging

### Arquitectura

```
┌──────────────────┐
│   GitHub Push    │
│   (develop)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ GitHub Actions   │
│ (Build & Test)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Push to ECR    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Auto-Deploy      │
│ Staging (ECS/K8s)│
└──────────────────┘
```

### Paso 1: Preparar Infraestructura

```bash
# Provisionar recursos en AWS/GCP/Azure
terraform init
terraform plan -var-file=staging.tfvars
terraform apply -var-file=staging.tfvars

# Esto crea:
# - VPC, Security Groups
# - RDS PostgreSQL
# - ElastiCache Redis
# - MongoDB Atlas
# - Load Balancer
# - ECR Registry
```

### Paso 2: Configurar Secrets

```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name helpingyou/staging/env \
  --secret-string file://staging-secrets.json

# Contenido de staging-secrets.json:
{
  "DB_HOST": "staging-db.xxx.rds.amazonaws.com",
  "MONGODB_URI": "mongodb+srv://user:pass@staging.mongodb.net",
  "JWT_SECRET": "staging_jwt_secret_xxxxx",
  "NODE_ENV": "staging"
}
```

### Paso 3: Build y Deploy

```bash
# Build Docker image
docker build -t helpingyou-api:staging .

# Push a ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-uri>
docker tag helpingyou-api:staging <ecr-uri>/helpingyou-api:staging
docker push <ecr-uri>/helpingyou-api:staging

# Deploy automático a Staging (via CI/CD)
# O manual:
kubectl apply -f k8s/staging/deployment.yaml
```

### Paso 4: Verificar Staging

```bash
# Health check
curl https://staging.helpingyou.org/health

# Ver logs
kubectl logs -f deployment/helpingyou-api -n staging

# Smoke tests
npm run test:smoke -- --env=staging
```

---

## Despliegue en Producción

### ⚠️ Pre-Despliegue Checklist

- [ ] Todos los tests pasan
- [ ] Code review aprobado
- [ ] Security scan completado
- [ ] Performance tests OK
- [ ] Staging deployment exitoso
- [ ] Backup de datos reciente
- [ ] Plan de rollback documentado
- [ ] Equipo en standby para monitorización

### Estrategia: Blue-Green Deployment

```
┌─────────────────────────────────┐
│      Load Balancer              │
├─────────────────────────────────┤
│                                 │
│  Blue (Actual)   Green (Nuevo)  │
│  100% traffic    0% traffic     │
│                                 │
└─────────────────────────────────┘
              ↓
    (Validar Green OK)
              ↓
┌─────────────────────────────────┐
│  Blue: 0%       Green: 100%     │
└─────────────────────────────────┘
              ↓
   (Monitorear 15 minutos)
              ↓
   Destroy Blue, Green es nuevo Blue
```

### Paso 1: Backup Previo

```bash
# Snapshot de PostgreSQL
aws rds create-db-snapshot \
  --db-instance-identifier helpingyou-prod \
  --db-snapshot-identifier helpingyou-prod-$(date +%Y%m%d-%H%M%S)

# Backup de MongoDB
mongodump --uri="mongodb+srv://..." --out=./backup_$(date +%Y%m%d)
```

### Paso 2: Desplegar Green

```bash
# 1. Build image final
docker build -t helpingyou-api:prod-$(date +%Y%m%d) .

# 2. Push a registry
docker push <ecr-uri>/helpingyou-api:prod-$(date +%Y%m%d)

# 3. Desplegar Green (0% tráfico)
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: helpingyou-api-green
  namespace: production
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: <ecr-uri>/helpingyou-api:prod-$(date +%Y%m%d)
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
EOF

# 4. Esperar a que Green esté listo
kubectl rollout status deployment/helpingyou-api-green -n production
```

### Paso 3: Validar Green

```bash
# Health checks
curl https://green.helpingyou.org/health

# Smoke tests
npm run test:smoke -- --env=prod-green

# Verificar logs
kubectl logs deployment/helpingyou-api-green -n production --tail=50

# Monitorear métricas
# - CPU < 70%
# - Memoria < 80%
# - Error rate < 0.1%
# - Latencia p95 < 500ms
```

### Paso 4: Cambiar Tráfico (Blue → Green)

```bash
# Actualizar Service para dirigir tráfico a Green
kubectl patch service helpingyou-api -n production -p \
  '{"spec":{"selector":{"version":"green"}}}'

# Verificar cambio
kubectl get endpoints helpingyou-api -n production
```

### Paso 5: Monitorear 15 Minutos

```bash
# Ver tráfico en tiempo real
watch 'kubectl get pods -n production -l version=green'

# Alertas automáticas (deben estar activas)
# Si hay problemas → Rollback inmediato
```

### Paso 6: Confirmar o Rollback

**✅ Si está OK:**
```bash
# Eliminar Blue
kubectl delete deployment helpingyou-api-blue -n production

# Renombrar Green a Blue para próximo despliegue
kubectl label pods -n production -l version=green version=blue --overwrite
```

**❌ Si hay problemas (Rollback):**
```bash
# Inmediato: Volver tráfico a Blue
kubectl patch service helpingyou-api -n production -p \
  '{"spec":{"selector":{"version":"blue"}}}'

# Eliminar Green
kubectl delete deployment helpingyou-api-green -n production

# Investigar qué salió mal
kubectl logs deployment/helpingyou-api-blue -n production
```

---

## Variables de Entorno

### Development (.env.local)

```env
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=helpingyou_dev
DB_USER=helpingyou
DB_PASSWORD=dev_password

MONGODB_URI=mongodb://localhost:27017/helpingyou_dev
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=dev_secret_key
JWT_EXPIRATION=24h

STORAGE_TYPE=local
STORAGE_PATH=./uploads

LOG_LEVEL=debug
```

### Staging (.env.staging)

```env
NODE_ENV=staging
PORT=3000
API_BASE_URL=https://staging.helpingyou.org
FRONTEND_URL=https://app-staging.helpingyou.org

# RDS PostgreSQL
DB_HOST=helpingyou-staging.xxx.rds.amazonaws.com
DB_SSL=true
DB_POOL_MIN=5
DB_POOL_MAX=20

# ElastiCache Redis
REDIS_HOST=helpingyou-staging.xxx.cache.amazonaws.com
REDIS_SSL=true

# S3 Storage
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_BUCKET=helpingyou-staging

# Security
SSL_ENABLED=true
CORS_ORIGIN=https://app-staging.helpingyou.org

LOG_LEVEL=info
```

### Production (.env.production)

```env
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.helpingyou.org
FRONTEND_URL=https://app.helpingyou.org

# RDS PostgreSQL Multi-AZ
DB_HOST=helpingyou-prod.xxx.rds.amazonaws.com
DB_REPLICA_HOSTS=helpingyou-prod-read.xxx.rds.amazonaws.com
DB_SSL=true
DB_POOL_MIN=10
DB_POOL_MAX=50

# ElastiCache Cluster
REDIS_CLUSTER_ENDPOINTS=endpoint1:6379,endpoint2:6379,endpoint3:6379
REDIS_SSL=true

# S3 + CloudFront CDN
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_BUCKET=helpingyou-prod
CDN_URL=https://cdn.helpingyou.org

# Security
SSL_ENABLED=true
CORS_ORIGIN=https://app.helpingyou.org
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=1000

# Monitoring
LOG_LEVEL=warn
SENTRY_DSN=https://xxx@sentry.io/xxx
APM_ENABLED=true
METRICS_ENABLED=true
```

---

## Docker y Contenedores

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime
FROM node:22-alpine

WORKDIR /app
RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### docker-compose.dev.yml

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: helpingyou
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: helpingyou_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U helpingyou"]
      interval: 10s
      retries: 5

  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: dev_password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      retries: 5

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
```

---

## CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: aws-actions/amazon-ecr-login@v1
      - uses: docker/build-push-action@v4
        with:
          context: ./packages/api
          push: true
          tags: |
            ${{ env.ECR_REGISTRY }}/helpingyou-api:${{ github.sha }}
            ${{ env.ECR_REGISTRY }}/helpingyou-api:latest

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to Staging
        run: |
          kubectl set image deployment/helpingyou-api \
            api=${{ env.ECR_REGISTRY }}/helpingyou-api:${{ github.sha }} \
            -n staging
          kubectl rollout status deployment/helpingyou-api -n staging

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to Production (Green)
        run: |
          kubectl apply -f k8s/production/green.yaml
          kubectl rollout status deployment/helpingyou-api-green -n production
      
      - name: Run Smoke Tests
        run: npm run test:smoke -- --env=prod-green
      
      - name: Switch Traffic
        run: kubectl patch service helpingyou-api -p '{"spec":{"selector":{"version":"green"}}}'
```

---

## Base de Datos

### Migraciones

```bash
# Crear migración
npm run db:migration:create --name add_users_table

# Ejecutar
npm run db:migrate

# Revertir
npm run db:migrate:rollback

# Ver estado
npm run db:migrate:status
```

### Backup y Restore

```bash
# PostgreSQL
pg_dump helpingyou_prod > backup_$(date +%Y%m%d).sql
psql helpingyou_prod < backup_20260717.sql

# MongoDB
mongodump --uri="mongodb+srv://..." --out=./backup
mongorestore --uri="mongodb+srv://..." ./backup
```

---

## Monitorización

### Health Checks

```bash
# Aplicación
curl https://api.helpingyou.org/health

# Base de datos
curl https://api.helpingyou.org/health/db

# Métricas
curl https://api.helpingyou.org/metrics
```

### Alertas Automáticas

```yaml
# High Error Rate
expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05

# High Latency
expr: histogram_quantile(0.95, http_request_duration_seconds) > 1

# Database Down
expr: up{job="postgres"} == 0
```

---

## Troubleshooting

### Aplicación no inicia

```bash
kubectl logs deployment/helpingyou-api -n production --tail=100
kubectl describe pod <pod-name> -n production
kubectl exec -it <pod-name> -n production -- bash
```

### Base de datos no responde

```bash
psql -h db-host -U username -c "SELECT 1;"
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### Alto uso de memoria

```bash
kubectl top pod <pod-name> -n production
kubectl set resources deployment helpingyou-api -n production \
  --limits=memory=1Gi,cpu=1000m
```

### Problemas de SSL/TLS

```bash
openssl s_client -connect api.helpingyou.org:443
curl -vI https://api.helpingyou.org 2>&1 | grep expire
```

---

## Checklist Post-Despliegue

- [ ] Health checks pasando
- [ ] Error rate < 0.1%
- [ ] Latencia p95 < 500ms
- [ ] CPU < 70%
- [ ] Memoria < 80%
- [ ] Cache hit rate > 80%
- [ ] Backups ejecutados
- [ ] Alertas configuradas
- [ ] Documentación actualizada

---

**Última actualización:** 2026-07-17

**Mantenido por:** Equipo de DevOps - HelpingYou

💙 *Deploying with confidence*
