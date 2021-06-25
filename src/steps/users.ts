import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  IntegrationMissingKeyError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import { createUserEntity } from '../converters';
import { DATA_ACCOUNT_ENTITY } from './account';
import {
  ACCOUNT_ENTITY_TYPE,
  GROUP_ENTITY_TYPE,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  USER_GROUP_RELATIONSHIP_TYPE,
  UserEntity,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  GroupEntity,
  AccountEntity,
} from '../types';

export async function fetchUsers({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  const accountEntity = (await jobState.getData(
    DATA_ACCOUNT_ENTITY,
  )) as AccountEntity;

  if (!accountEntity) {
    throw new IntegrationMissingKeyError(
      `Expected to find Account entity in jobState.`,
    );
  }

  //for use later in other steps
  const userEntities: UserEntity[] = [];

  await apiClient.iterateUsers(async (user) => {
    const userEntity = (await jobState.addEntity(
      createUserEntity(user, accountEntity.admins),
    )) as UserEntity;
    userEntities.push(userEntity);

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: userEntity,
      }),
    );
  });

  await jobState.setData('USER_ARRAY', userEntities);
}

export const userSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [
      {
        resourceName: 'KnowBe4 User',
        _type: USER_ENTITY_TYPE,
        _class: USER_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: ACCOUNT_USER_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: ACCOUNT_ENTITY_TYPE,
        targetType: USER_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchUsers,
  },
];
