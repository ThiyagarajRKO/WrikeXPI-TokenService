const crypto = require("crypto");

export const encryptWithRandomKey = (plainText) => {
  const key = crypto.randomBytes(32); // AES-256
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    encryptedData: iv.toString("hex") + ":" + encrypted.toString("hex"),
    key: key.toString("hex"), // return key to user
  };
};

export const decryptWithKey = (encryptedData, keyHex) => {
  const [ivHex, dataHex] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const key = Buffer.from(keyHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
};
