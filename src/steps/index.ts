import { accountSteps } from './account';
import { groupSteps } from './groups';
import { phishingSteps } from './phishingCampaigns';
import { trainingCampaignSteps } from './trainingCampaigns';
import { trainingEnrollmentSteps } from './trainingEnrollments';
import { userSteps } from './users';
import { phishingSecurityTestsSteps } from './phishingSecurityTests';

const integrationSteps = [
  ...accountSteps,
  ...groupSteps,
  ...userSteps,
  ...trainingCampaignSteps,
  ...trainingEnrollmentSteps,
  ...phishingSteps,
  ...phishingSecurityTestsSteps,
];

export { integrationSteps };
