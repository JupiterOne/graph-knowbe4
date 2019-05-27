import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import initializeContext from "./initializeContext";

test("creates provider client", () => {
  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config: {
        site: "us",
        apiKey: "testKey",
      },
    },
  });
  const integrationContext = initializeContext(executionContext);
  expect(integrationContext.provider).toBeDefined();
});
