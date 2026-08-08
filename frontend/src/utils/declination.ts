// Склонение «товар / товара / товаров» и похожих фраз в UI
export const declinationWord = (n: number, one: string, two: string, many: string): string => {
    const lastTwoDigits = Math.abs(n) % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return many
    }

    switch (Math.abs(n) % 10) {
        case 1:
            return one
        case 2:
        case 3:
        case 4:
            return two
        default:
            return many
    }
  }