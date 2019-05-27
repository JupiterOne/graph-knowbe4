/* tslint:disable:no-console */
import { executeIntegrationLocal } from "@jupiterone/jupiter-managed-integration-sdk";
import invocationConfig from "../src/index";

const integrationConfig = {
  site: process.env.KB4_SITE as string,
  apiKey: process.env.KB4_TOKEN as string,
};

const invocationArgs = {
  // providerPrivateKey: process.env.PROVIDER_LOCAL_EXECUTION_PRIVATE_KEY
};

executeIntegrationLocal(
  integrationConfig,
  invocationConfig,
  invocationArgs,
).catch(err => {
  console.error(err);
  process.exit(1);
});
