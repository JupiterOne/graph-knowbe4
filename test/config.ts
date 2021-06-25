import * as dotenv from 'dotenv';
import * as path from 'path';

import { IntegrationConfig } from '../src/config';

/**
 * Recording tests require valid credentials loaded from `.env`. Record new tests as follows:
 *
 * > LOAD_ENV=1 yarn test
 */
if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const integrationConfig: IntegrationConfig = {
  site: process.env.SITE || 'us',
  apiKey: process.env.API_KEY || 'fakekey',
};
