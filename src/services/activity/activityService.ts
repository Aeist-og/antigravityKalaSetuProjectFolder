import { DatabaseService } from '../database/databaseService';
import { ActivityEvent, ActivityType } from '../../models/activity';

export class ActivityService {
  /**
   * Log an activity event
   */
  public static async log(
    userId: string,
    type: ActivityType,
    titleEn: string,
    titleHi: string,
    detailsEn: string,
    detailsHi: string,
    status: 'success' | 'info' | 'warning' = 'success'
  ): Promise<ActivityEvent | null> {
    const res = await DatabaseService.logActivity({
      userId,
      type,
      titleEn,
      titleHi,
      detailsEn,
      detailsHi,
      status,
    });
    return res.data;
  }

  /**
   * Get all activity events for user
   */
  public static async getEvents(userId?: string): Promise<ActivityEvent[]> {
    const res = await DatabaseService.getActivityEvents(userId);
    return res.data || [];
  }
}
