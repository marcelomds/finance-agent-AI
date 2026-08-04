export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ExtractedData = {
  vendor: string | null;
  amount: number | null;
  currency: string | null;
  date: string | null;
  description: string;
  confidence: number;
};

export type Expense = {
  id: string;
  organizationId: string;
  userId: string;
  fileName: string;
  s3Key: string;
  originalFileUrl: string | null;
  status: string;
  extractedData: ExtractedData | null;
  category: Category | null;
  categoryConfidence: number | null;
  validationPassed: boolean | null;
  reconciled: boolean | null;
  createdAt: string;
  updatedAt: string;
};
