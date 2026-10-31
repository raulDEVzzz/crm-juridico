export type ActionWarning = {
  message: string;
};

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  warning?: ActionWarning;
};
