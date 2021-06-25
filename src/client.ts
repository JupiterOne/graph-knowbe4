import {
  IntegrationLogger,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import { User, Group, TrainingCampaign } from './ProviderClient';
import ProviderClient from './ProviderClient';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 */
export class APIClient {
  provider: ProviderClient;
  constructor(readonly config: IntegrationConfig, logger: IntegrationLogger) {
    this.provider = new ProviderClient(config, logger);
  }

  public async verifyAuthentication(): Promise<void> {
    //lightweight authen check
    try {
      await this.provider.fetchAccountDetails();
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: this.provider.getBaseApi(),
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  /**
   * Iterates each KnowBe4 User resource.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(iteratee: ResourceIteratee<User>): Promise<void> {
    const users = await this.provider.fetchUsers();
    for (const user of users) {
      await iteratee(user);
    }
  }

  /**
   * Iterates each KnowBe4 Group resource.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateGroups(iteratee: ResourceIteratee<Group>): Promise<void> {
    const groups = await this.provider.fetchGroups();
    for (const group of groups) {
      await iteratee(group);
    }
  }
}

export function createAPIClient(
  config: IntegrationConfig,
  logger: IntegrationLogger,
): APIClient {
  return new APIClient(config, logger);
}
