export default function isValidVatId(nif: string): boolean {
  const validationSets = {
    one: ["1", "2", "3", "5", "6", "8"],
    two: [
      "45",
      "70",
      "71",
      "72",
      "74",
      "75",
      "77",
      "79",
      "90",
      "91",
      "98",
      "99",
    ],
  };
  if (nif.length !== 9) return false;
  if (
    !validationSets.one.includes(nif.substring(0, 1)) &&
    !validationSets.two.includes(nif.substring(0, 2))
  )
    return false;
  const total =
    Number(nif[0]) * 9 +
    Number(nif[1]) * 8 +
    Number(nif[2]) * 7 +
    Number(nif[3]) * 6 +
    Number(nif[4]) * 5 +
    Number(nif[5]) * 4 +
    Number(nif[6]) * 3 +
    Number(nif[7]) * 2;
  const modulo11 = total % 11;
  const checkDigit = modulo11 < 2 ? 0 : 11 - modulo11;
  return checkDigit === Number(nif[8]);
}
