import { filterDuplicateModules } from "./filterDuplicateModules";

function createTrainingModule() {
  return {
    _key: "knowbe4:training:purchase:19",
    _type: "training_module",
    _class: ["Training", "Module"],
    displayName: "2018 Kevin Mitnick Security Awareness Training - 15 min",
    storePurchaseId: 19,
    contentType: "Store Purchase",
    name: "2018 Kevin Mitnick Security Awareness Training - 15 min",
    description:
      "This 15-minute module is an advanced, condensed version of the full 45-minute training, often...",
    type: "Training Module",
    duration: 15,
    retired: false,
    publishDate: 1517624400000,
    publisher: "KnowBe4",
    purchaseDate: 1497744000000,
    policyUrl: "https://www.yourcompany.com/phishingawarenesspolicy.pdf",
  };
}

describe("filterDuplicateModules", () => {
  it("should filter out duplicate training modules", () => {
    expect(
      filterDuplicateModules(new Array(10).fill(createTrainingModule())),
    ).toEqual([createTrainingModule()]);
  });
});
