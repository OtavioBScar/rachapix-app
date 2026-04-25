# rachapix-app

Monorepo do aplicativo RachaPix.

## Estrutura inicial

- `apps/server`: API Node.js com Express e TypeScript.

## Scripts

```bash
npm install
npm run dev:server
```

O servidor sobe por padrão em `http://localhost:3333`.

Endpoint inicial:

```text
GET /api/health
```

## Backend MVP

Autenticacao:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/me
PATCH /api/me
```

Amigos:

```text
GET    /api/friends
POST   /api/friends/invitations
GET    /api/friends/invitations
POST   /api/friends/invitations/:id/accept
POST   /api/friends/invitations/:id/reject
DELETE /api/friends/:friendId
```

Despesas e cobrancas:

```text
POST   /api/expenses
GET    /api/expenses
GET    /api/expenses/:id
DELETE /api/expenses/:id
POST   /api/expenses/:id/document
GET    /api/me/charges
GET    /api/me/charges/:id
POST   /api/me/charges/:id/pix
```
