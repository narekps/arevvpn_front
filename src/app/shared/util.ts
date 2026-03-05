export function randomControlName(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const randomLength = Math.floor(Math.random() * 10) + 5;
  return Array.from({length: randomLength}, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

export function getDayWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'дней';
  }

  if (lastDigit === 1) {
    return 'день';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня';
  }

  return 'дней';
}

export function getMonthWord(count: number): string {
  const normalizedCount = Math.abs(count);
  const lastDigit = normalizedCount % 10;
  const lastTwoDigits = normalizedCount % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'месяцев';
  }

  if (lastDigit === 1) {
    return 'месяц';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'месяца';
  }

  return 'месяцев';
}
