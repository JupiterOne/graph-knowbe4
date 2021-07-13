import { accountSteps } from './account';
import { groupSteps } from './groups';
import { trainingCampaignSteps } from './trainingCampaigns';
import { trainingEnrollmentSteps } from './trainingEnrollments';
import { userSteps } from './users';

const integrationSteps = [
  ...accountSteps,
  ...groupSteps,
  ...userSteps,
  ...trainingCampaignSteps,
  ...trainingEnrollmentSteps,
];

export { integrationSteps };
