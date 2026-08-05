import { checkDateSanity, checkAmountSanity, findDuplicate, validateExpense } from './validateExpense';

describe('checkDateSanity', () => {
  it('flags missing date', () => {
    expect(checkDateSanity(null)).toEqual(['missing_date']);
  });

  it('flags invalid date string', () => {
    expect(checkDateSanity('not-a-date')).toEqual(['invalid_date']);
  });

  it('flags a date in the future', () => {
    const now = new Date('2026-01-15');
    expect(checkDateSanity('2026-02-01', now)).toEqual(['future_date']);
  });

  it('passes a valid past date', () => {
    const now = new Date('2026-01-15');
    expect(checkDateSanity('2026-01-10', now)).toEqual([]);
  });
});

describe('checkAmountSanity', () => {
  it('flags missing amount', () => {
    expect(checkAmountSanity(null)).toEqual(['invalid_amount']);
  });

  it('flags zero or negative amount', () => {
    expect(checkAmountSanity(0)).toEqual(['invalid_amount']);
    expect(checkAmountSanity(-5)).toEqual(['invalid_amount']);
  });

  it('passes a positive amount', () => {
    expect(checkAmountSanity(42.5)).toEqual([]);
  });
});

describe('findDuplicate', () => {
  const base = {
    vendor: 'Uber',
    amount: 25,
    currency: 'EUR',
    date: '2026-01-10',
    description: 'ride',
    confidence: 0.9,
  };

  it('finds a match with same vendor, amount and date', () => {
    const candidates = [{ id: 'other-1', extractedData: { ...base } }];
    expect(findDuplicate(base, candidates)).toBe(true);
  });

  it('is case-insensitive on vendor name', () => {
    const candidates = [{ id: 'other-1', extractedData: { ...base, vendor: 'UBER' } }];
    expect(findDuplicate(base, candidates)).toBe(true);
  });

  it('does not match when amount differs', () => {
    const candidates = [{ id: 'other-1', extractedData: { ...base, amount: 30 } }];
    expect(findDuplicate(base, candidates)).toBe(false);
  });

  it('does not match when there is no vendor to compare', () => {
    const candidates = [{ id: 'other-1', extractedData: { ...base } }];
    expect(findDuplicate({ ...base, vendor: null }, candidates)).toBe(false);
  });
});

describe('validateExpense', () => {
  it('passes with no issues for clean data', () => {
    const data = {
      vendor: 'Uber',
      amount: 25,
      currency: 'EUR',
      date: '2020-01-10',
      description: 'ride',
      confidence: 0.9,
    };
    expect(validateExpense(data, [])).toEqual({ issues: [], passed: true });
  });

  it('collects every issue at once', () => {
    const data = {
      vendor: null,
      amount: null,
      currency: null,
      date: null,
      description: '',
      confidence: 0,
    };
    const result = validateExpense(data, []);
    expect(result.passed).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining(['missing_date', 'invalid_amount']));
  });

  it('flags a duplicate against another expense', () => {
    const data = {
      vendor: 'Uber',
      amount: 25,
      currency: 'EUR',
      date: '2020-01-10',
      description: 'ride',
      confidence: 0.9,
    };
    const result = validateExpense(data, [{ id: 'other-1', extractedData: { ...data } }]);
    expect(result.passed).toBe(false);
    expect(result.issues).toContain('possible_duplicate');
  });
});

