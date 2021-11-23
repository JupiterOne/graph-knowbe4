import { accountSteps } from './account';
import { groupSteps } from './groups';
import { phishingCampaignSteps } from './phishingCampaigns';
import { trainingCampaignSteps } from './trainingCampaigns';
import { trainingEnrollmentSteps } from './trainingEnrollments';
import { userSteps } from './users';
import { phishingSecurityTestsSteps } from './phishingSecurityTests';
import { phishingSecurityTestResultSteps } from './phishingSecurityTestResults';

const integrationSteps = [
  ...accountSteps,
  ...groupSteps,
  ...userSteps,
  ...trainingCampaignSteps,
  ...trainingEnrollmentSteps,
  ...phishingCampaignSteps,
  ...phishingSecurityTestsSteps,
  ...phishingSecurityTestResultSteps,
];

export { integrationSteps };
