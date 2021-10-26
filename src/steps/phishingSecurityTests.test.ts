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
          // todo: Implement all other params
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
