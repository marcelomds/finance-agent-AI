export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Expense = {
  id: string;
  organizationId: string;
  userId: string;
  fileName: string;
  s3Key: string;
  originalFileUrl: string | null;
  status: string;
  category: Category | null;
  categoryConfidence: number | null;
  validationPassed: boolean | null;
  reconciled: boolean | null;
  createdAt: string;
  updatedAt: string;
};
