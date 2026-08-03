export type Expense = {
  id: string;
  userId: string;
  fileName: string;
  s3Key: string;
  originalFileUrl: string | null;
  status: string;
  category: string | null;
  categoryConfidence: number | null;
  validationPassed: boolean | null;
  reconciled: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateExpenseInput = {
  userId: string;
  fileName: string;
  s3Key: string;
  originalFileUrl?: string;
};
