import {
  createAccountEntity,
  createGroupEntity,
  createTrainingEntity,
  createUserEntity,
  createTrainingModuleEntity,
  createPhishingCampaignEntity,
  createPhishingSecurityTestEntity,
  createPhishingSecurityTestResultEntity,
} from './converters';
import {
  Account,
  Group,
  PhishingCampaign,
  PhishingSecurityTest,
  PhishingSecurityTestResult,
  TrainingCampaign,
  User,
} from './ProviderClient';
import {
  AccountEntity,
  GroupEntity,
  TrainingEntity,
  TrainingModuleEntity,
  UserEntity,
  TRAINING_ENTITY_CLASS,
  ASSESSMENT_ENTITY_CLASS,
  PHISHING_CAMPAIGN_ENTITY_TYPE,
  PHISHING_SECURITY_TEST_ENTITY_TYPE,
  PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
  RECORD_ENTITY_CLASS,
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
  const alreadyReceivedModules = {};
  for (const trainingCampaign of trainingCampaigns) {
    receivedTrainingCampaignEntities.push(
      createTrainingEntity(trainingCampaign),
    );
    for (const module of trainingCampaign.content) {
      if (!alreadyReceivedModules[module.name]) {
        alreadyReceivedModules[module.name] = module;
        receivedTrainingModuleEntities.push(createTrainingModuleEntity(module));
      }
    }
  }
  expect(receivedTrainingCampaignEntities).toEqual(trainingEntities);
  expect(receivedTrainingModuleEntities).toEqual(trainingModules);
});

test('should convert phishingSecurityTest to entity', () => {
  const phishingSecurityTest = {
    campaign_id: 242333,
    pst_id: 509579,
    status: 'Closed',
    name: 'Corporate Test 001',
    groups: [
      {
        group_id: 16342,
        name: 'Corporate Employees',
      },
      {
        group_id: 22222,
        name: 'Corporate Bosses',
      },
    ],
    phish_prone_percentage: 0.5,
    started_at: '2019-04-02T15:02:38.000Z',
    duration: 1,
    categories: [
      {
        category_id: 4237,
        name: 'Current Events',
      },
    ],
    template: {
      id: 11428,
      name: 'CNN Breaking News',
    },
    landing_page: {
      id: 4072,
      name: 'Verify Java',
    },
    scheduled_count: 42,
    delivered_count: 4,
    opened_count: 24,
    clicked_count: 20,
    replied_count: 0,
    attachment_open_count: 3,
    macro_enabled_count: 0,
    data_entered_count: 0,
    vulnerable_plugin_count: 0,
    exploited_count: 2,
    reported_count: 0,
    bounced_count: 0,
  } as PhishingSecurityTest;
  const entity = createPhishingSecurityTestEntity(phishingSecurityTest);
  expect(entity).toEqual(
    expect.objectContaining({
      _class: ASSESSMENT_ENTITY_CLASS,
      _type: PHISHING_SECURITY_TEST_ENTITY_TYPE,
      _key: 'knowbe4:phishing:security:509579',
      id: '242333',
      status: 'Closed',
      name: 'Corporate Test 001',
      displayName: 'Corporate Test 001',
      phishPronePercentage: 0.5,
      startedAt: '2019-04-02T15:02:38.000Z',
      groups: [16342, 22222],
      categories: [4237],
      template: [11428],
      landingPage: 4072,
      sendDuration: 1,
      scheduledCount: 42,
      deliveredCount: 4,
      openedCount: 24,
      clickedCount: 20,
      repliedCount: 0,
      attachmentOpenCount: 3,
      macroEnabledCount: 0,
      dataEnteredCount: 0,
      vulnerablePluginCount: 0,
      exploitedCount: 2,
      reportedCount: 0,
      bouncedCount: 0,
      _rawData: [
        {
          name: 'default',
          rawData: phishingSecurityTest,
        },
      ],
    }),
  );
});

test('should convert phishingSecurityTestResult to entity', () => {
  const phishingSecurityTestResult = {
    recipient_id: '3077742',
    pst_id: 14240,
    user: {
      id: '264215',
      provisioning_guid: null,
      first_name: 'Bob',
      last_name: 'Ross',
      email: 'bob.r@kb4-demo.com',
    },
    template: {
      id: 2,
      name: 'Your Amazon Order',
    },
    scheduled_at: '2019-04-02T15:02:38.000Z',
    delivered_at: '2019-04-02T15:02:38.000Z',
    opened_at: '2019-04-02T15:02:38.000Z',
    clicked_at: '2019-04-02T15:02:38.000Z',
    replied_at: null,
    attachment_opened_at: null,
    macro_enabled_at: null,
    data_entered_at: '2019-04-02T15:02:38.000Z',
    reported_at: null,
    bounced_at: null,
    ip: 'XX.XX.XXX.XXX',
    ip_location: 'St.Petersburg, FL',
    browser: 'Chrome',
    browser_version: '48.0',
    os: 'MacOSX',
  } as PhishingSecurityTestResult;
  const entity = createPhishingSecurityTestResultEntity(
    phishingSecurityTestResult,
  );
  expect(entity).toEqual(
    expect.objectContaining({
      _class: RECORD_ENTITY_CLASS,
      _type: PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
      _key: 'knowbe4:phishing:security_tests:3077742:recepients',
      recipientId: '3077742',
      pstId: 14240,
      user: '264215',
      template: [2],
      scheduledAt: '2019-04-02T15:02:38.000Z',
      deliveredAt: '2019-04-02T15:02:38.000Z',
      openedAt: '2019-04-02T15:02:38.000Z',
      clickedAt: '2019-04-02T15:02:38.000Z',
      repliedAt: null,
      attachmentOpenedAt: null,
      macroEnabledAt: null,
      dataEnteredAt: '2019-04-02T15:02:38.000Z',
      reportedAt: null,
      bouncedAt: null,
      ip: 'XX.XX.XXX.XXX',
      ipLocation: 'St.Petersburg, FL',
      browser: 'Chrome',
      browserVersion: '48.0',
      os: 'MacOSX',
      _rawData: [
        {
          name: 'default',
          rawData: phishingSecurityTestResult,
        },
      ],
    }),
  );
});

test('should convert phishingCampaign to entity', () => {
  const phishingCampaign = {
    campaign_id: 242333,
    name: 'One Time Phishing Security Test',
    groups: [
      {
        group_id: 0,
        name: 'All Users',
      },
    ],
    last_phish_prone_percentage: 0.3,
    last_run: '2019-04-02T15:02:38.000Z',
    status: 'Closed',
    hidden: false,
    send_duration: '3 Business Days',
    track_duration: '3 Days',
    frequency: 'One Time',
    difficulty_filter: [1, 2, 3, 4, 5],
    create_date: '2019-04-02T15:02:38.000Z',
    psts_count: 1,
    psts: [
      {
        pst_id: 1,
        status: 'Closed',
        start_date: '2019-04-02T15:02:38.000Z',
        users_count: 123,
        phish_prone_percentage: 0.3,
      },
    ],
  } as PhishingCampaign;

  const entity = createPhishingCampaignEntity(phishingCampaign);

  expect(entity).toEqual(
    expect.objectContaining({
      _class: TRAINING_ENTITY_CLASS,
      _type: PHISHING_CAMPAIGN_ENTITY_TYPE,
      _key: 'knowbe4:phishing:campaign:242333',
      name: 'One Time Phishing Security Test',
      displayName: 'One Time Phishing Security Test',
      id: '242333',
      lastPhishPronePercentage: 0.3,
      lastRun: '2019-04-02T15:02:38.000Z',
      status: 'Closed',
      hidden: false,
      sendDuration: '3 Business Days',
      trackDuration: '3 Days',
      frequency: 'One Time',
      difficultyFilter: [1, 2, 3, 4, 5],
      createdOn: 1554217358000,
      pstsCount: 1,
      _rawData: [
        {
          name: 'default',
          rawData: phishingCampaign,
        },
      ],
    }),
  );
});
