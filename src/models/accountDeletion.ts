export type DeletionRequestStatus = 'pending' | 'cancelled' | 'completed';

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  reason?: string;
  scheduledDeletionDate: string;
  status: DeletionRequestStatus;
  createdAt: string;
  updatedAt: string;
}
