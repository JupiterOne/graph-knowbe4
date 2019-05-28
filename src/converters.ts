import {
  EntityFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  Account,
  Group,
  TrainingCampaign,
  TrainingContent,
  TrainingEnrollment,
  User,
} from "./ProviderClient";
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  AccountEntity,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GroupEntity,
  TRAINING_COMPLETION_RELATIONSHIP_CLASS,
  TRAINING_COMPLETION_RELATIONSHIP_TYPE,
  TRAINING_ENROLLMENT_RELATIONSHIP_CLASS,
  TRAINING_ENROLLMENT_RELATIONSHIP_TYPE,
  TRAINING_ENTITY_CLASS,
  TRAINING_ENTITY_TYPE,
  TRAINING_GROUP_RELATIONSHIP_CLASS,
  TRAINING_GROUP_RELATIONSHIP_TYPE,
  TRAINING_MODULE_ENTITY_CLASS,
  TRAINING_MODULE_ENTITY_TYPE,
  TRAINING_MODULE_RELATIONSHIP_CLASS,
  TRAINING_MODULE_RELATIONSHIP_TYPE,
  TrainingEnrollmentRelationship,
  TrainingEntity,
  TrainingModuleEntity,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  USER_GROUP_RELATIONSHIP_CLASS,
  USER_GROUP_RELATIONSHIP_TYPE,
  UserEntity,
} from "./types";
import getTime from "./util/getTime";

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

export function createUserEntities(
  data: User[],
  admins: number[],
): UserEntity[] {
  return data.map(d => ({
    ...d,
    _class: USER_ENTITY_CLASS,
    _key: `knowbe4:user:${d.id}`,
    _type: USER_ENTITY_TYPE,
    displayName: d.email,
    active: d.status === "active",
    admin: admins.includes(d.id),
    permissions: admins.includes(d.id) ? ["admin"] : [],
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

export interface TrainingCollection {
  trainingEntities: TrainingEntity[];
  trainingModules: TrainingModuleEntity[];
}

export function createTrainingEntities(
  data: TrainingCampaign[],
): TrainingCollection {
  const trainingEntities: TrainingEntity[] = [];
  const trainingModules: TrainingModuleEntity[] = [];

  data.forEach(d => {
    trainingEntities.push(createTrainingEntity(d));
    trainingModules.push(...createTrainingModuleEntities(d.content));
  });

  return {
    trainingEntities,
    trainingModules,
  };
}

export function createTrainingEntity(data: TrainingCampaign): TrainingEntity {
  const groups: number[] = [];
  const modules: number[] = [];
  const content: number[] = [];

  data.groups.forEach(g => {
    if (g.group_id !== undefined) {
      groups.push(g.group_id);
    }
  });

  data.modules.forEach(m => {
    if (m.store_purchase_id !== undefined) {
      modules.push(m.store_purchase_id);
    }
  });

  data.content.forEach(c => {
    if (c.policy_id !== undefined) {
      content.push(c.policy_id);
    }
  });

  return {
    _class: TRAINING_ENTITY_CLASS,
    _key: `knowbe4:training:campaign:${data.campaign_id}`,
    _type: TRAINING_ENTITY_TYPE,
    displayName: data.name,
    campaign_id: data.campaign_id,
    name: data.name,
    status: data.status,
    duration_type: data.duration_type,
    start_date: data.start_date,
    end_date: data.end_date,
    relative_duration: data.relative_duration,
    auto_enroll: data.auto_enroll,
    allow_multiple_enrollments: data.allow_multiple_enrollments,
    groups,
    modules,
    content,
  };
}

export function createTrainingModuleEntities(
  data: TrainingContent[],
): TrainingModuleEntity[] {
  return data.map(d => ({
    ...d,
    _class: TRAINING_MODULE_ENTITY_CLASS,
    _key: createTrainingModuleKey(d),
    _type: TRAINING_MODULE_ENTITY_TYPE,
    displayName: d.name,
  }));
}

function createTrainingModuleKey(
  d: Partial<TrainingContent | TrainingModuleEntity>,
) {
  return `knowbe4:training:${
    d.store_purchase_id
      ? "purchase:" + d.store_purchase_id
      : d.policy_id
      ? "policy:" + d.policy_id
      : "module:" + (d.name as string).toLowerCase()
  }`;
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
        relationships.push(createUserGroupRelationship(user, group));
      }
    }
  }

  return relationships;
}

function createUserGroupRelationship(
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

export function createTrainingModuleRelationships(
  trainings: TrainingEntity[],
  modules: TrainingModuleEntity[],
) {
  const modulesByKey: { [key: string]: TrainingModuleEntity } = {};
  for (const m of modules) {
    modulesByKey[m._key] = m;
  }

  const relationships = [];
  for (const t of trainings) {
    for (const item of t.content) {
      const m = modulesByKey[createTrainingModuleKey({ policy_id: item })];
      relationships.push(createTrainingModuleRelationship(t, m));
    }
    for (const item of t.modules) {
      const m =
        modulesByKey[createTrainingModuleKey({ store_purchase_id: item })];
      relationships.push(createTrainingModuleRelationship(t, m));
    }
  }

  return relationships;
}

function createTrainingModuleRelationship(
  t: TrainingEntity,
  m: TrainingModuleEntity,
): RelationshipFromIntegration {
  return {
    _class: TRAINING_MODULE_RELATIONSHIP_CLASS,
    _fromEntityKey: t._key,
    _key: `${t._key}_has_${m._key}`,
    _toEntityKey: m._key,
    _type: TRAINING_MODULE_RELATIONSHIP_TYPE,
  };
}

export function createTrainingGroupRelationships(
  trainings: TrainingEntity[],
  groups: GroupEntity[],
) {
  const groupsById: { [id: string]: GroupEntity } = {};
  for (const group of groups) {
    groupsById[group.id.toString()] = group;
  }

  const relationships = [];
  for (const t of trainings) {
    for (const item of t.groups) {
      const g = groupsById[item.toString()];
      if (g) {
        relationships.push(createTrainingGroupRelationship(t, g));
      }
    }
  }

  return relationships;
}

function createTrainingGroupRelationship(
  training: TrainingEntity,
  group: GroupEntity,
): RelationshipFromIntegration {
  return {
    _class: TRAINING_GROUP_RELATIONSHIP_CLASS,
    _fromEntityKey: training._key,
    _key: `${training._key}_assigned_${group._key}`,
    _toEntityKey: group._key,
    _type: TRAINING_GROUP_RELATIONSHIP_TYPE,
  };
}

export function createTrainingEnrollmentRelationships(
  enrollments: TrainingEnrollment[],
  modules: TrainingModuleEntity[],
  users: UserEntity[],
) {
  const modulesByName: { [name: string]: TrainingModuleEntity } = {};
  for (const m of modules) {
    modulesByName[m.name] = m;
  }

  const usersById: { [id: string]: UserEntity } = {};
  for (const u of users) {
    usersById[u.id.toString()] = u;
  }

  const relationships = [];
  for (const e of enrollments) {
    const m = modulesByName[e.module_name];
    const u = usersById[e.user.id];
    if (m && u) {
      relationships.push(createTrainingEnrollmentRelationship(e, m, u));
      if (e.status.toLowerCase() === "passed") {
        relationships.push(createTrainingCompletionRelationship(e, m, u));
      }
    }
  }

  return relationships;
}

function createTrainingEnrollmentRelationship(
  e: TrainingEnrollment,
  m: TrainingModuleEntity,
  u: UserEntity,
): TrainingEnrollmentRelationship {
  return {
    _class: TRAINING_ENROLLMENT_RELATIONSHIP_CLASS,
    _fromEntityKey: m._key,
    _key: `${m._key}_assigned_${u._key}`,
    _toEntityKey: u._key,
    _type: TRAINING_ENROLLMENT_RELATIONSHIP_TYPE,
    assignedOn: getTime(e.enrollment_date),
    startedOn: getTime(e.start_date),
    completedOn: getTime(e.completion_date),
    status: e.status,
    time_spent: e.time_spent,
    policy_acknowledged: e.policy_acknowledged,
  };
}

function createTrainingCompletionRelationship(
  e: TrainingEnrollment,
  m: TrainingModuleEntity,
  u: UserEntity,
): TrainingEnrollmentRelationship {
  return {
    _class: TRAINING_COMPLETION_RELATIONSHIP_CLASS,
    _fromEntityKey: u._key,
    _key: `${u._key}_completed_${m._key}`,
    _toEntityKey: m._key,
    _type: TRAINING_COMPLETION_RELATIONSHIP_TYPE,
    assignedOn: getTime(e.enrollment_date),
    startedOn: getTime(e.start_date),
    completedOn: getTime(e.completion_date),
    status: e.status,
    time_spent: e.time_spent,
    policy_acknowledged: e.policy_acknowledged,
  };
}
