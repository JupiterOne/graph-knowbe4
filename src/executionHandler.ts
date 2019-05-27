import {
  EntityFromIntegration,
  IntegrationExecutionContext,
  IntegrationExecutionResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAccountEntity,
  createAccountRelationships,
  createGroupEntities,
  createTrainingEntities,
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
  TRAINING_ENTITY_TYPE,
  TRAINING_MODULE_ENTITY_TYPE,
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
    oldUserGroupRelationships,
    newUserEntities,
    newGroupEntities,
    newTrainingEntities,
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
    graph.findRelationshipsByType(USER_GROUP_RELATIONSHIP_TYPE),
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
        ...persister.processEntities(oldTrainingEntities, newTrainingEntities),
      ],
      [
        ...persister.processRelationships(
          oldUserGroupRelationships,
          newUserGroupRelationships,
        ),
        ...persister.processRelationships(
          oldAccountRelationships,
          newAccountRelationships,
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
): Promise<EntityFromIntegration[]> {
  const collection: TrainingCollection = createTrainingEntities(
    await provider.fetchTraining(),
  );
  return [...collection.trainingEntities, ...collection.trainingModules];
}
