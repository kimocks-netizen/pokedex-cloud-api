import { ScheduledJobModel } from '../../shared/models/scheduled-job-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { authMiddleware } from '../../shared/middleware/auth-middleware.mjs';

/**
 * POST /jobs/schedule - Create a scheduled job
 */
export const handler = async (event) => {
  try {
    const user = await authMiddleware(event);

    const body = JSON.parse(event.body || '{}');
    const { jobType, schedule, pokemonLimit = 151 } = body;

    // Validate required fields
    if (!jobType || !schedule) {
      return ResponseHelper.badRequest('jobType and schedule are required');
    }

    // Validate job type
    const validJobTypes = ['pokemon_ingestion', 'data_cleanup'];
    if (!validJobTypes.includes(jobType)) {
      return ResponseHelper.badRequest(`Invalid job type. Must be one of: ${validJobTypes.join(', ')}`);
    }

    // Validate cron expression (basic validation)
    const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])) (\*|([0-6]))$/;
    if (!cronRegex.test(schedule)) {
      return ResponseHelper.badRequest('Invalid cron expression. Format: minute hour day month dayOfWeek (e.g., "0 2 * * *")');
    }

    const nextRun = new Date(Date.now() + 60 * 60 * 1000); // Placeholder: 1 hour from now

    const jobModel = new ScheduledJobModel();
    const job = await jobModel.create({
      userId: user.userId,
      jobType,
      schedule,
      pokemonLimit,
      nextRun,
    });

    return ResponseHelper.success({
      id: job.id,
      jobType: job.jobType,
      schedule: job.schedule,
      nextRun: job.nextRun,
      enabled: job.enabled,
      message: 'Scheduled job created successfully',
    });
  } catch (error) {
    if (error.name === 'AuthenticationError') {
      return ResponseHelper.unauthorized(error.message);
    }
    console.error('Schedule job creation error:', error);
    return ResponseHelper.error(error);
  }
};
