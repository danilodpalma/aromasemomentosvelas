# �배 Guia de Deployment - Vercel + Supabase

## ✅ Checklist Pré-Deployment

### 1️⃣ Preparar Supabase (Banco de Dados)

- [ ] Criar conta em [supabase.com](https://supabase.com)
- [ ] Criar novo projeto
- [ ] Ir para **Settings > Database** e copiar a URL de conexão PostgreSQL
- [ ] Formatar URL: `postgresql://postgres.[PROJETO]:[SENHA]@db.[REGIÃO].supabase.co:5432/postgres`

### 2️⃣ Preparar Vercel (Hosting)

- [ ] Criar conta em [vercel.com](https://vercel.com)
- [ ] Conectar repositório GitHub (fazer push do código primeiro)

### 3️⃣ Configurar Variáveis de Ambiente no Vercel

Após criar o projeto no Vercel, acesse **Settings > Environment Variables** e adicione:

```
DATABASE_URL = postgresql://postgres.[PROJETO]:[SENHA]@db.[REGIÃO].supabase.co:5432/postgres
JWT_SECRET = sua-chave-secreta-muito-forte-aqui
```

### 4️⃣ Build e Deploy

O Vercel executará automaticamente:

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
npm start
```

**Nota**: O schema será criado automaticamente no Supabase na primeira execução!

---

## 🔧 Mudanças Realizadas Localmente

✅ Alterado `prisma/schema.prisma`:

- Provider: `sqlite` → `postgresql`

✅ Atualizado `.env`:

- DATABASE_URL agora aponta para PostgreSQL

---

## 🚀 Passo a Passo Rápido

### A. Supabcase (Banco)

1. Acesse supabase.com e crie um projeto
2. Copie a URL de conexão: `postgresql://...`

### B. GitHub

1. Faça commit das mudanças:

```bash
git add .
git commit -m "Preparar para deployment: PostgreSQL + Vercel"
git push
```

### C. Vercel

1. Acesse vercel.com e clique "New Project"
2. Conecte seu repositório GitHub
3. Configure variáveis de ambiente (DATABASE_URL e JWT_SECRET)
4. Deploy!

---

## ⚠️ Importante

- ❌ **Nunca** commite `.env` com dados reais (adicione ao `.gitignore`)
- ✅ Sempre use variáveis de ambiente no Vercel
- 🔐 Use JWT_SECRET forte em produção

---

## 📞 Dúvidas Frequentes

**P: E se o deploy falhar?**  
R: Verifique os logs no Vercel. Geralmente é URL de banco de dados incorreta ou variáveis de ambiente faltando.

**P: Posso usar outro banco de dados?**  
R: Sim! Railway, Neon, PlanetScale também funcionam. Mude apenas o `provider` no schema.prisma.

**P: E os dados locais?**  
R: Estão no SQLite local. Você pode re-inserir manualmente ou exportar antes de migrar.
