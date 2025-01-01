function randomString(length: number, chars: string): string {
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateKey(): string {
  return (
    randomString(4, "abcdef0123456789") +
    "-" +
    randomString(8, "abcdef0123456789") +
    "-" +
    randomString(4, "abcdef0123456789") +
    "-" +
    randomString(8, "abcdef0123456789") +
    "-" +
    randomString(8, "abcdef0123456789")
  );
}

export { generateKey };
