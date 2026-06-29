const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const indiaPhonePattern = /(?<!\d)(?:\+?91[\s-]?)?[6-9]\d{9}(?!\d)/g;

export function sanitizeForAi(input: string): string {
  return input
    .replace(emailPattern, "[email]")
    .replace(indiaPhonePattern, "[phone]")
    .replace(/\s+/g, " ")
    .trim();
}
