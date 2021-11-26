import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { RelationshipClass } from '@jupiterone/integration-sdk-core';

import { Recording, setupKnowBe4Recording } from '../../test/recording';

import { integrationConfig } from '../../test/config';

import { fetchPhishingSecurityTestResults } from './phishingSecurityTestResults';
import {
  PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
  PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
  USER_HAS_PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
} from '../types';

describe('#fetchPhishingSecurityTestResult', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    recording = setupKnowBe4Recording({
      directory: __dirname,
      name: 'fetchPhishingSecurityTestResultCollectData',
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

    await fetchPhishingSecurityTestResults(context);

    expect(context.jobState.collectedEntities?.length).toBeTruthy;
    expect(
      context.jobState.collectedEntities.filter(
        (r) => r._type === PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Record'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'knowbe4_phishing_security_test_result' },
          _key: { type: 'string' },
          name: { type: 'string' },
          recipient_Id: { type: 'string' },
          pstId: { type: 'number' },
          user: { type: 'string' },
          template: { type: 'array' },
          scheduledAt: { type: 'string' },
          deliveredAt: { type: 'string' },
          openedAt: { type: 'string' },
          clickedAt: { type: 'string' },
          repliedAt: { type: 'string' },
          attachmentOpenedAt: { type: 'string' },
          macroEnabledAt: { type: 'string' },
          dataEnteredAt: { type: 'string' },
          reportedAt: { type: 'string' },
          bouncedAt: { type: 'string' },
          ip: { type: 'string' },
          ipLocation: { type: 'string' },
          browser: { type: 'string' },
          browserVersion: { type: 'string' },
          os: { type: 'string' },
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
        (r) => r._type === PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
        PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: RelationshipClass.CONTAINS },
          _type: { const: PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE },
        },
      },
    });
    expect(
      context.jobState.collectedRelationships.filter(
        (r) =>
          r._type === USER_HAS_PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
        PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: RelationshipClass.HAS },
          _type: {
            const: USER_HAS_PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
          },
        },
      },
    });
  });
});
