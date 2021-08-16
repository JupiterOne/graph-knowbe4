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
  GROUP_USER_RELATIONSHIP_TYPE,
  UserEntity,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  GroupEntity,
  AccountEntity,
  IdEntityMap,
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

  const groupByIdMap = await jobState.getData<IdEntityMap<GroupEntity>>(
    'GROUP_BY_ID_MAP',
  );

  if (!groupByIdMap) {
    throw new IntegrationMissingKeyError(
      `Expected to find groupByIdMap in jobState.`,
    );
  }

  //for use later in trainingEnrollments
  const userByIdMap: IdEntityMap<UserEntity> = {};

  await apiClient.iterateUsers(async (user) => {
    const userEntity = (await jobState.addEntity(
      createUserEntity(user, accountEntity.admins),
    )) as UserEntity;
    userByIdMap[user.id.toString()] = userEntity;

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: userEntity,
      }),
    );

    if (user.groups) {
      for (const group of user.groups) {
        const groupEntity = groupByIdMap[group];
        if (groupEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: groupEntity,
              to: userEntity,
            }),
          );
        }
      }
    }
  });

  await jobState.setData('USER_BY_ID_MAP', userByIdMap);
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
      {
        _type: GROUP_USER_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: GROUP_ENTITY_TYPE,
        targetType: USER_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-groups'],
    executionHandler: fetchUsers,
  },
];
