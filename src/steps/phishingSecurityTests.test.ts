import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { RelationshipClass } from '@jupiterone/integration-sdk-core';

import { Recording, setupKnowBe4Recording } from '../../test/recording';

import { integrationConfig } from '../../test/config';

import { fetchPhishingCampaign } from './phishingCampaigns';
import { fetchPhishingSecurityTest } from './phishingSecurityTests';
import {
  PHISHING_CAMPAIGN_SECURITY_TEST_RELATIONSHIP_TYPE,
  PHISHING_SECURITY_TEST_ENTITY_TYPE,
} from '../types';
import { fetchAccountDetails } from './account';

describe('#fetchPhishingSecurityTest', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    recording = setupKnowBe4Recording({
      directory: __dirname,
      name: 'fetchPhishingSecurityTestCollectData',
      options: {
        matchRequestsBy: {
          url: {
            hostname: false,
          },
        },
        recordFailedRequests: false,
      },
    });

    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
    });

    await fetchAccountDetails(context);
    await fetchPhishingCampaign(context);
    await fetchPhishingSecurityTest(context);

    expect(context.jobState.collectedEntities?.length).toBeTruthy;
    expect(
      context.jobState.collectedRelationships.length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      context.jobState.collectedEntities.filter(
        (r) => r._type === PHISHING_SECURITY_TEST_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Training'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'phishing_security_test' },
          _key: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          campaign_id: { type: 'number' },
          pst_id: { type: 'number' },
          status: { type: 'string' },
          groups: { type: 'array' },
          phish_prone_percentage: { type: 'number' },
          started_at: { type: 'string' },
          duration: { type: 'number' },
          categories: { type: 'array' },
          template: { type: 'array' },
          landing_page: { type: 'number' },
          scheduled_count: { type: 'number' },
          delivered_count: { type: 'number' },
          opened_count: { type: 'number' },
          clicked_count: { type: 'number' },
          replied_count: { type: 'number' },
          attachment_open_count: { type: 'number' },
          macro_enabled_count: { type: 'number' },
          data_entered_count: { type: 'number' },
          vulnerable_plugin_count: { type: 'number' },
          exploited_count: { type: 'number' },
          reported_count: { type: 'number' },
          bounced_count: { type: 'number' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
        },
        required: [],
      },
    });
    expect(
      context.jobState.collectedRelationships.filter(
        (r) => r._type === PHISHING_CAMPAIGN_SECURITY_TEST_RELATIONSHIP_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: RelationshipClass.CONTAINS },
          _type: { const: PHISHING_CAMPAIGN_SECURITY_TEST_RELATIONSHIP_TYPE },
        },
      },
    });
  });
});
