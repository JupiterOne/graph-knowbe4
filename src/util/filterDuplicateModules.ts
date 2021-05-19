import { TrainingModuleEntity } from "../types";

/**
 * There can be multiple instances of the same training module in several
 * different KnowBe4 training compaigns. Because we do not want to put
 * campaign information in the training module key (as that is what
 * relationships are for), we need to de-duplicate the training modules
 * prior to sending them to the persister in order to avoid errors.
 */
export function filterDuplicateModules(
  modules: TrainingModuleEntity[],
): TrainingModuleEntity[] {
  return modules.filter(
    (moduleVal, moduleIndex, iteratee) =>
      !iteratee.find((v, i) => i > moduleIndex && v._key === moduleVal._key),
  );
}
