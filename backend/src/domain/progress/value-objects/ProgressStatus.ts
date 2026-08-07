export const ProgressStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type ProgressStatus = (typeof ProgressStatus)[keyof typeof ProgressStatus];

export function isProgressStatus(value: string): value is ProgressStatus {
  return Object.values(ProgressStatus).includes(value as ProgressStatus);
}
