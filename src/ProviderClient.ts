import {
  IntegrationLogger,
  IntegrationProviderAPIError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';

import { retry, AttemptContext } from '@lifeomic/attempt';
import fetch from 'node-fetch';

export interface Account {
  name: string;
  type: string;
  domains: string[];
  admins: UserBase[];
  subscription_level: string;
  subscription_end_date: string;
  number_of_seats: number;
  current_risk_score: number;
  risk_score_history: RiskScore[];
}

export interface RiskScore {
  risk_score: number;
  date: string;
}

export interface UserBase {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface User extends UserBase {
  employee_number: string | null;
  job_title: string | null;
  phish_prone_percentage: number | null;
  phone_number: string | null;
  extension: string | null;
  mobile_phone_number: string | null;
  location: string | null;
  division: string | null;
  manager_name: string | null;
  manager_email: string | null;
  adi_manageable: boolean | null;
  adi_guid: string | null;
  groups: string[];
  aliases: string[] | null;
  joined_on: string | null;
  last_sign_in: string | null;
  status: string | null;
  organization: string | null;
  department: string | null;
  language: string | null;
  comment: string | null;
  employee_start_date: string | null;
  archived_at: string | null;
}

export interface GroupBase {
  id: string;
  group_id?: number;
  name: string;
}

export interface Group extends GroupBase {
  group_type: string;
  adi_guid: string | null;
  member_count: number;
  status: string;
}

export interface StorePurchase {
  store_purchase_id: number;
  content_type: string;
  name: string;
  description: string;
  type: string;
  duration: number;
  retired: boolean;
  retirement_date: string | null;
  publish_date: string;
  publisher: string;
  purchase_date: string;
  policy_url: string;
}

export interface UploadedPolicy {
  policy_id: number;
  content_type: string;
  name: string;
  minimum_time: number;
  default_language: string;
  published: boolean;
}

export interface TrainingContent extends StorePurchase, UploadedPolicy {}

export interface TrainingCampaign {
  campaign_id: number;
  name: string;
  groups: GroupBase[];
  status: string;
  modules: StorePurchase[];
  content: TrainingContent[];
  duration_type: string;
  start_date: string;
  end_date: string | null;
  relative_duration: string | null;
  auto_enroll: boolean;
  allow_multiple_enrollments: boolean;
}

export interface PhishingCampaign {
  campaign_id: number;
  name: string;
  groups: GroupBase[];
  last_phish_prone_percentage: number;
  last_run: string | null;
  status: string;
  hidden: boolean;
  send_duration: string;
  track_duration: string;
  frequency: string;
  difficulty_filter: number[];
  create_date: string;
  psts_count: number;
  psts: Psts[];
}

export interface Psts {
  pst_id: number;
  status: string;
  start_date: string;
  users_count: number;
  phish_prone_percentage: number;
}

export interface PhishingSecurityTest {
  campaign_id: number;
  pst_id: number;
  status: string;
  name: string;
  groups: GroupBase[];
  phish_prone_percentage: number;
  started_at: string;
  duration: number;
  categories: Categories[];
  template: Template;
  landing_page: LandingPage;
  scheduled_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  replied_count: number;
  attachment_open_count: number;
  macro_enabled_count: number;
  data_entered_count: number;
  vulnerable_plugin_count: number;
  exploited_count: number;
  reported_count: number;
  bounced_count: number;
}
export interface PhishingSecurityTestResult {
  recipient_id: string;
  pst_id: number;
  user: UserBase;
  template: Template;
  scheduled_at: string;
  delivered_at: string;
  opened_at?: string | null;
  clicked_at?: string | null;
  replied_at?: string | null;
  attachment_opened_at?: string | null;
  macro_enabled_at?: string | null;
  data_entered_at: string;
  reported_at?: string | null;
  bounced_at?: string | null;
  ip: string;
  ip_location: string;
  browser: string;
  browser_version: string;
  os: string;
}
export interface Categories {
  category_id: number;
  name: string;
}

export interface Template {
  id: number;
  name: string;
}

export interface LandingPage {
  id: number;
  name: string;
}

export interface TrainingEnrollment {
  enrollment_id: number;
  content_type: string;
  module_name: string;
  user: UserBase;
  campaign_name: string;
  enrollment_date: string;
  start_date: string | null;
  completion_date: string | null;
  status: string;
  time_spent: number;
  policy_acknowledged: boolean;
}

/**
 * The default number of results from a single API request is 100. The maximum
 * number of results that can be requested in a single API call is 500.
 *
 * See: https://developer.knowbe4.com/reporting/#tag/Pagination
 */
const DEFAULT_PAGE_BATCH_SIZE = 500;

export default class ProviderClient {
  private BASE_API_URL: string;
  private logger: IntegrationLogger;
  private options: any;

  constructor(config: IntegrationConfig, logger: IntegrationLogger) {
    this.BASE_API_URL = `https://${config.site.toLowerCase()}.api.knowbe4.com/v1`;
    this.logger = logger;
    this.options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
    };
  }

  public async fetchAccountDetails(): Promise<Account> {
    try {
      this.logger.info('Fetching KnowBe4 account...');
      const result = await this.collectOnePage('account');
      this.logger.trace({}, 'Fetched KnowBe4 account');
      return await result.json();
    } catch (err) {
      const url = this.BASE_API_URL + '/account';
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: url,
        status: 'fail',
        statusText: `Error calling KnowBe4 API at '${url}'.`,
      });
    }
  }

  public async fetchGroups(): Promise<Group[]> {
    return await this.collectAllPages('groups');
  }

  public async fetchUsers(): Promise<User[]> {
    return await this.collectAllPages('users');
  }

  public async fetchTraining(): Promise<TrainingCampaign[]> {
    return await this.collectAllPages('training/campaigns');
  }

  public async fetchPhishingCampaign(): Promise<PhishingCampaign[]> {
    return await this.collectAllPages('phishing/campaigns');
  }

  public async fetchPhishingSecurityTest(
    campaignId: number,
  ): Promise<PhishingSecurityTest[]> {
    return await this.collectAllPages(
      `phishing/campaigns/${campaignId}/security_tests`,
    );
  }

  public async fetchPhishingSecurityTestResults(
    pstsId: number,
  ): Promise<PhishingSecurityTestResult[]> {
    return await this.collectAllPages(
      `phishing/security_tests/${pstsId}/recipients`,
    );
  }

  public async fetchTrainingEnrollments(): Promise<TrainingEnrollment[]> {
    return await this.collectAllPages('training/enrollments');
  }

  public getBaseApi(): string {
    return this.BASE_API_URL;
  }

  private async forEachPage(firstUri: string, eachFn: (page: any) => void) {
    let pageNumber = 1;

    const getNextPageUrl = (pageNumber: number) => {
      return `${this.BASE_API_URL}/${firstUri}?page=${pageNumber}&per_page=${DEFAULT_PAGE_BATCH_SIZE}`;
    };

    let more = true;
    let nextPageUrl: string = getNextPageUrl(pageNumber);

    while (more) {
      const response = await this.fetchWithBackoff(nextPageUrl, this.options);
      const page = await response.json();
      more = page && page.length && page.length > 0;

      if (more) {
        eachFn(page);
        pageNumber++;
        nextPageUrl = getNextPageUrl(pageNumber);
      }
    }
  }

  private async collectAllPages(firstUri: string): Promise<any[]> {
    try {
      this.logger.info(`Fetching KnowBe4 ${firstUri}...`);
      const results: any[] = [];

      await this.forEachPage(firstUri, (page: any) => {
        for (const item of page || []) {
          results.push(item);
        }
      });
      this.logger.trace(`Fetched KnowBe4 ${firstUri}`);

      return results;
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: firstUri,
        status: 'fail',
        statusText: `Error calling KnowBe4 API at '${firstUri}'.`,
      });
    }
  }

  private async collectOnePage(path: string, params?: string): Promise<any> {
    const url = params
      ? `${this.BASE_API_URL}/${path}?${params}`
      : `${this.BASE_API_URL}/${path}`;
    return await this.fetchWithBackoff(url, this.options);
  }

  private async fetchWithBackoff(url, fetchOptions): Promise<any> {
    const logger = this.logger;

    //everything in fetchWithErrorAwareness is going into the retry function below
    const fetchWithErrorAwareness = async () => {
      let response;
      //check for fundamental errors (network not available, DNS fail, etc)
      try {
        response = await fetch(url, fetchOptions);
      } catch (err) {
        throw new IntegrationProviderAPIError({
          message: `Error during fetch from ${url}`,
          status: err.status,
          statusText: `Error msg: ${err.statusText}, url: ${url}`,
          cause: err,
          endpoint: url,
        });
      }

      // fetch doesn't error on 4xx/5xx HTTP codes, so you have to do that yourself
      if (response.status !== 200) {
        throw new IntegrationProviderAPIError({
          cause: undefined,
          endpoint: url,
          status: response.status,
          statusText: `Failure requesting '${url}' due to error code ${response.status}.`,
        });
      }
      return response;
    };

    const retryOptions = {
      delay: 1000,
      maxAttempts: 10,
      initialDelay: 0,
      minDelay: 0,
      maxDelay: 0,
      factor: 2,
      timeout: 0,
      jitter: false,
      handleError: null,
      handleTimeout: null,
      beforeAttempt: null,
      calculateDelay: null,
    }; // 10 attempts with 1000 ms start and factor 2 means longest wait is 20 minutes

    return await retry(fetchWithErrorAwareness, {
      ...retryOptions,
      handleError(error: any, attemptContext: AttemptContext) {
        //retry will keep trying to the limits of retryOptions
        //but it lets you intervene in this function - if you throw an error from in here,
        //it stops retrying. Otherwise you can just log the attempts.
        if (error.retryable === false || error.status === 401) {
          attemptContext.abort();
          throw error;
        }

        //KnowBe4 API rate limits to 4/sec and 1000/day
        if (error.status === 429) {
          logger.warn(
            `Status 429 (rate limiting) encountered. Engaging backoff function.`,
          );
        }

        //test for 5xx HTTP codes
        if (Math.floor(error.status / 100) === 5) {
          logger.warn(
            `Status 5xx (server errors) encountered. Engaging backoff function.`,
          );
        }
        logger.info(`Retrying on ${error.endpoint}`);
      },
    });
  }
}
