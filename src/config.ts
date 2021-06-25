import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationInstanceConfigFieldMap,
  IntegrationInstanceConfig,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from './client';

/**
 * A type describing the configuration fields required to execute the
 * integration for a specific account in the data provider.
 *
 * When executing the integration in a development environment, these values may
 * be provided in a `.env` file with environment variables. For example:
 *
 * - `CLIENT_ID=123` becomes `instance.config.clientId = '123'`
 * - `CLIENT_SECRET=abc` becomes `instance.config.clientSecret = 'abc'`
 *
 * Environment variables are NOT used when the integration is executing in a
 * managed environment. For example, in JupiterOne, users configure
 * `instance.config` in a UI.
 */
export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  site: {
    type: 'string',
  },
  apiKey: {
    type: 'string',
    mask: true,
  },
};

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * The KnowBe4 site used to authenticate requests.
   * Typically either `us` or `eu`. 
   * Just a regional modifier to the base URL for the API
   * Used in ProviderClient.ts
   */
  site: string;

  /**
   * The KnowBe4 API Key used to authenticate requests.
   * A base64-encoded JWT
   */
  apiKey: string;

}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  if (!config.site || !config.apiKey) {
    throw new IntegrationValidationError(
      'Config requires all of {site, apiKey}',
    );
  }

  const apiClient = createAPIClient(config, context.logger);
  await apiClient.verifyAuthentication();
}
