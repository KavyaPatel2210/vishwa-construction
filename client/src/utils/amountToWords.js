const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'];

const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertHundreds(n) {
  if (n === 0) return '';
  let result = '';
  if (n >= 100) {
    result += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    result += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) result += ones[n] + ' ';
  return result;
}

export function amountToWords(amount) {
  if (!amount || amount === 0) return 'Zero Rupees Only';
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = '';

  if (rupees > 0) {
    let temp = rupees;
    const crore = Math.floor(temp / 10000000); temp %= 10000000;
    const lakh = Math.floor(temp / 100000); temp %= 100000;
    const thousand = Math.floor(temp / 1000); temp %= 1000;
    const hundred = temp;

    if (crore > 0) result += convertHundreds(crore) + 'Crore ';
    if (lakh > 0) result += convertHundreds(lakh) + 'Lakh ';
    if (thousand > 0) result += convertHundreds(thousand) + 'Thousand ';
    if (hundred > 0) result += convertHundreds(hundred);
    result = result.trim() + ' Rupees';
  }

  if (paise > 0) result += ' And ' + convertHundreds(paise).trim() + ' Paise';
  return result.trim() + ' Only';
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0);
}
