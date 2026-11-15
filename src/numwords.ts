export function numToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) throw new Error(`numToWords out of range: ${n}`)
  const ones = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
  ]
  const tens = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  if (n < 20) return ones[n]
  if (n < 100) {
    const t = tens[Math.floor(n / 10) - 2]
    const r = n % 10
    return r === 0 ? t : `${t}-${ones[r]}`
  }
  const h = `${ones[Math.floor(n / 100)]} hundred`
  const r = n % 100
  return r === 0 ? h : `${h} ${numToWords(r)}`
}
