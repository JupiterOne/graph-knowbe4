import { IntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import executionHandler from "./executionHandler";
import initializeContext from "./initializeContext";
import {
  Account,
  Group,
  TrainingCampaign,
  TrainingEnrollment,
  User,
} from "./ProviderClient";
import {
  GROUP_ENTITY_TYPE,
  USER_ENTITY_TYPE,
  USER_GROUP_RELATIONSHIP_TYPE,
} from "./types";

jest.mock("./initializeContext");

/* tslint:disable */
const account: Account = require("./test-data/account.json");
const users: User[] = require("./test-data/users.json");
const groups: Group[] = require("./test-data/groups.json");
const training: TrainingCampaign[] = require("./test-data/training-campaigns.json");
const trainingEnrollments: TrainingEnrollment[] = require("./test-data/training-enrollments.json");
/* tslint:enable */

test("executionHandler", async () => {
  const executionContext: any = {
    graph: {
      findEntitiesByType: jest.fn().mockResolvedValue([]),
      findRelationshipsByType: jest.fn().mockResolvedValue([]),
    },
    persister: {
      processEntities: jest.fn().mockReturnValue([]),
      processRelationships: jest.fn().mockReturnValue([]),
      publishPersisterOperations: jest.fn().mockResolvedValue({}),
    },
    provider: {
      fetchAccountDetails: jest.fn().mockResolvedValue(account),
      fetchGroups: jest.fn().mockResolvedValue(groups),
      fetchUsers: jest.fn().mockResolvedValue(users),
      fetchTraining: jest.fn().mockResolvedValue(training),
      fetchTrainingEnrollments: jest
        .fn()
        .mockResolvedValue(trainingEnrollments),
    },
  };

  (initializeContext as jest.Mock).mockReturnValue(executionContext);

  const invocationContext = {} as IntegrationExecutionContext;
  await executionHandler(invocationContext);

  expect(initializeContext).toHaveBeenCalledWith(invocationContext);

  expect(executionContext.graph.findEntitiesByType).toHaveBeenCalledWith(
    USER_ENTITY_TYPE,
  );
  expect(executionContext.graph.findEntitiesByType).toHaveBeenCalledWith(
    GROUP_ENTITY_TYPE,
  );
  expect(executionContext.graph.findRelationshipsByType).toHaveBeenCalledWith(
    USER_GROUP_RELATIONSHIP_TYPE,
  );

  expect(executionContext.provider.fetchAccountDetails).toHaveBeenCalledTimes(
    1,
  );
  expect(executionContext.provider.fetchUsers).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchGroups).toHaveBeenCalledTimes(1);

  // account, users, groups, training
  expect(executionContext.persister.processEntities).toHaveBeenCalledTimes(4);

  // account->(users|groups), group->users, training->module
  expect(executionContext.persister.processRelationships).toHaveBeenCalledTimes(
    3,
  );

  expect(
    executionContext.persister.publishPersisterOperations,
  ).toHaveBeenCalledTimes(1);
});
