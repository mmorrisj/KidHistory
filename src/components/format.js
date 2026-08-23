/** 1969 -> "1969", -2560 -> "2560 BCE". */
export function formatYear(year) {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year}`
}
