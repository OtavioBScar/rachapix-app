# rachapix-app

Monorepo do aplicativo RachaPix.

## Estrutura inicial

- `apps/server`: API Node.js com Express e TypeScript.
- `apps/mobile`: aplicativo React Native/Expo para Android.

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

## Mobile Android

Em outro terminal, com a API rodando:

```bash
npm run android:mobile
```

Se o Expo tentar buscar metadados online e falhar, use:

```bash
npm run android:mobile:offline
```

O app usa `EXPO_PUBLIC_API_URL` para chamar a API. Para Android Emulator, o valor padrao em `apps/mobile/.env.example` e:

```text
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333/api
```

Em um celular fisico com Expo Go, troque `10.0.2.2` pelo IP da maquina na rede local, por exemplo `http://192.168.0.10:3333/api`.

### Debug de API no mobile

Com o Expo rodando, os logs do app aparecem no terminal onde voce executou `npm run dev:mobile`.
O cliente mobile imprime, em modo desenvolvimento:

```text
[api:request]  metodo, URL e body enviado
[api:response] status e body recebido
[api:network-error] erro de rede antes de chegar na API
```

Campos sensiveis como `password`, `token` e `authorization` sao mascarados nos logs.

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
