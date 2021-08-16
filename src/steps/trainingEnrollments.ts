import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  IntegrationMissingKeyError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import {
  createTrainingEnrollmentRelationship,
  createTrainingCompletionRelationship,
} from '../converters';
import {
  MODULE_USER_RELATIONSHIP_TYPE,
  USER_MODULE_RELATIONSHIP_TYPE,
  TRAINING_MODULE_ENTITY_TYPE,
  USER_ENTITY_TYPE,
  UserEntity,
  TrainingModuleEntity,
  IdEntityMap,
} from '../types';

export async function fetchTrainingEnrollments({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  const userByIdMap = await jobState.getData<IdEntityMap<UserEntity>>(
    'USER_BY_ID_MAP',
  );

  if (!userByIdMap) {
    throw new IntegrationMissingKeyError(
      `Expected to find userByIdMap in jobState.`,
    );
  }

  const moduleByNameMap = await jobState.getData<
    IdEntityMap<TrainingModuleEntity>
  >('MODULE_BY_NAME_MAP');

  if (!moduleByNameMap) {
    throw new IntegrationMissingKeyError(
      `Expected to find moduleByNameMap in jobState.`,
    );
  }

  await apiClient.iterateTrainingEnrollments(async (enrollment) => {
    const module = moduleByNameMap[enrollment.module_name];
    const user = userByIdMap[enrollment.user.id];
    if (module && user) {
      await jobState.addRelationship(
        createTrainingEnrollmentRelationship(enrollment, module, user),
      );

      if (enrollment.status.toLowerCase() === 'passed') {
        await jobState.addRelationship(
          createTrainingCompletionRelationship(enrollment, module, user),
        );
      }
    } else {
      logger.warn(
        {},
        `Expected to find module ${enrollment.module_name} and user ${enrollment.user.id} in jobState maps`,
      );
    }
  });
}

export const trainingEnrollmentSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-enrollments',
    name: 'Fetch Training Enrollments',
    entities: [],
    relationships: [
      {
        _type: MODULE_USER_RELATIONSHIP_TYPE,
        _class: RelationshipClass.ASSIGNED,
        sourceType: TRAINING_MODULE_ENTITY_TYPE,
        targetType: USER_ENTITY_TYPE,
      },
      {
        _type: USER_MODULE_RELATIONSHIP_TYPE,
        _class: RelationshipClass.COMPLETED,
        sourceType: USER_ENTITY_TYPE,
        targetType: TRAINING_MODULE_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-campaigns', 'fetch-users'],
    executionHandler: fetchTrainingEnrollments,
  },
];
