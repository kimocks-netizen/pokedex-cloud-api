import { ScheduledJobModel } from '../../shared/models/scheduled-job-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { authMiddleware } from '../../shared/middleware/auth-middleware.mjs';

/**
 * GET /jobs - List all scheduled jobs (admin can see all)
 */
export const handler = async (event) => {
  try {
    const user = await authMiddleware(event);

    const jobModel = new ScheduledJobModel();
    const jobs = user.role === 'admin' 
      ? await jobModel.findAll()
      : await jobModel.findByUserId(user.userId);

    return ResponseHelper.success({
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    if (error.name === 'AuthenticationError') {
      return ResponseHelper.unauthorized(error.message);
    }
    console.error('List jobs error:', error);
    return ResponseHelper.error(error);
  }
};
