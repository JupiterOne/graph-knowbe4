import {
  IntegrationError,
  IntegrationLogger,
  IntegrationProviderAPIError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';

import { retry } from '@lifeomic/attempt';
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
      this.logger.trace('Fetching KnowBe4 account...');
      const result = await this.collectOnePage('account');
      this.logger.trace({}, 'Fetched KnowBe4 account');
      return await result.json();
    } catch (err) {
      throw new IntegrationError({
        cause: err,
        code: 'fail',
        message: 'Error calling KnowBe4 API',
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

  public async fetchTrainingEnrollments(): Promise<TrainingEnrollment[]> {
    return await this.collectAllPages('training/enrollments');
  }

  public getBaseApi(): string {
    return this.BASE_API_URL;
  }

  private async forEachPage(
    firstUri: string,
    params: string | null | undefined,
    eachFn: (page: any) => void,
  ) {
    let pageCount = 1;

    let nextPageUrl: string | null = params
      ? `${this.BASE_API_URL}/${firstUri}?${params}&page=${pageCount}`
      : `${this.BASE_API_URL}/${firstUri}?page=${pageCount}`;

    let more = true;

    while (more) {
      const response = await this.fetchWithBackoff(nextPageUrl, this.options);
      const page = await response.json();
      more = page && page.length && page.length > 0;
      if (more) {
        eachFn(page);
        pageCount++;
        nextPageUrl = params
          ? `${this.BASE_API_URL}/${firstUri}?${params}&page=${pageCount}`
          : `${this.BASE_API_URL}/${firstUri}?page=${pageCount}`;
      }
    }
  }

  private async collectAllPages(
    firstUri: string,
    params?: string,
  ): Promise<any[]> {
    try {
      this.logger.trace(`Fetching KnowBe4 ${firstUri}...`);
      const results: any[] = [];

      await this.forEachPage(firstUri, params, (page: any) => {
        for (const item of page || []) {
          results.push(item);
        }
      });
      this.logger.trace(`Fetched KnowBe4 ${firstUri}`);

      return results;
    } catch (err) {
      throw new IntegrationError({
        cause: err,
        code: 'fail',
        message: 'Error calling KnowBe4 API',
      });
    }
  }

  private async collectOnePage(path: string, params?: string): Promise<any> {
    const url = params
      ? `${this.BASE_API_URL}/${path}?${params}`
      : `${this.BASE_API_URL}/${path}`;
    return await this.fetchWithBackoff(url, this.options);
  }

  private async fetchWithBackoff(url, fetchOptions) {
    //KnowBe4 API rate limits to 4/sec and 1000/day
    const retryOptions = {
      delay: 250,
      maxAttempts: 8,
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
    }; // 8 attempts with 250 ms start and factor 2 means longest wait is 32 seconds
    return await retry(async () => {
      const reply = await fetch(url, fetchOptions);
      this.logger.warn(`Rate limiting encountered. Waiting and trying again.`);
      if (reply.status === 429) {
        throw new IntegrationProviderAPIError({
          cause: undefined,
          endpoint: url,
          status: reply.status,
          statusText: `Failure requesting '${url}' due to rate-limiting.`,
        });
      }
      return reply;
    }, retryOptions);
  }
}
