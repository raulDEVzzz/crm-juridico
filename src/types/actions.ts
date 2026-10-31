export type ActionWarning = {
  message: string;
  duplicateCnj?: {
    clientId: string;
    processNumber: string;
  };
};

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  warning?: ActionWarning;
};
