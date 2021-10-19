import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import { createPhishingEntity } from '../converters';
// import {
//   createPhishingEntity
// } from '../converters';
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_PHISHING_CAMPAIGN_RELATIONSHIP_TYPE,
  PHISHING_CAMPAIGN_ENTITY_TYPE,
  TRAINING_ENTITY_CLASS,
} from '../types';

export const DATA_ACCOUNT_ENTITY = 'DATA_ACCOUNT_ENTITY';

export async function fetchPhishingCampaign({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);
  console.log('------------------- String TEST --------------------');

  const accountEntity = await jobState.getData<Entity>(DATA_ACCOUNT_ENTITY);

  await apiClient.iteratePhishingCampaigns(async (campaign) => {
    const phishingCampaignEntity = await jobState.addEntity(
      createPhishingEntity(campaign),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: phishingCampaignEntity,
      }),
    );
  });
}
export const phishingSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-phishing-campaigns',
    name: 'Fetch Phishing Campaigns',
    entities: [
      {
        resourceName: 'KnowBe4 Phishing Campaign',
        _type: PHISHING_CAMPAIGN_ENTITY_TYPE,
        _class: TRAINING_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: ACCOUNT_PHISHING_CAMPAIGN_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: ACCOUNT_ENTITY_TYPE,
        targetType: PHISHING_CAMPAIGN_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchPhishingCampaign,
  },
];