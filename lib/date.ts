export function formatDateOnly(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return new Date(value).toLocaleDateString("pt-BR");

  return `${match[3]}/${match[2]}/${match[1]}`;
}
