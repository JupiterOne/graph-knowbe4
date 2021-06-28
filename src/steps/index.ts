import { accountSteps } from './account';
import { groupSteps } from './groups';
import { userSteps } from './users';

const integrationSteps = [...accountSteps, ...groupSteps, ...userSteps];

export { integrationSteps };
