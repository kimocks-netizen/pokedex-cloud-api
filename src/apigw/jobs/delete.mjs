import { ScheduledJobModel } from '../../shared/models/scheduled-job-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { authMiddleware } from '../../shared/middleware/auth-middleware.mjs';

/**
 * DELETE /jobs/{id} - Delete a scheduled job
 */
export const handler = async (event) => {
  try {
    const user = await authMiddleware(event);

    const jobId = event.pathParameters?.id;
    if (!jobId) {
      return ResponseHelper.badRequest('Job ID is required');
    }

    const jobModel = new ScheduledJobModel();
    const job = await jobModel.findById(jobId);

    if (!job) {
      return ResponseHelper.notFound('Job not found');
    }

    // Verify ownership
    if (job.userId !== user.userId && user.role !== 'admin') {
      return ResponseHelper.forbidden('You can only delete your own jobs');
    }

    await jobModel.delete(jobId);

    return ResponseHelper.success({
      message: 'Job deleted successfully',
      jobId,
    });
  } catch (error) {
    if (error.name === 'AuthenticationError') {
      return ResponseHelper.unauthorized(error.message);
    }
    console.error('Delete job error:', error);
    return ResponseHelper.error(error);
  }
};
