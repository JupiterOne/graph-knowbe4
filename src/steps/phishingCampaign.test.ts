import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { RelationshipClass } from '@jupiterone/integration-sdk-core';

import { Recording, setupKnowBe4Recording } from '../../test/recording';

import { integrationConfig } from '../../test/config';

import { fetchPhishingCampaign } from './phishingCampaigns';
import { fetchAccountDetails } from './account';
import {
  ACCOUNT_PHISHING_CAMPAIGN_RELATIONSHIP_TYPE,
  PHISHING_CAMPAIGN_ENTITY_TYPE,
} from '../types';

describe('#fetchPhishingCampaign', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    recording = setupKnowBe4Recording({
      directory: __dirname,
      name: 'fetchPhishingCampaignCollectData',
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

    expect(context.jobState.collectedEntities?.length).toBeTruthy;
    expect(
      context.jobState.collectedRelationships.length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      context.jobState.collectedEntities.filter(
        (r) => r._type === PHISHING_CAMPAIGN_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Training'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'knowbe4_phishing_campaign' },
          _key: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          id: { type: 'string' },
          lastPhishPronePercentage: { type: 'number' },
          status: { type: 'string' },
          hidden: { type: 'boolean' },
          sendDuration: { type: 'string' },
          trackDuration: { type: 'string' },
          frequency: { type: 'string' },
          difficultyFilter: { type: 'array' },
          createdOn: { type: 'number' },
          pstsCount: { type: 'number' },
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
        (r) => r._type === ACCOUNT_PHISHING_CAMPAIGN_RELATIONSHIP_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: RelationshipClass.HAS },
          _type: { const: ACCOUNT_PHISHING_CAMPAIGN_RELATIONSHIP_TYPE },
        },
      },
    });
  });
});
