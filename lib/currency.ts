export function sanitizeCurrencyInput(value: string, maxDecimals = 3) {
  const normalized = value.replace(/\./g, ",").replace(/[^\d,]/g, "");
  const firstComma = normalized.indexOf(",");

  if (firstComma === -1) return normalized;

  const integerPart = normalized.slice(0, firstComma);
  const decimalsRaw = normalized.slice(firstComma + 1).replace(/,/g, "");
  const decimalPart = decimalsRaw.slice(0, maxDecimals);
  return `${integerPart},${decimalPart}`;
}

export function parseCurrencyInput(value: string) {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrencyInput(value: string | number, decimals = 3) {
  const numeric = typeof value === "number" ? value : parseCurrencyInput(value);
  return numeric.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
