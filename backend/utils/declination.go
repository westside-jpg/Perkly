package utils

// Склонение слов
func DeclinationWord(n int, one, two, many string) string {
    absN := n
    if absN < 0 {
        absN = -absN
    }

    lastTwoDigits := absN % 100

    if lastTwoDigits >= 11 && lastTwoDigits <= 14 {
        return many
    }

    switch absN % 10 {
    case 1:
        return one
    case 2, 3, 4:
        return two
    default:
        return many
    }
}