/*
  Warnings:

  - You are about to drop the column `productType` on the `Insumo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Insumo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "unit" TEXT,
    "purchaseCost" REAL NOT NULL,
    "purchasedQuantity" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "description" TEXT,
    "productTypes" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Insumo" ("active", "createdAt", "description", "id", "name", "purchaseCost", "purchasedQuantity", "stock", "unit", "unitCost") SELECT "active", "createdAt", "description", "id", "name", "purchaseCost", "purchasedQuantity", "stock", "unit", "unitCost" FROM "Insumo";
DROP TABLE "Insumo";
ALTER TABLE "new_Insumo" RENAME TO "Insumo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
