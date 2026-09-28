import { encryptField, decryptField } from "./index";

Bun.test("encryptField returns a non-empty string", () => {
  const result = encryptField("test data", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  expect(result).toBeTypeOf("string");
  expect(result.length).toBeGreaterThan(0);
});

Bun.test("encryptField produces different outputs for same input", () => {
  const result1 = encryptField("test data", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  const result2 = encryptField("test data", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  expect(result1).not.toBe(result2);
});

Bun.test("decryptField returns original text after encryption", () => {
  const original = "Glycémie 1.85 g/L";
  const key = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const encrypted = encryptField(original, key);
  const decrypted = decryptField(encrypted, key);
  expect(decrypted).toBe(original);
});

Bun.test("decryptField returns empty string input as-is", () => {
  const result = decryptField("", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  expect(result).toBe("");
});

Bun.test("decryptField returns non-encrypted string as-is", () => {
  const result = decryptField("plain text", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  expect(result).toBe("plain text");
});

Bun.test("encryptField returns empty string input as-is", () => {
  const result = encryptField("", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  expect(result).toBe("");
});

Bun.test("decryptField fails with wrong key", () => {
  const original = "sensitive data";
  const correctKey = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const wrongKey = "000000000000000000000000000000000000000000000000000000000000000000";
  const encrypted = encryptField(original, correctKey);
  expect(() => decryptField(encrypted, wrongKey)).toThrow();
});