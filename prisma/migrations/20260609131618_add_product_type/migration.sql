-- CreateTable
CREATE TABLE "Insumo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "unit" TEXT,
    "purchaseCost" REAL NOT NULL,
    "purchasedQuantity" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "description" TEXT,
    "productType" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Modelo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "valorVendido" REAL NOT NULL DEFAULT 0,
    "tipoProduto" TEXT,
    "baseNome" TEXT,
    "ceraGr" REAL NOT NULL,
    "esenciaMl" REAL NOT NULL,
    "essenciaNome" TEXT,
    "pavio" TEXT,
    "coranteNome" TEXT,
    "coranteGr" REAL NOT NULL,
    "recipiente" TEXT,
    "pedra" TEXT,
    "extrato" TEXT,
    "extratoGr" REAL NOT NULL,
    "lauril" TEXT,
    "laurilGr" REAL NOT NULL,
    "tampa" TEXT,
    "embalagem" REAL NOT NULL,
    "maoDeObra" REAL NOT NULL,
    "margemLucro" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "insumoId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "total" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataVenda" DATETIME NOT NULL,
    "cliente" TEXT NOT NULL,
    "modeloVela" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" REAL NOT NULL,
    "total" REAL NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProductType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_name_key" ON "ProductType"("name");
