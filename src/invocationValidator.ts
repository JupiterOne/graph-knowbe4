import {
  IntegrationInstanceConfigError,
  IntegrationValidationContext,
} from "@jupiterone/jupiter-managed-integration-sdk";

// import ProviderClient from "./ProviderClient";

/**
 * Performs validation of the execution before the execution handler function is
 * invoked.
 *
 * At a minimum, integrations should ensure that the
 * `context.instance.config` is valid. Integrations that require
 * additional information in `context.invocationArgs` should also
 * validate those properties. It is also helpful to perform authentication with
 * the provider to ensure that credentials are valid.
 *
 * The function will be awaited to support connecting to the provider for this
 * purpose.
 *
 * @param context
 */
export default async function invocationValidator(
  context: IntegrationValidationContext,
) {
  const { config } = context.instance;
  if (!config.apiKey) {
    throw new IntegrationInstanceConfigError("Missing API Key in config");
  }
  const site = config.site;
  if (!site) {
    throw new IntegrationInstanceConfigError("Missing Site in config");
  } else if (site.toLowerCase() !== "us" && site.toLowerCase() !== "eu") {
    throw new IntegrationInstanceConfigError("Invalid Site in config");
  }
  // try {
  //   await new ProviderClient(config, context.logger).fetchAccountDetails();
  // } catch (err) {
  //   throw new IntegrationInstanceAuthenticationError(err);
  // }
}
