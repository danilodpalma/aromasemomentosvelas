# 🚀 Workflow: Commit → GitHub → Vercel Deploy

## ✅ Pré-requisitos

- [x] Conta Supabase criada
- [x] Conta Vercel criada
- [x] Projeto criado no Vercel
- [x] Repositório GitHub configurado

---

## 📋 Seu Workflow (Workflow Automático)

### 1️⃣ **Fazer alterações locais**

```bash
# No VS Code, faça suas mudanças
# Exemplo: adicionar novo campo, nova tela, etc
```

### 2️⃣ **Commit e Push**

```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

### 3️⃣ **Vercel faz deploy automaticamente** ⚡

- Vercel detecta o push no GitHub
- Executa: `npm install` → `npx prisma generate` → `npm run build` → Deploy
- Seu site atualiza sozinho! 🎉

---

## 🔐 Configurar Variáveis de Ambiente no Vercel

**IMPORTANTE**: Nunca comite `.env` com dados reais!

### Adicione no Vercel:

1. Acesse seu projeto no Vercel
2. **Settings → Environment Variables**
3. Adicione duas variáveis:

```
DATABASE_URL = postgresql://postgres:[SENHA]@db.maxmxjbiexvsutducyrw.supabase.co:5432/postgres

JWT_SECRET = use-uma-chave-super-segura-e-aleatoria-aqui
```

4. Clique "Save" e o deploy é acionado automaticamente

---

## 📊 Seu Fluxo Resumido

```
VS Code
   ↓ (você faz mudanças)
git commit + push
   ↓
GitHub (seu repositório)
   ↓ (Vercel detecta novo push)
Vercel (build automático)
   ↓
Deploy ao vivo! 🚀
   ↓
Site disponível em: seu-dominio.vercel.app
```

---

## 🛠️ Comandos Úteis

### Ver status do repositório

```bash
git status
```

### Ver commits

```bash
git log --oneline
```

### Desfazer último commit (sem push)

```bash
git reset --soft HEAD~1
```

### Ver logs do build no Vercel

- Acesse seu projeto no Vercel > **Deployments**
- Clique no deployment mais recente
- Veja os logs em tempo real

---

## ⚠️ Importante

- ✅ Sempre use `.env.example` como referência
- ✅ Adicione variáveis de ambiente NO VERCEL, não no `.env`
- ❌ NUNCA comite `.env` com dados reais
- 🔐 JWT_SECRET forte em produção

---

## 🎯 Pronto para começar?

1. Verifique o `.env.example`
2. Faça seu primeiro commit
3. Push para GitHub
4. Vercel vai fazer o deploy automático!

Boa sorte! 🚀
