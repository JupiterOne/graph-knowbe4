import { IntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import ProviderClient from "./ProviderClient";
import { ExecutionContext } from "./types";

export default function initializeContext(
  context: IntegrationExecutionContext,
): ExecutionContext {
  return {
    ...context,
    ...context.clients.getClients(),
    provider: new ProviderClient(context.instance.config, context.logger),
  };
}
