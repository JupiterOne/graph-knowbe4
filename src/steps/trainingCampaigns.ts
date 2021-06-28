import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  IntegrationMissingKeyError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import {
  createTrainingEntity,
  createTrainingModuleKey,
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
} from '../types';

export async function fetchTrainingCampaigns({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  const groupByIdMap = await jobState.getData<IdEntityMap<GroupEntity>>(
    'GROUP_BY_ID_MAP',
  );

  if (!groupByIdMap) {
    throw new IntegrationMissingKeyError(
      `Expected to find groupByIdMap in jobState.`,
    );
  }

  const trainingModulesByKey: IdEntityMap<TrainingModuleEntity> = {};

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
    //load all modules here, though some will be the same, overwriting previous onces
    //when all campaigns are processed, we should have a map of uniques
    for (const module of trainingCampaign.content) {
      //if a module with that key does not exist, create it
      let trainingModuleEntity;
      if (!trainingModulesByKey[createTrainingModuleKey(module)]) {
        trainingModuleEntity = (await jobState.addEntity(
          createTrainingModuleEntity(module),
        )) as TrainingModuleEntity;
        trainingModulesByKey[createTrainingModuleKey(module)] =
          trainingModuleEntity;
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: trainingCampaignEntity,
          to: trainingModuleEntity,
        }),
      );
    }
  });

  //this might need to be an array instead of a map or something... still need to figure out
  //TrainingEnrollments that come from provider via .fetchTrainingEnrollments
  await jobState.setData('MODULE_MAP_BY_KEY', trainingModulesByKey);
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
    ],
    dependsOn: ['fetch-groups'],
    executionHandler: fetchTrainingCampaigns,
  },
];
