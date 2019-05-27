import {
  createAccountEntity,
  createAccountRelationships,
  createGroupEntities,
  createTrainingEntities,
  createUserEntities,
  createUserGroupRelationships,
} from "./converters";
import { Account, Group, TrainingCampaign, User } from "./ProviderClient";
import {
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  AccountEntity,
  GroupEntity,
  TrainingEntity,
  TrainingModuleEntity,
  USER_GROUP_RELATIONSHIP_CLASS,
  USER_GROUP_RELATIONSHIP_TYPE,
  UserEntity,
} from "./types";

/* tslint:disable */
const account: Account = require("./test-data/account.json");
const accountEntity: AccountEntity = require("./test-data/account-entity.json");

const users: User[] = require("./test-data/users.json");
const userEntities: UserEntity[] = require("./test-data/user-entities.json");

const groups: Group[] = require("./test-data/groups.json");
const groupEntities: GroupEntity[] = require("./test-data/group-entities.json");

const trainingCampaigns: TrainingCampaign[] = require("./test-data/training-campaigns.json");
const trainingEntities: TrainingEntity[] = require("./test-data/training-entities.json");
const trainingModules: TrainingModuleEntity[] = require("./test-data/training-module-entities.json");
/* tslint:enable */

test("createAccountEntity", () => {
  expect(createAccountEntity(account)).toEqual(accountEntity);
});

test("createAccountRelationships", () => {
  const relationships = [];

  for (const user of userEntities) {
    relationships.push({
      _class: "HAS",
      _fromEntityKey: "knowbe4:account:kb4-demo",
      _key: `knowbe4:account:kb4-demo_has_${user._key}`,
      _toEntityKey: user._key,
      _type: ACCOUNT_USER_RELATIONSHIP_TYPE,
    });
  }

  expect(
    createAccountRelationships(
      accountEntity,
      userEntities,
      ACCOUNT_USER_RELATIONSHIP_TYPE,
    ),
  ).toEqual(relationships);
});

test("createUserEntities", () => {
  expect(createUserEntities(users, accountEntity.admins)).toEqual(userEntities);
});

test("createGroupEntities", () => {
  expect(createGroupEntities(groups)).toEqual(groupEntities);
});

test("createTrainingEntities", () => {
  expect(createTrainingEntities(trainingCampaigns)).toEqual({
    trainingEntities,
    trainingModules,
  });
});

test("createUserGroupRelationships", () => {
  expect(createUserGroupRelationships(userEntities, groupEntities)).toEqual([
    {
      _class: USER_GROUP_RELATIONSHIP_CLASS,
      _fromEntityKey: "knowbe4:group:6276",
      _key: `knowbe4:group:6276_has_knowbe4:user:667548`,
      _toEntityKey: "knowbe4:user:667548",
      _type: USER_GROUP_RELATIONSHIP_TYPE,
    },
    {
      _class: USER_GROUP_RELATIONSHIP_CLASS,
      _fromEntityKey: "knowbe4:group:1759",
      _key: `knowbe4:group:1759_has_knowbe4:user:667548`,
      _toEntityKey: "knowbe4:user:667548",
      _type: USER_GROUP_RELATIONSHIP_TYPE,
    },
  ]);
});
