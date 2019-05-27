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

export interface UserEntity extends EntityFromIntegration, User {}

export interface GroupEntity extends EntityFromIntegration, Group {}

export interface ExecutionContext extends IntegrationExecutionContext {
  graph: GraphClient;
  persister: PersisterClient;
  provider: ProviderClient;
}
