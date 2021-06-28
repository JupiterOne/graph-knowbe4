import {
  Entity,
  parseTimePropertyValue,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import groupBy from 'lodash.groupby';

import {
  Account,
  Group,
  TrainingCampaign,
  TrainingContent,
  TrainingEnrollment,
  User,
} from './ProviderClient';
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  AccountEntity,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GroupEntity,
  TRAINING_COMPLETION_RELATIONSHIP_TYPE,
  TRAINING_ENROLLMENT_RELATIONSHIP_TYPE,
  TRAINING_ENTITY_CLASS,
  TRAINING_ENTITY_TYPE,
  TRAINING_GROUP_RELATIONSHIP_TYPE,
  TRAINING_MODULE_ENTITY_CLASS,
  TRAINING_MODULE_ENTITY_TYPE,
  TRAINING_MODULE_RELATIONSHIP_TYPE,
  TrainingEnrollmentRelationship,
  TrainingEntity,
  TrainingModuleEntity,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  USER_GROUP_RELATIONSHIP_TYPE,
  UserEntity,
} from './types';
import { filterDuplicateModules } from './util/filterDuplicateModules';
import { findMostRelevantEnrollment } from './util/findMostRelevantEnrollment';
import toCamelCase from './util/toCamelCase';

export function createAccountEntity(data: Account): AccountEntity {
  const admins: string[] = [];

  for (const admin of data.admins) {
    admins.push(admin.id);
  }
  return {
    ...(toCamelCase(data) as any),
    _class: ACCOUNT_ENTITY_CLASS,
    _key: `knowbe4:account:${data.name.toLowerCase()}`,
    _type: ACCOUNT_ENTITY_TYPE,
    displayName: data.name,
    name: data.name,
    type: data.type,
    domains: data.domains,
    admins,
  };
}

export function createUserEntity(d: User, admins: string[]): UserEntity {
  return {
    ...(toCamelCase(d) as any),
    _class: USER_ENTITY_CLASS,
    _key: `knowbe4:user:${d.id}`,
    _type: USER_ENTITY_TYPE,
    displayName: d.email,
    active: d.status === 'active',
    admin: admins.includes(d.id),
    permissions: admins.includes(d.id) ? ['admin'] : [],
  };
}

export function createGroupEntity(d: Group): GroupEntity {
  return {
    ...(toCamelCase(d) as any),
    _class: GROUP_ENTITY_CLASS,
    _key: `knowbe4:group:${d.id}`,
    _type: GROUP_ENTITY_TYPE,
    displayName: d.name,
    active: d.status === 'active',
  };
}

export interface TrainingCollection {
  trainingEntities: TrainingEntity[];
  trainingModules: TrainingModuleEntity[];
}

export function createTrainingEntities(
  data: TrainingCampaign[],
): TrainingCollection {
  const trainingEntities: TrainingEntity[] = [];
  let trainingModules: TrainingModuleEntity[] = [];

  data.forEach((d) => {
    trainingEntities.push(createTrainingEntity(d));
    trainingModules = trainingModules.concat(
      createTrainingModuleEntities(d.content),
    );
  });

  return {
    trainingEntities,
    trainingModules: filterDuplicateModules(trainingModules),
  };
}

export function createTrainingEntity(data: TrainingCampaign): TrainingEntity {
  const groups: number[] = [];
  const modules: number[] = [];
  const content: number[] = [];

  data.groups.forEach((g) => {
    if (g.group_id !== undefined) {
      groups.push(g.group_id);
    }
  });

  data.modules.forEach((m) => {
    if (m.store_purchase_id !== undefined) {
      modules.push(m.store_purchase_id);
    }
  });

  data.content.forEach((c) => {
    if (c.policy_id !== undefined) {
      content.push(c.policy_id);
    }
  });

  return {
    ...(toCamelCase(data) as any),
    _class: TRAINING_ENTITY_CLASS,
    _key: `knowbe4:training:campaign:${data.campaign_id}`,
    _type: TRAINING_ENTITY_TYPE,
    displayName: data.name,
    id: data.campaign_id,
    groups,
    modules,
    content,
  };
}

export function createTrainingModuleEntities(
  data: TrainingContent[],
): TrainingModuleEntity[] {
  return data.map((d) => ({
    ...(toCamelCase(d) as any),
    _class: TRAINING_MODULE_ENTITY_CLASS,
    _key: createTrainingModuleKey(d),
    _type: TRAINING_MODULE_ENTITY_TYPE,
    displayName: d.name,
  }));
}

function createTrainingModuleKey(d: Partial<TrainingContent>) {
  return `knowbe4:training:${
    d.store_purchase_id
      ? 'purchase:' + d.store_purchase_id
      : d.policy_id
      ? 'policy:' + d.policy_id
      : 'module:' + (d.name as string).toLowerCase()
  }`;
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
): Relationship {
  return {
    _class: RelationshipClass.HAS,
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
): Relationship {
  return {
    _class: RelationshipClass.ASSIGNED,
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

  const relationships: TrainingEnrollmentRelationship[] = [];
  const enrollmentsByUserIdAndModule = groupBy(
    enrollments,
    (e) => `${e.user.id}|${e.module_name}`,
  );
  for (const userIdModulePair of Object.keys(enrollmentsByUserIdAndModule)) {
    const e = findMostRelevantEnrollment(
      enrollmentsByUserIdAndModule[userIdModulePair],
    );
    const m = modulesByName[e.module_name];
    const u = usersById[e.user.id];
    if (m && u) {
      relationships.push(createTrainingEnrollmentRelationship(e, m, u));
      if (e.status.toLowerCase() === 'passed') {
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
    _class: RelationshipClass.ASSIGNED,
    _fromEntityKey: m._key,
    _key: `${m._key}_assigned_${u._key}`,
    _toEntityKey: u._key,
    _type: TRAINING_ENROLLMENT_RELATIONSHIP_TYPE,
    assignedOn: parseTimePropertyValue(e.enrollment_date),
    startedOn: parseTimePropertyValue(e.start_date),
    completedOn: parseTimePropertyValue(e.completion_date),
    status: e.status,
    timeSpent: e.time_spent,
    policyAcknowledged: e.policy_acknowledged,
  };
}

function createTrainingCompletionRelationship(
  e: TrainingEnrollment,
  m: TrainingModuleEntity,
  u: UserEntity,
): TrainingEnrollmentRelationship {
  return {
    _class: 'COMPLETED', //change to RelationshipClass.COMPLETED when possible
    _fromEntityKey: u._key,
    _key: `${u._key}_completed_${m._key}`,
    _toEntityKey: m._key,
    _type: TRAINING_COMPLETION_RELATIONSHIP_TYPE,
    assignedOn: parseTimePropertyValue(e.enrollment_date),
    startedOn: parseTimePropertyValue(e.start_date),
    completedOn: parseTimePropertyValue(e.completion_date),
    status: e.status,
    timeSpent: e.time_spent,
    policyAcknowledged: e.policy_acknowledged,
  };
}
