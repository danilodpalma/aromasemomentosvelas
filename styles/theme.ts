// styles/theme.ts
// Cores usadas em todo o sistema. Trocar uma cor aqui reflete em todas as telas.

export const COLORS = {
  // Marca / botões principais
  primary: "rgb(167, 117, 75)",
  primaryBorder: "rgb(166, 116, 71)",
  primaryBorderSoft: "rgba(166, 116, 71, 0.2)",
  primaryDark: "#6b3b12",
  primaryDarkAlt: "#8a5a2b",
  primaryDarkText: "#7c3d12",
  primaryShadow: "rgba(92, 54, 24, 0.1)",
  primarySoft: "rgba(167, 117, 75, 0.12)",
  primarySoftAlt: "rgba(167, 117, 75, 0.08)",

  // Gradiente dos cartões (fundo bege)
  cardGradientFrom: "#f7e8d7",
  cardGradientTo: "#efd9c2",

  // Gradiente dos botões principais
  buttonGradientFrom: "#a76f4b",
  buttonGradientTo: "#8c5331",

  // Neutros
  white: "rgb(255, 255, 255)",
  gray: "rgb(200, 200, 200)",
  grayLight: "#f3f4f6",
  grayText: "#6b7280",
  grayTextAlt: "#4b5563",

  // Estados
  success: "rgb(34, 197, 94)",
  successBg: "#ecfdf5",
  danger: "#dc2626",
  dangerRgb: "rgb(220, 38, 38)",
  dangerLight: "#ef4444",

  // Combinações prontas (borda/sombra) que se repetem em quase todo cartão
  cardBorder: "1px solid rgba(166, 116, 71, 0.2)",
  cardShadow: "0 10px 24px rgba(92, 54, 24, 0.1)",
  cardShadowLarge: "0 12px 30px rgba(92, 54, 24, 0.12)",
  subtleShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
  subtleShadowSmall: "0 1px 2px rgba(15, 23, 42, 0.08)",
  primaryBorderSoft12: "1px solid rgba(167, 117, 75, 0.12)",
} as const;
