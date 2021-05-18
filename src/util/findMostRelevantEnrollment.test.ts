import { TrainingEnrollment } from "../ProviderClient";
import { findMostRelevantEnrollment } from "./findMostRelevantEnrollment";

const enrollmentId = 12345;
const userId = 67890;
const baseDate = "2000-01-01T01:00:00.000Z";

function createTestEnrollment(
  overrides: Partial<TrainingEnrollment> = {},
): TrainingEnrollment {
  return {
    enrollment_id: enrollmentId,
    content_type: "Uploaded Policy",
    module_name: "Data Protection Policy",
    user: {
      id: userId,
      first_name: "Bob",
      last_name: "Bobkins",
      email: "bbobkins@kb4-demo.com",
    },
    campaign_name: "Compliance Policy Agreement",
    enrollment_date: baseDate,
    start_date: null,
    completion_date: null,
    status: "Unknown",
    time_spent: 0,
    policy_acknowledged: false,
    ...overrides,
  };
}

const completedEnrollment = createTestEnrollment({
  start_date: baseDate,
  completion_date: baseDate,
  status: "Passed",
});

const inProgressEnrollment = createTestEnrollment({
  start_date: baseDate,
  completion_date: null,
  status: "Passed",
});

const notStartedEnrollment = createTestEnrollment({
  start_date: null,
  completion_date: null,
  status: "Not Started",
});

const malformedEnrollment = createTestEnrollment({
  enrollment_date: undefined,
  start_date: null,
  completion_date: null,
  status: "Error",
});

describe("findMostRelevantEnrollment", () => {
  it("should select the enrollment with the most recent completed date", () => {
    const newestCompletedEnrollment = createTestEnrollment({
      start_date: baseDate,
      completion_date: new Date(
        new Date(baseDate).getTime() + 100000,
      ).toISOString(),
      status: "Passed",
    });
    expect(
      findMostRelevantEnrollment([
        malformedEnrollment,
        newestCompletedEnrollment,
        completedEnrollment,
        inProgressEnrollment,
        notStartedEnrollment,
      ]),
    ).toBe(newestCompletedEnrollment);
  });
  it("should select the enrollment with the most recent start date if no completed dates", () => {
    const newestInProgressEnrollment = createTestEnrollment({
      start_date: new Date(new Date(baseDate).getTime() + 100000).toISOString(),
      completion_date: null,
      status: "Passed",
    });
    expect(
      findMostRelevantEnrollment([
        malformedEnrollment,
        newestInProgressEnrollment,
        inProgressEnrollment,
        notStartedEnrollment,
      ]),
    ).toBe(newestInProgressEnrollment);
  });
  it("should select the enrollment with the most recent enrolled date if no completed, or started dates", () => {
    const newestNotStartedEnrollment = createTestEnrollment({
      enrollment_date: new Date(
        new Date(baseDate).getTime() + 100000,
      ).toISOString(),
      start_date: null,
      completion_date: null,
      status: "Passed",
    });
    expect(
      findMostRelevantEnrollment([
        malformedEnrollment,
        notStartedEnrollment,
        newestNotStartedEnrollment,
      ]),
    ).toBe(newestNotStartedEnrollment);
  });
  it("should select the first enrollment if no enrollment, started, or completed dates", () => {
    expect(findMostRelevantEnrollment([malformedEnrollment])).toBe(
      malformedEnrollment,
    );
  });
});
