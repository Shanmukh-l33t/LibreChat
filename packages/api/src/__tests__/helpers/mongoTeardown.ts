type CleanupStep = () => Promise<unknown> | void;

/**
 * Runs independent cleanup steps one after another and attempts every one of
 * them, so a rejecting step (for example `mongoose.disconnect()`) cannot skip
 * the remaining shutdowns (for example `mongoServer.stop()`).
 *
 * Failures are not swallowed: a single failure is rethrown as is, several are
 * rethrown together so the original diagnostics stay visible.
 */
export async function runTeardown(...steps: Array<CleanupStep | undefined>): Promise<void> {
  const errors: unknown[] = [];

  for (const step of steps) {
    if (!step) {
      continue;
    }
    try {
      await step();
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 1) {
    throw new AggregateError(errors, 'Multiple teardown steps failed');
  }
}
