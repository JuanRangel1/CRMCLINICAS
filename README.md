# CRM Clínicas

CRM SaaS multi-tenant para clínicas: leads, pacientes, agenda, tratamentos, orçamentos, pipeline comercial, financeiro, comissões, follow-ups, satisfação, inteligência e relatórios.

## Stack

- Frontend: Next.js 15 + React 19 + Tailwind + Recharts
- Backend: NestJS 11 + Prisma + PostgreSQL
- Auth: JWT access + refresh token, RBAC por perfil, isolamento multi-tenant por `clinicId`
- Testes: Jest + Supertest (multi-tenancy, RBAC, CRUD, conflitos de agenda)

## Rodar localmente

Pré-requisitos: Node 24, pnpm 12, PostgreSQL rodando.

```bash
copy .env.example .env
pnpm install
pnpm prisma:generate
pnpm prisma migrate dev --name init
pnpm prisma db seed
pnpm dev:backend   # http://localhost:3001/docs
pnpm dev:frontend  # http://localhost:3000
```

## Credenciais do seed

- Super admin: `admin@crmclinicas.com` / `Senha@123`
- Admins de clínica: `admin.clinica{1,2,3}@exemplo.com` / `Senha@123`
- Gerentes: `gerente{1,2,3}.{1,2}@exemplo.com` / `Senha@123`
- Recepção: `recepcao{1,2,3}.{1,2,3}@exemplo.com` / `Senha@123`

## Testes

```bash
pnpm --filter backend test
```

Cobre: login, RBAC, multi-tenancy (clínica A não acessa paciente da clínica B), CRUD, conflito de sala/horário.

## Estrutura

```
apps/backend    API NestJS (Swagger em /docs)
apps/frontend   Next.js App Router
prisma/         schema + seed
docker/         Dockerfiles
docker-compose.yml
```
