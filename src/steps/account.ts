import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../config';
import { createAccountEntity } from '../converters';
import { createAPIClient } from '../client';
import { ACCOUNT_ENTITY_TYPE, ACCOUNT_ENTITY_CLASS } from '../types';

export const DATA_ACCOUNT_ENTITY = 'DATA_ACCOUNT_ENTITY';

export async function fetchAccountDetails({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);
  const account = await apiClient.provider.fetchAccountDetails();
  if (!account.admins) {
    logger.warn('Warning: No admins detected for this account');
  }
  const accountEntity = await jobState.addEntity(createAccountEntity(account));
  await jobState.setData(DATA_ACCOUNT_ENTITY, accountEntity);
}

export const accountSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-account',
    name: 'Fetch Account Details',
    entities: [
      {
        resourceName: 'KnowBe4 Account',
        _type: ACCOUNT_ENTITY_TYPE,
        _class: ACCOUNT_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAccountDetails,
  },
];
