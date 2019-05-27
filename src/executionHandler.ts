import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAccountEntity,
  createAccountRelationships,
  createGroupEntities,
  createUserEntities,
  createUserGroupRelationships,
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
  USER_ENTITY_TYPE,
  USER_GROUP_RELATIONSHIP_TYPE,
  UserEntity,
} from "./types";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, provider } = initializeContext(context);

  const [
    oldAccountEntities,
    oldUserEntities,
    oldGroupEntities,
    oldAccountRelationships,
    oldUserGroupRelationships,
    newAccountEntities,
    newUserEntities,
    newGroupEntities,
  ] = await Promise.all([
    graph.findEntitiesByType<AccountEntity>(ACCOUNT_ENTITY_TYPE),
    graph.findEntitiesByType<UserEntity>(USER_ENTITY_TYPE),
    graph.findEntitiesByType<GroupEntity>(GROUP_ENTITY_TYPE),
    graph.findRelationshipsByType([
      ACCOUNT_USER_RELATIONSHIP_TYPE,
      ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    ]),
    graph.findRelationshipsByType(USER_GROUP_RELATIONSHIP_TYPE),
    fetchAccountEntitiesFromProvider(provider),
    fetchUserEntitiesFromProvider(provider),
    fetchGroupEntitiesFromProvider(provider),
  ]);

  const [accountEntity] = newAccountEntities;
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
): Promise<AccountEntity[]> {
  return [createAccountEntity(await provider.fetchAccountDetails())];
}

async function fetchUserEntitiesFromProvider(
  provider: ProviderClient,
): Promise<UserEntity[]> {
  return createUserEntities(await provider.fetchUsers());
}

async function fetchGroupEntitiesFromProvider(
  provider: ProviderClient,
): Promise<GroupEntity[]> {
  return createGroupEntities(await provider.fetchGroups());
}
