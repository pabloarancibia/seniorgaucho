export interface ExecutionResult {
  output: string;
  success: boolean;
}

export type ExecutionStatus = "idle" | "booting" | "running" | "ready" | "error";
