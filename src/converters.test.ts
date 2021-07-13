import {
  createAccountEntity,
  createGroupEntity,
  createTrainingEntity,
  createUserEntity,
  createTrainingModuleEntity,
} from './converters';
import { Account, Group, TrainingCampaign, User } from './ProviderClient';
import {
  AccountEntity,
  GroupEntity,
  TrainingEntity,
  TrainingModuleEntity,
  UserEntity,
} from './types';

/* tslint:disable */
const account: Account = require('./test-data/account.json');
const accountEntity: AccountEntity = require('./test-data/account-entity.json');

const users: User[] = require('./test-data/users.json');
const userEntities: UserEntity[] = require('./test-data/user-entities.json');

const groups: Group[] = require('./test-data/groups.json');
const groupEntities: GroupEntity[] = require('./test-data/group-entities.json');

const trainingCampaigns: TrainingCampaign[] = require('./test-data/training-campaigns.json');
const trainingEntities: TrainingEntity[] = require('./test-data/training-entities.json');
const trainingModules: TrainingModuleEntity[] = require('./test-data/training-module-entities.json');
/* tslint:enable */

test('createAccountEntity', () => {
  expect(createAccountEntity(account)).toEqual(accountEntity);
});

test('createUserEntities', () => {
  const receivedUserEntities: UserEntity[] = [];
  for (const user of users) {
    receivedUserEntities.push(createUserEntity(user, accountEntity.admins));
  }
  expect(receivedUserEntities).toEqual(userEntities);
});

test('createGroupEntities', () => {
  const receivedGroupEntities: GroupEntity[] = [];
  for (const group of groups) {
    receivedGroupEntities.push(createGroupEntity(group));
  }
  expect(receivedGroupEntities).toEqual(groupEntities);
});

test('createTrainingEntities', () => {
  const receivedTrainingCampaignEntities: TrainingEntity[] = [];
  const receivedTrainingModuleEntities: TrainingModuleEntity[] = [];
  for (const trainingCampaign of trainingCampaigns) {
    receivedTrainingCampaignEntities.push(
      createTrainingEntity(trainingCampaign),
    );
    for (const module of trainingCampaign.content) {
      receivedTrainingModuleEntities.push(createTrainingModuleEntity(module));
    }
  }
  expect(receivedTrainingCampaignEntities).toEqual(trainingEntities);
  expect(receivedTrainingModuleEntities).toEqual(trainingModules);
});
