import { accountSteps } from './account';
import { userSteps } from './users';

const integrationSteps = [...accountSteps, ...userSteps];

export { integrationSteps };
