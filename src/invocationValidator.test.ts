import uuid from "uuid/v4";

import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import invocationValidator from "./invocationValidator";
import { IntegrationConfig } from "./types";

test("should throw if api key is missing", async () => {
  const accountId = uuid();
  const config: Partial<IntegrationConfig> = {
    site: "us",
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      accountId,
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    "Missing API Key in config",
  );
});

test("should throw if site is missing", async () => {
  const accountId = uuid();
  const config: Partial<IntegrationConfig> = {
    apiKey: uuid(),
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      accountId,
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    "Missing Site in config",
  );
});

test("should throw if site is invalid", async () => {
  const accountId = uuid();
  const config: Partial<IntegrationConfig> = {
    apiKey: uuid(),
    site: "AP",
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      accountId,
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    "Invalid Site in config",
  );
});
