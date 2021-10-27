import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import { createPhishingCampaignEntity } from '../converters';
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_PHISHING_CAMPAIGN_RELATIONSHIP_TYPE,
  PHISHING_CAMPAIGN_ENTITY_TYPE,
  TRAINING_ENTITY_CLASS,
} from '../types';
import { DATA_ACCOUNT_ENTITY } from './account';

// export const DATA_ACCOUNT_ENTITY = 'DATA_ACCOUNT_ENTITY';

export async function fetchPhishingCampaign({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  const accountEntity = (await jobState.getData(DATA_ACCOUNT_ENTITY)) as Entity;

  await apiClient.iteratePhishingCampaigns(async (campaign) => {
    const phishingCampaignEntity = await jobState.addEntity(
      createPhishingCampaignEntity(campaign),
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
export const phishingCampaignSteps: IntegrationStep<IntegrationConfig>[] = [
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
