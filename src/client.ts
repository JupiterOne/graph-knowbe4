import {
  IntegrationLogger,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import {
  User,
  Group,
  TrainingCampaign,
  TrainingEnrollment,
} from './ProviderClient';
import ProviderClient from './ProviderClient';
import groupBy from 'lodash.groupby';
import { findMostRelevantEnrollment } from './util/findMostRelevantEnrollment';

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
   * Iterates each KnowBe4 TrainingCampaign resource.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateTrainingCampaigns(
    iteratee: ResourceIteratee<TrainingCampaign>,
  ): Promise<void> {
    const trainingCampaigns = await this.provider.fetchTraining();
    for (const trainingCampaign of trainingCampaigns) {
      await iteratee(trainingCampaign);
    }
  }

  /**
   * Iterates each KnowBe4 TrainingCampaign resource.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateTrainingEnrollments(
    iteratee: ResourceIteratee<TrainingEnrollment>,
  ): Promise<void> {
    const enrollments = await this.provider.fetchTrainingEnrollments();
    //there can be multiple enrollments for a given user to a given module,
    //so we must group them by unique user-module pairs and select the most
    //revelant enrollment to use as the basis for relationships
    const enrollmentsByUserIdAndModule = groupBy(
      enrollments,
      (e) => `${e.user.id}|${e.module_name}`,
    );
    for (const userIdModulePair of Object.keys(enrollmentsByUserIdAndModule)) {
      const enrollment = findMostRelevantEnrollment(
        enrollmentsByUserIdAndModule[userIdModulePair],
      );
      await iteratee(enrollment);
    }
  }
}

export function createAPIClient(
  config: IntegrationConfig,
  logger: IntegrationLogger,
): APIClient {
  return new APIClient(config, logger);
}
