import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import {
  Account,
  Group,
  PhishingCampaign,
  PhishingSecurityTest,
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
  USER_MODULE_RELATIONSHIP_TYPE,
  MODULE_USER_RELATIONSHIP_TYPE,
  TRAINING_ENTITY_CLASS,
  TRAINING_ENTITY_TYPE,
  TRAINING_MODULE_ENTITY_CLASS,
  TRAINING_MODULE_ENTITY_TYPE,
  TrainingEnrollmentRelationship,
  TrainingEntity,
  TrainingModuleEntity,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  UserEntity,
  PHISHING_CAMPAIGN_ENTITY_TYPE,
  PHISHING_SECURITY_TEST_ENTITY_TYPE,
} from './types';

import toCamelCase from './util/toCamelCase';

export function createAccountEntity(data: Account): AccountEntity {
  const admins: string[] = [];

  if (data.admins) {
    for (const admin of data.admins) {
      admins.push(admin.id);
    }
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

export function createPhishingCampaignEntity(data: PhishingCampaign): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: TRAINING_ENTITY_CLASS,
        _type: PHISHING_CAMPAIGN_ENTITY_TYPE,
        _key: `knowbe4:phishing:campaign:${data.campaign_id}`,
        name: data.name,
        displayName: data.name,
        id: data.campaign_id.toString(),
        lastPhishPronePercentage: data.last_phish_prone_percentage,
        lastRun: data.last_run,
        status: data.status,
        hidden: data.hidden,
        sendDuration: data.send_duration,
        trackDuration: data.track_duration,
        frequency: data.frequency,
        difficultyFilter: data.difficulty_filter,
        createdOn: parseTimePropertyValue(data.create_date),
        pstsCount: data.psts_count,
      },
    },
  });
}

export function createPhishingSecurityTestEntity(
  data: PhishingSecurityTest,
): Entity {
  const groups: number[] = [];
  data.groups.forEach((g) => {
    if (g.group_id !== undefined) {
      groups.push(g.group_id);
    }
  });

  const categories: number[] = [];
  data.categories.forEach((c) => {
    if (c.category_id !== undefined) {
      categories.push(c.category_id);
    }
  });

  const template: number[] = [];
  if (data.template.id !== undefined) {
    template.push(data.template.id);
  }

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: TRAINING_ENTITY_CLASS,
        _type: PHISHING_SECURITY_TEST_ENTITY_TYPE,
        _key: `knowbe4:phishing:security:${data.pst_id}`,
        name: data.name,
        displayName: data.name,
        id: data.campaign_id.toString(),
        status: data.status,
        groups: groups,
        phishPronePercentage: data.phish_prone_percentage,
        startedAt: data.started_at,
        sendDuration: data.duration,
        categories: categories,
        template: template,
        landingPage: data.landing_page?.id,
        scheduledCount: data.scheduled_count,
        deliveredCount: data.delivered_count,
        openedCount: data.opened_count,
        clickedCount: data.clicked_count,
        repliedCount: data.replied_count,
        attachmentOpenCount: data.attachment_open_count,
        macroEnabledCount: data.macro_enabled_count,
        dataEnteredCount: data.data_entered_count,
        vulnerablePluginCount: data.vulnerable_plugin_count,
        exploitedCount: data.exploited_count,
        reportedCount: data.reported_count,
        bouncedCount: data.bounced_count,
      },
    },
  });
}

export function createTrainingModuleEntity(
  d: TrainingContent,
): TrainingModuleEntity {
  return {
    ...(toCamelCase(d) as any),
    _class: TRAINING_MODULE_ENTITY_CLASS,
    _key: createTrainingModuleKey(d),
    _type: TRAINING_MODULE_ENTITY_TYPE,
    displayName: d.name,
  };
}

export function createTrainingModuleKey(d: Partial<TrainingContent>) {
  return `knowbe4:training:${
    d.store_purchase_id
      ? 'purchase:' + d.store_purchase_id
      : d.policy_id
      ? 'policy:' + d.policy_id
      : 'module:' + (d.name as string).toLowerCase()
  }`;
}

export function createTrainingEnrollmentRelationship(
  e: TrainingEnrollment,
  m: TrainingModuleEntity,
  u: UserEntity,
): TrainingEnrollmentRelationship {
  return {
    _class: RelationshipClass.ASSIGNED,
    _fromEntityKey: m._key,
    _key: `${m._key}_assigned_${u._key}`,
    _toEntityKey: u._key,
    _type: MODULE_USER_RELATIONSHIP_TYPE,
    assignedOn: parseTimePropertyValue(e.enrollment_date),
    startedOn: parseTimePropertyValue(e.start_date),
    completedOn: parseTimePropertyValue(e.completion_date),
    status: e.status,
    timeSpent: e.time_spent,
    policyAcknowledged: e.policy_acknowledged,
  };
}

export function createTrainingCompletionRelationship(
  e: TrainingEnrollment,
  m: TrainingModuleEntity,
  u: UserEntity,
): TrainingEnrollmentRelationship {
  return {
    _class: RelationshipClass.COMPLETED,
    _fromEntityKey: u._key,
    _key: `${u._key}_completed_${m._key}`,
    _toEntityKey: m._key,
    _type: USER_MODULE_RELATIONSHIP_TYPE,
    assignedOn: parseTimePropertyValue(e.enrollment_date),
    startedOn: parseTimePropertyValue(e.start_date),
    completedOn: parseTimePropertyValue(e.completion_date),
    status: e.status,
    timeSpent: e.time_spent,
    policyAcknowledged: e.policy_acknowledged,
  };
}
