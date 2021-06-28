import { accountSteps } from './account';
import { groupSteps } from './groups';
import { trainingCampaignSteps } from './trainingCampaigns';
import { userSteps } from './users';

const integrationSteps = [
  ...accountSteps,
  ...groupSteps,
  ...userSteps,
  ...trainingCampaignSteps,
];

export { integrationSteps };
