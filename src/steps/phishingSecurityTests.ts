import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import { createPhishingSecurityTestEntity } from '../converters';
import { PhishingCampaign } from '../ProviderClient';

import {
  PHISHING_CAMPAIGN_SECURITY_TEST_RELATIONSHIP_TYPE,
  PHISHING_SECURITY_TEST_ENTITY_TYPE,
  PHISHING_CAMPAIGN_ENTITY_TYPE,
  ASSESSMENT_ENTITY_CLASS,
} from '../types';

export async function fetchPhishingSecurityTest({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  await jobState.iterateEntities(
    {
      _type: PHISHING_CAMPAIGN_ENTITY_TYPE,
    },
    async (phishingCampaignEntity) => {
      const phishingCampaign = getRawData<PhishingCampaign>(
        phishingCampaignEntity,
      );
      if (phishingCampaign?.campaign_id) {
        await apiClient.iteratePhishingSecurityTests(
          phishingCampaign.campaign_id,
          async (PhishingSecurityTest) => {
            const phishingSecurityTestEntity = await jobState.addEntity(
              createPhishingSecurityTestEntity(PhishingSecurityTest),
            );
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.CONTAINS,
                from: phishingCampaignEntity,
                to: phishingSecurityTestEntity,
                properties: {
                  _type: PHISHING_CAMPAIGN_SECURITY_TEST_RELATIONSHIP_TYPE,
                },
              }),
            );
          },
        );
      }
    },
  );
}
export const phishingSecurityTestsSteps: IntegrationStep<IntegrationConfig>[] =
  [
    {
      id: 'fetch-phishing-security-tests',
      name: 'Fetch Phishing Security Test',
      entities: [
        {
          resourceName: 'KnowBe4 Phishing Security Test',
          _type: PHISHING_SECURITY_TEST_ENTITY_TYPE,
          _class: ASSESSMENT_ENTITY_CLASS,
        },
      ],
      relationships: [
        {
          _type: PHISHING_CAMPAIGN_SECURITY_TEST_RELATIONSHIP_TYPE,
          _class: RelationshipClass.CONTAINS,
          sourceType: PHISHING_CAMPAIGN_ENTITY_TYPE,
          targetType: PHISHING_SECURITY_TEST_ENTITY_TYPE,
        },
      ],
      dependsOn: ['fetch-phishing-campaigns'],
      executionHandler: fetchPhishingSecurityTest,
    },
  ];
