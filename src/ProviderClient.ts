import {
  IntegrationError,
  IntegrationLogger,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { IntegrationConfig } from "./types";

import request = require("request-promise-native");

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
  id: number;
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
  groups: number[];
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

export interface Group {
  id: number;
  name: string;
  group_type: string;
  adi_guid: string | null;
  member_count: number;
  status: string;
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
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
    };
  }

  public async fetchAccountDetails(): Promise<Account> {
    try {
      this.logger.trace("Fetching KnowBe4 account...");
      const result = await this.collectOnePage("account");
      this.logger.trace({}, "Fetched KnowBe4 account");
      return JSON.parse(result);
    } catch (err) {
      throw new IntegrationError({
        cause: err,
        expose: false,
        message: "Error calling KnowBe4 API",
      });
    }
  }

  public async fetchGroups(): Promise<Group[]> {
    try {
      this.logger.trace("Fetching KnowBe4 groups...");
      const result = await this.collectAllPages("groups");
      this.logger.trace({}, "Fetched KnowBe4 groups");
      return result;
    } catch (err) {
      throw new IntegrationError({
        cause: err,
        expose: false,
        message: "Error calling KnowBe4 API",
      });
    }
  }

  public async fetchUsers(): Promise<User[]> {
    try {
      this.logger.trace("Fetching KnowBe4 users...");
      const result = await this.collectAllPages("users");
      this.logger.trace({}, "Fetched KnowBe4 users");
      return result;
    } catch (err) {
      throw new IntegrationError({
        cause: err,
        expose: false,
        message: "Error calling KnowBe4 API",
      });
    }
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
      const response = await request.get(nextPageUrl, this.options);
      const page = JSON.parse(response);
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
    const results: any[] = [];

    await this.forEachPage(firstUri, params, (page: any) => {
      for (const item of page || []) {
        results.push(item);
      }
    });

    return results;
  }

  private async collectOnePage(path: string, params?: string): Promise<any> {
    const url = params
      ? `${this.BASE_API_URL}/${path}?${params}`
      : `${this.BASE_API_URL}/${path}`;
    return await request.get(url, this.options);
  }
}
