export type ExtractedData = {
  vendor: string | null;
  amount: number | null;
  currency: string | null;
  date: string | null;
  description: string;
  confidence: number;
};

export type DuplicateCandidate = {
  id: string;
  extractedData: ExtractedData | null;
};

export function checkDateSanity(dateStr: string | null, now: Date = new Date()): string[] {
  if (!dateStr) return ['missing_date'];
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return ['invalid_date'];
  if (date.getTime() > now.getTime()) return ['future_date'];
  return [];
}

export function checkAmountSanity(amount: number | null): string[] {
  if (amount === null || amount <= 0) return ['invalid_amount'];
  return [];
}

export function findDuplicate(target: ExtractedData, candidates: DuplicateCandidate[]): boolean {
  const vendor = target.vendor?.trim().toLowerCase();
  if (!vendor || target.amount === null || !target.date) return false;

  return candidates.some((candidate) => {
    const data = candidate.extractedData;
    if (!data) return false;
    return (
      data.vendor?.trim().toLowerCase() === vendor &&
      data.amount === target.amount &&
      data.date === target.date
    );
  });
}

export function validateExpense(
  extractedData: ExtractedData | null,
  duplicateCandidates: DuplicateCandidate[],
): { issues: string[]; passed: boolean } {
  const issues = [
    ...checkDateSanity(extractedData?.date ?? null),
    ...checkAmountSanity(extractedData?.amount ?? null),
  ];

  if (extractedData && findDuplicate(extractedData, duplicateCandidates)) {
    issues.push('possible_duplicate');
  }

  return { issues, passed: issues.length === 0 };
}
