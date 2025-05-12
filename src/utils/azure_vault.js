const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const credential = new DefaultAzureCredential();
const vaultUrl = process.env.AZURE_VAULT_URL;

if (!vaultUrl) {
  throw new Error("AZURE_VAULT_URL environment variable is not set.");
}

const client = new SecretClient(vaultUrl, credential);

export const getSecrets = async (secretNames) => {
  try {
    const secretValues = {};

    for (const name of secretNames) {
      try {
        const secret = await client.getSecret(name);
        secretValues[secret.name] = secret.value;
      } catch (err) {
        console.error(`Failed to retrieve secret "${name}":`, err.message);
      }
    }

    return secretValues;
  } catch (err) {
    console.error("Error retrieving secrets:", err.message);
    return {};
  }
};

export const listAllSecrets = async () => {
  try {
    const secretNames = [];
    for await (const secretProperties of client.listPropertiesOfSecrets()) {
      secretNames.push(secretProperties.name);
    }
    return secretNames;
  } catch (err) {
    console.error("Error listing secrets:", err.message);
    return [];
  }
};
