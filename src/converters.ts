import {
  EntityFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { Account, Group, User } from "./ProviderClient";
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  AccountEntity,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GroupEntity,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  USER_GROUP_RELATIONSHIP_CLASS,
  USER_GROUP_RELATIONSHIP_TYPE,
  UserEntity,
} from "./types";

export function createAccountEntity(data: Account): AccountEntity {
  const admins = [];

  for (const admin of data.admins) {
    admins.push(admin.id);
  }
  return {
    _class: ACCOUNT_ENTITY_CLASS,
    _key: `knowbe4:account:${data.name.toLowerCase()}`,
    _type: ACCOUNT_ENTITY_TYPE,
    displayName: data.name,
    name: data.name,
    type: data.type,
    domains: data.domains,
    admins,
    subscription_level: data.subscription_level,
    subscription_end_date: data.subscription_end_date,
    number_of_seats: data.number_of_seats,
    current_risk_score: data.current_risk_score,
  };
}

export function createUserEntities(data: User[]): UserEntity[] {
  return data.map(d => ({
    ...d,
    _class: USER_ENTITY_CLASS,
    _key: `knowbe4:user:${d.id}`,
    _type: USER_ENTITY_TYPE,
    displayName: d.email,
    active: d.status === "active",
  }));
}

export function createGroupEntities(data: Group[]): GroupEntity[] {
  return data.map(d => ({
    ...d,
    _class: GROUP_ENTITY_CLASS,
    _key: `knowbe4:group:${d.id}`,
    _type: GROUP_ENTITY_TYPE,
    displayName: d.name,
    active: d.status === "active",
  }));
}

export function createAccountRelationships(
  account: AccountEntity,
  entities: EntityFromIntegration[],
  type: string,
) {
  const relationships = [];
  for (const entity of entities) {
    relationships.push(createAccountRelationship(account, entity, type));
  }

  return relationships;
}

export function createAccountRelationship(
  account: AccountEntity,
  entity: EntityFromIntegration,
  type: string,
): RelationshipFromIntegration {
  return {
    _class: "HAS",
    _fromEntityKey: account._key,
    _key: `${account._key}_has_${entity._key}`,
    _toEntityKey: entity._key,
    _type: type,
  };
}

export function createUserGroupRelationships(
  users: UserEntity[],
  groups: GroupEntity[],
) {
  const groupsById: { [id: string]: GroupEntity } = {};
  for (const group of groups) {
    groupsById[group.id.toString()] = group;
  }

  const relationships = [];
  for (const user of users) {
    for (const groupId of user.groups) {
      const group = groupsById[groupId.toString()];
      if (group) {
        relationships.push(createUserDeviceRelationship(user, group));
      }
    }
  }

  return relationships;
}

function createUserDeviceRelationship(
  user: UserEntity,
  group: GroupEntity,
): RelationshipFromIntegration {
  return {
    _class: USER_GROUP_RELATIONSHIP_CLASS,
    _fromEntityKey: group._key,
    _key: `${group._key}_has_${user._key}`,
    _toEntityKey: user._key,
    _type: USER_GROUP_RELATIONSHIP_TYPE,
  };
}
