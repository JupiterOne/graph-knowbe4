import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  IntegrationMissingKeyError,
  Entity,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import {
  createTrainingEntity,
  createTrainingModuleEntity,
} from '../converters';
import {
  TRAINING_ENTITY_TYPE,
  TRAINING_ENTITY_CLASS,
  TRAINING_GROUP_RELATIONSHIP_TYPE,
  TRAINING_MODULE_RELATIONSHIP_TYPE,
  TRAINING_MODULE_ENTITY_TYPE,
  TRAINING_MODULE_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GroupEntity,
  TrainingEntity,
  TrainingModuleEntity,
  IdEntityMap,
  ACCOUNT_TRAINING_RELATIONSHIP_TYPE,
  ACCOUNT_ENTITY_TYPE,
} from '../types';
import { DATA_ACCOUNT_ENTITY } from './account';

export async function fetchTrainingCampaigns({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  const groupByIdMap = await jobState.getData<IdEntityMap<GroupEntity>>(
    'GROUP_BY_ID_MAP',
  );

  const accountEntity = (await jobState.getData(DATA_ACCOUNT_ENTITY)) as Entity;

  if (!groupByIdMap) {
    throw new IntegrationMissingKeyError(
      `Expected to find groupByIdMap in jobState.`,
    );
  }

  //for use later in the TrainingEnrollments step
  const trainingModulesByName: IdEntityMap<TrainingModuleEntity> = {};

  await apiClient.iterateTrainingCampaigns(async (trainingCampaign) => {
    const trainingCampaignEntity = (await jobState.addEntity(
      createTrainingEntity(trainingCampaign),
    )) as TrainingEntity;

    //trainingCampaignEntity.groups is an array of numbers of group_id
    for (const group of trainingCampaignEntity.groups) {
      const groupEntity = groupByIdMap[String(group)];
      if (groupEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            from: trainingCampaignEntity,
            to: groupEntity,
          }),
        );
      }
    }

    //trainingCampaign.content is an array of type TrainingContent
    for (const module of trainingCampaign.content) {
      //if a module with that name does not exist, create it
      let trainingModuleEntity;
      if (!trainingModulesByName[module.name]) {
        trainingModuleEntity = (await jobState.addEntity(
          createTrainingModuleEntity(module),
        )) as TrainingModuleEntity;
        trainingModulesByName[module.name] = trainingModuleEntity;
      } else {
        trainingModuleEntity = trainingModulesByName[module.name];
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: trainingCampaignEntity,
          to: trainingModuleEntity,
        }),
      );
    }
    // add relationship between training campaign and account
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: trainingCampaignEntity,
      }),
    );
  });

  await jobState.setData('MODULE_BY_NAME_MAP', trainingModulesByName);
}

export const trainingCampaignSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-campaigns',
    name: 'Fetch Training Campaigns',
    entities: [
      {
        resourceName: 'KnowBe4 Training Campaign',
        _type: TRAINING_ENTITY_TYPE,
        _class: TRAINING_ENTITY_CLASS,
      },
      {
        resourceName: 'KnowBe4 Training Module',
        _type: TRAINING_MODULE_ENTITY_TYPE,
        _class: TRAINING_MODULE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: TRAINING_GROUP_RELATIONSHIP_TYPE,
        _class: RelationshipClass.ASSIGNED,
        sourceType: TRAINING_ENTITY_TYPE,
        targetType: GROUP_ENTITY_TYPE,
      },
      {
        _type: TRAINING_MODULE_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: TRAINING_ENTITY_TYPE,
        targetType: TRAINING_MODULE_ENTITY_TYPE,
      },
      {
        _type: ACCOUNT_TRAINING_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: ACCOUNT_ENTITY_TYPE,
        targetType: TRAINING_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-groups', 'fetch-account'],
    executionHandler: fetchTrainingCampaigns,
  },
];
