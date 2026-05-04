# Aromase Momentos

Projeto inicial para controle de produtos, custos e vendas.

## Como começar

1. Instale dependências:
   ```bash
   npm install
   ```
2. Gere o cliente Prisma e crie o banco de dados:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. Execute o app:
   ```bash
   npm run dev
   ```

## Estrutura inicial

- `pages/index.tsx` — tela principal de entrada e navegação
- `pages/dashboard.tsx` — resumo e dashboard
- `pages/insumos.tsx` — cadastro de insumos
- `pages/modelos.tsx` — cadastro de modelos de velas
- `pages/calculo.tsx` — cálculo de custos e preços baseado em modelos e insumos
- `pages/compras.tsx` — área de compras e despesas
- `pages/producao.tsx` — área de produção
- `pages/vendas.tsx` — registro de vendas de velas com resumo
- `pages/api/products.ts` — API de produtos/insumos
- `pages/api/sales.ts` — API de vendas de insumos
- `pages/api/modelos.ts` — API de modelos
- `pages/api/vendas.ts` — API de vendas de velas
- `prisma/schema.prisma` — modelo de dados SQLite

## O que está implementado

- Menu de navegação entre as abas principais
- Tela de resumo (dashboard)
- Cadastro e listagem de insumos com edição
- Cadastro e listagem de modelos de velas com edição
- Cálculo automático de custos baseado em insumos cadastrados
- Registro de vendas de velas com 9 colunas (Data, Cliente, Modelo, Qtd, Preço Unit., Total, Pagamento, Status, Observação)
- Resumo de vendas com métricas como total vendido, a receber, pedidos por status, etc.
- Páginas de apoio para compras e produção

> Este é o ponto de partida. Podemos agora evoluir para conectar os modelos aos insumos, criar cálculo automático de preço final, e adicionar importação da planilha.
