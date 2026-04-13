export const CURRENCIES = {
  CLP: { symbol: '$',   name: 'Peso chileno',           decimals: 0 },
  USD: { symbol: 'US$', name: 'Dólar estadounidense',   decimals: 2 },
  EUR: { symbol: '€',   name: 'Euro',                   decimals: 2 },
  ARS: { symbol: '$',   name: 'Peso argentino',         decimals: 0 },
  MXN: { symbol: '$',   name: 'Peso mexicano',          decimals: 2 },
  COP: { symbol: '$',   name: 'Peso colombiano',        decimals: 0 },
  PEN: { symbol: 'S/',  name: 'Sol peruano',            decimals: 2 },
  BRL: { symbol: 'R$',  name: 'Real brasileño',         decimals: 2 },
  BOB: { symbol: 'Bs',  name: 'Boliviano',              decimals: 2 },
  UYU: { symbol: '$U',  name: 'Peso uruguayo',          decimals: 2 },
  GBP: { symbol: '£',   name: 'Libra esterlina',        decimals: 2 },
}

export function fmt(amount, currencyCode) {
  const c = CURRENCIES[currencyCode] || CURRENCIES.CLP
  return c.symbol + Number(amount).toLocaleString('es-CL', {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals,
  })
}