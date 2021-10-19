import { Entity, ExplicitRelationship } from '@jupiterone/integration-sdk-core';

export const ACCOUNT_ENTITY_TYPE = 'knowbe4_account';
export const ACCOUNT_ENTITY_CLASS = ['Account'];

export const USER_ENTITY_TYPE = 'knowbe4_user';
export const USER_ENTITY_CLASS = ['User'];
export const ACCOUNT_USER_RELATIONSHIP_TYPE = 'knowbe4_account_has_user';

export const GROUP_ENTITY_TYPE = 'knowbe4_user_group';
export const GROUP_ENTITY_CLASS = ['UserGroup'];
export const ACCOUNT_GROUP_RELATIONSHIP_TYPE = 'knowbe4_account_has_user_group';

export const GROUP_USER_RELATIONSHIP_TYPE = 'knowbe4_user_group_has_user';

export const TRAINING_ENTITY_TYPE = 'training_campaign';
export const TRAINING_ENTITY_CLASS = ['Training'];

export const PHISHING_CAMPAIGN_ENTITY_TYPE = 'phishing_campaign';
export const ACCOUNT_PHISHING_CAMPAIGN_RELATIONSHIP_TYPE =
  'knowbe4_account_has_phishing_campaign';

export const TRAINING_MODULE_ENTITY_TYPE = 'training_module';
export const TRAINING_MODULE_ENTITY_CLASS = ['Training', 'Module'];

export const TRAINING_GROUP_RELATIONSHIP_TYPE =
  'training_campaign_assigned_knowbe4_user_group';

export const TRAINING_MODULE_RELATIONSHIP_TYPE = 'training_campaign_has_module';

export const MODULE_USER_RELATIONSHIP_TYPE = 'training_module_assigned_user';

export const USER_MODULE_RELATIONSHIP_TYPE = 'user_completed_training_module';

export interface AccountEntity extends Entity {
  name: string;
  type: string;
  domains: string[];
  admins: string[];
  subscriptionLevel: string;
  subscriptionEndDate: string;
  numberOfSeats: number;
  currentRiskScore: number;
}

export interface UserEntity extends Entity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admin?: boolean;
  permissions?: string[];
  employeeNumber: string | null;
  jobTitle: string | null;
  phishPronePercentage: number | null;
  phoneNumber: string | null;
  extension: string | null;
  mobilePhoneNumber: string | null;
  location: string | null;
  division: string | null;
  managerName: string | null;
  managerEmail: string | null;
  adiManageable: boolean | null;
  adiGuid: string | null;
  groups: string[];
  aliases: string[] | null;
  joinedOn: string | null;
  lastSignIn: string | null;
  status: string | null;
  organization: string | null;
  department: string | null;
  language: string | null;
  comment: string | null;
  employeeStartDate: string | null;
  archivedAt: string | null;
}

export interface GroupEntity extends Entity {
  id: string;
  groupId?: number;
  name: string;
  groupType: string;
  adiGuid: string | null;
  memberCount: number;
  status: string;
}

export interface TrainingEntity extends Entity {
  id: string;
  campaignId: number;
  name: string;
  groups: string[];
  status: string;
  modules: string[];
  content: number[];
  durationType: string;
  startDate: string;
  endDate: string | null;
  duration: string | null;
  autoEnroll: boolean;
  allowMultipleEnrollments: boolean;
}

export interface TrainingModuleEntity extends Entity {
  contentType: string;
  name: string;
  description?: string;
  type?: string;
  duration?: number;
  retired?: boolean;
  retirementDate?: string | null;
  publishDate?: string;
  publisher?: string;
  published?: boolean;
  purchaseDate?: string;
  policyUrl?: string | null;
  policyId?: number;
  storePurchaseId?: number;
  minimumTime?: number;
  defaultLanguage?: string;
}

export interface TrainingEnrollmentRelationship extends ExplicitRelationship {
  assignedOn?: number;
  startedOn?: number;
  completedOn?: number;
  status: string;
  timeSpent: number;
  policyAcknowledged: boolean;
}

export interface IdEntityMap<V> {
  [key: string]: V;
}
