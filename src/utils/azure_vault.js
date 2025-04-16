const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const credential = new DefaultAzureCredential();
const client = new SecretClient(process.env.AZURE_VAULT_URL, credential);

export const getSecrets = async (secretNames) => {
  try {
    // Fetch secrets in parallel
    const secretPromises = secretNames.map((name) => client.getSecret(name));
    const secrets = await Promise.all(secretPromises);

    let secretValues = {};
    // secrets.forEach((secret) => {
    for (const secret of secrets) {
      console.log(`Secret "${secret.name}": ${secret.value}`);
      if (secret?.name && secret?.value)
        secretValues[secret?.name] = secret?.value;
    }

    return secretValues;
  } catch (err) {
    console.error("Error retrieving secrets:", err.message);
    return {};
  }
};
