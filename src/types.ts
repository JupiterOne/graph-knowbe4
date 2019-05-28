import {
  EntityFromIntegration,
  GraphClient,
  IntegrationExecutionContext,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import ProviderClient, { Group, User } from "./ProviderClient";

export const ACCOUNT_ENTITY_TYPE = "knowbe4_account";
export const ACCOUNT_ENTITY_CLASS = "Account";

export const USER_ENTITY_TYPE = "knowbe4_user";
export const USER_ENTITY_CLASS = "User";
export const ACCOUNT_USER_RELATIONSHIP_TYPE = "knowbe4_account_has_user";

export const GROUP_ENTITY_TYPE = "knowbe4_user_group";
export const GROUP_ENTITY_CLASS = "UserGroup";
export const ACCOUNT_GROUP_RELATIONSHIP_TYPE = "knowbe4_account_has_user_group";

export const USER_GROUP_RELATIONSHIP_TYPE = "knowbe4_user_group_membership";
export const USER_GROUP_RELATIONSHIP_CLASS = "HAS";

export const TRAINING_ENTITY_TYPE = "training_campaign";
export const TRAINING_ENTITY_CLASS = "Training";

export const TRAINING_MODULE_ENTITY_TYPE = "training_module";
export const TRAINING_MODULE_ENTITY_CLASS = ["Training", "Module"];

export const TRAINING_MODULE_RELATIONSHIP_TYPE = "training_has_module";
export const TRAINING_MODULE_RELATIONSHIP_CLASS = "HAS";

export interface IntegrationConfig {
  apiKey: string;
  site: string;
}

export interface AccountEntity extends EntityFromIntegration {
  name: string;
  type: string;
  domains: string[];
  admins: number[];
  subscription_level: string;
  subscription_end_date: string;
  number_of_seats: number;
  current_risk_score: number;
}

export interface UserEntity extends EntityFromIntegration, User {
  admin?: boolean;
  permissions?: string[];
}

export interface GroupEntity extends EntityFromIntegration, Group {}

export interface TrainingEntity extends EntityFromIntegration {
  campaign_id: number;
  name: string;
  groups: number[];
  status: string;
  modules: number[];
  content: number[];
  duration_type: string;
  start_date: string;
  end_date: string | null;
  relative_duration: string | null;
  auto_enroll: boolean;
  allow_multiple_enrollments: boolean;
}

export interface TrainingModuleEntity extends EntityFromIntegration {
  content_type: string;
  name: string;
  description?: string;
  type?: string;
  duration?: number;
  retired?: boolean;
  retirement_date?: string | null;
  publish_date?: string;
  publisher?: string;
  published?: boolean;
  purchase_date?: string;
  policy_url?: string | null;
  policy_id?: number;
  store_purchase_id?: number;
  minimum_time?: number;
  default_language?: string;
}

export interface ExecutionContext extends IntegrationExecutionContext {
  graph: GraphClient;
  persister: PersisterClient;
  provider: ProviderClient;
}
