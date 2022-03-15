import maxBy from 'lodash.maxby';
import { TrainingEnrollment } from '../ProviderClient';

/**
 * A user can be enrolled in multiple instances of the same training module.
 * Because the _key of the training module does not contain information from
 * what campaign (nor should it) we need some way to connect the enrollment
 * to the training module.
 *
 * What the user is expecting, is when a training module is completed, J1
 * will update the relationship between training module and user with a
 * completionDate, reguardless if there are other instances of that training
 * in other campaigns that the user has not yet completed. In order to model
 * it this way, we want to use only the most relevent enrollment when making
 * these relationships.
 */
export function findMostRelevantEnrollment(
  enrollments: TrainingEnrollment[],
): TrainingEnrollment {
  let e = maxBy(enrollments, 'completion_date'); // The one most recently completed is the most relevant
  e = e ? e : maxBy(enrollments, 'start_date'); // Then the most recently started one
  e = e ? e : maxBy(enrollments, 'enrollment_date'); // Then the most recently enrolled one
  e = e ? e : enrollments[0]; // Then just the first one (This should never happen)
  return e;
}
