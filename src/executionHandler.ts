import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAccountEntity,
  createAccountRelationships,
  createGroupEntities,
  createTrainingEnrollmentRelationships,
  createTrainingEntities,
  createTrainingGroupRelationships,
  createTrainingModuleRelationships,
  createUserEntities,
  createUserGroupRelationships,
  TrainingCollection,
} from "./converters";
import initializeContext from "./initializeContext";
import ProviderClient from "./ProviderClient";
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  AccountEntity,
  GROUP_ENTITY_TYPE,
  GroupEntity,
  TRAINING_COMPLETION_RELATIONSHIP_TYPE,
  TRAINING_ENROLLMENT_RELATIONSHIP_TYPE,
  TRAINING_ENTITY_TYPE,
  TRAINING_GROUP_RELATIONSHIP_TYPE,
  TRAINING_MODULE_ENTITY_TYPE,
  TRAINING_MODULE_RELATIONSHIP_TYPE,
  USER_ENTITY_TYPE,
  USER_GROUP_RELATIONSHIP_TYPE,
  UserEntity,
} from "./types";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, provider } = initializeContext(context);

  const accountEntity = await fetchAccountEntitiesFromProvider(provider);
  const newAccountEntities = [accountEntity];

  const [
    oldAccountEntities,
    oldUserEntities,
    oldGroupEntities,
    oldTrainingEntities,
    oldAccountRelationships,
    oldTrainingEnrollmentRelationships,
    oldTrainingModuleRelationships,
    oldTrainingGroupRelationships,
    oldUserGroupRelationships,
  ] = await Promise.all([
    graph.findEntitiesByType<AccountEntity>(ACCOUNT_ENTITY_TYPE),
    graph.findEntitiesByType<UserEntity>(USER_ENTITY_TYPE),
    graph.findEntitiesByType<GroupEntity>(GROUP_ENTITY_TYPE),
    graph.findEntitiesByType([
      TRAINING_ENTITY_TYPE,
      TRAINING_MODULE_ENTITY_TYPE,
    ]),
    graph.findRelationshipsByType([
      ACCOUNT_USER_RELATIONSHIP_TYPE,
      ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    ]),
    graph.findRelationshipsByType([
      TRAINING_ENROLLMENT_RELATIONSHIP_TYPE,
      TRAINING_COMPLETION_RELATIONSHIP_TYPE,
    ]),
    graph.findRelationshipsByType(TRAINING_MODULE_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(TRAINING_GROUP_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(USER_GROUP_RELATIONSHIP_TYPE),
  ]);

  const [
    newUserEntities,
    newGroupEntities,
    newTrainingCollection,
  ] = await Promise.all([
    fetchUserEntitiesFromProvider(provider, accountEntity.admins),
    fetchGroupEntitiesFromProvider(provider),
    fetchTrainingEntitiesFromProvider(provider),
  ]);

  const newAccountRelationships = [
    ...createAccountRelationships(
      accountEntity,
      newUserEntities,
      ACCOUNT_USER_RELATIONSHIP_TYPE,
    ),
    ...createAccountRelationships(
      accountEntity,
      newGroupEntities,
      ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    ),
  ];

  const newTrainingEnrollmentRelationships = createTrainingEnrollmentRelationships(
    await provider.fetchTrainingEnrollments(),
    newTrainingCollection.trainingModules,
    newUserEntities,
  );

  const newTrainingModuleRelationships = createTrainingModuleRelationships(
    newTrainingCollection.trainingEntities,
    newTrainingCollection.trainingModules,
  );

  const newTrainingGroupRelationships = createTrainingGroupRelationships(
    newTrainingCollection.trainingEntities,
    newGroupEntities,
  );

  const newUserGroupRelationships = createUserGroupRelationships(
    newUserEntities,
    newGroupEntities,
  );

  return {
    operations: await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldAccountEntities, newAccountEntities),
        ...persister.processEntities(oldUserEntities, newUserEntities),
        ...persister.processEntities(oldGroupEntities, newGroupEntities),
        ...persister.processEntities(oldTrainingEntities, [
          ...newTrainingCollection.trainingEntities,
          ...newTrainingCollection.trainingModules,
        ]),
      ],
      [
        ...persister.processRelationships(
          oldUserGroupRelationships as RelationshipFromIntegration[],
          newUserGroupRelationships,
        ),
        ...persister.processRelationships(
          oldAccountRelationships as RelationshipFromIntegration[],
          newAccountRelationships,
        ),
        ...persister.processRelationships(
          oldTrainingEnrollmentRelationships as RelationshipFromIntegration[],
          newTrainingEnrollmentRelationships,
        ),
        ...persister.processRelationships(
          oldTrainingModuleRelationships as RelationshipFromIntegration[],
          newTrainingModuleRelationships,
        ),
        ...persister.processRelationships(
          oldTrainingGroupRelationships as RelationshipFromIntegration[],
          newTrainingGroupRelationships,
        ),
      ],
    ]),
  };
}

async function fetchAccountEntitiesFromProvider(
  provider: ProviderClient,
): Promise<AccountEntity> {
  return createAccountEntity(await provider.fetchAccountDetails());
}

async function fetchUserEntitiesFromProvider(
  provider: ProviderClient,
  admins: number[],
): Promise<UserEntity[]> {
  return createUserEntities(await provider.fetchUsers(), admins);
}

async function fetchGroupEntitiesFromProvider(
  provider: ProviderClient,
): Promise<GroupEntity[]> {
  return createGroupEntities(await provider.fetchGroups());
}

async function fetchTrainingEntitiesFromProvider(
  provider: ProviderClient,
): Promise<TrainingCollection> {
  return createTrainingEntities(await provider.fetchTraining());
}
