import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  IntegrationMissingKeyError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import { createGroupEntity } from '../converters';
import { DATA_ACCOUNT_ENTITY } from './account';
import {
  ACCOUNT_ENTITY_TYPE,
  GroupEntity,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  IdEntityMap,
} from '../types';

export async function fetchGroups({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  const accountEntity = (await jobState.getData(DATA_ACCOUNT_ENTITY)) as Entity;

  if (!accountEntity) {
    throw new IntegrationMissingKeyError(
      `Expected to find Account entity in jobState.`,
    );
  }

  //for use later in users.ts and trainingCampaigns.ts
  const groupByIdMap: IdEntityMap<GroupEntity> = {};

  await apiClient.iterateGroups(async (group) => {
    const groupEntity = (await jobState.addEntity(
      createGroupEntity(group),
    )) as GroupEntity;

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: groupEntity,
      }),
    );

    groupByIdMap[group.id] = groupEntity;
  });

  await jobState.setData('GROUP_BY_ID_MAP', groupByIdMap);
}

export const groupSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-groups',
    name: 'Fetch Groups',
    entities: [
      {
        resourceName: 'KnowBe4 Group',
        _type: GROUP_ENTITY_TYPE,
        _class: GROUP_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: ACCOUNT_GROUP_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: ACCOUNT_ENTITY_TYPE,
        targetType: GROUP_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchGroups,
  },
];
