import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import {
  createPhishingSecurityTestResultEntity,
  createUserBaseEntity,
} from '../converters';
import { PhishingSecurityTest } from '../ProviderClient';

import {
  PHISHING_SECURITY_TEST_ENTITY_TYPE,
  PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
  PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
  RECORD_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  USER_HAS_PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
} from '../types';

export async function fetchPhishingSecurityTestResults({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  await jobState.iterateEntities(
    {
      _type: PHISHING_SECURITY_TEST_ENTITY_TYPE,
    },
    async (phishingSecurityTestEntity) => {
      const phishingSecurityTest = getRawData<PhishingSecurityTest>(
        phishingSecurityTestEntity,
      );
      if (phishingSecurityTest?.pst_id) {
        await apiClient.iteratePhishingSecurityTestResults(
          phishingSecurityTest.pst_id,
          async (PhishingSecurityTestResult) => {
            const phishingSecurityTestResultEntity = await jobState.addEntity(
              createPhishingSecurityTestResultEntity(
                PhishingSecurityTestResult,
              ),
            );
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.CONTAINS,
                from: phishingSecurityTestEntity,
                to: phishingSecurityTestResultEntity,
                properties: {
                  _type: PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
                },
              }),
            );

            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: createUserBaseEntity(PhishingSecurityTestResult.user),
                to: phishingSecurityTestResultEntity,
                properties: {
                  _type:
                    USER_HAS_PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
                },
              }),
            );
          },
        );
      }
    },
  );
}
export const phishingSecurityTestResultSteps: IntegrationStep<IntegrationConfig>[] =
  [
    {
      id: 'fetch-phishing-security-test-result',
      name: 'Fetch Phishing Security Test Result',
      entities: [
        {
          resourceName: 'KnowBe4 Phishing Security Test Results',
          _type: PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
          _class: RECORD_ENTITY_CLASS,
        },
      ],
      relationships: [
        {
          _type: PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
          _class: RelationshipClass.CONTAINS,
          sourceType: PHISHING_SECURITY_TEST_ENTITY_TYPE,
          targetType: PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
        },
        {
          _type: USER_HAS_PHISHING_SECURITY_TEST_RESULT_RELATIONSHIP_TYPE,
          _class: RelationshipClass.HAS,
          sourceType: USER_ENTITY_TYPE,
          targetType: PHISHING_SECURITY_TEST_RESULT_ENTITY_TYPE,
        },
      ],
      dependsOn: ['fetch-phishing-security-tests', 'fetch-users'],
      executionHandler: fetchPhishingSecurityTestResults,
    },
  ];
