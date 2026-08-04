import { claude, DEFAULT_MODEL } from './claudeClient';
import { VisionExtractionError } from '../../api/errors/AppError';

export type ExtractedReceiptData = {
  vendor: string | null;
  amount: number | null;
  currency: string | null;
  date: string | null;
  description: string;
  confidence: number;
  tokensUsed: number;
};

const schema = {
  type: 'object',
  properties: {
    vendor: {
      type: ['string', 'null'],
      description: 'Merchant or company name on the receipt. null if not legible.',
    },
    amount: {
      type: ['number', 'null'],
      description: 'Total amount charged. null if not legible — never guess a number.',
    },
    currency: {
      type: ['string', 'null'],
      description: 'ISO 4217 currency code, e.g. EUR, USD. null if not determinable.',
    },
    date: {
      type: ['string', 'null'],
      description: 'Transaction date in YYYY-MM-DD format. null if not legible.',
    },
    description: { type: 'string', description: 'One-line summary of what was purchased' },
    confidence: { type: 'number', description: 'Confidence from 0 to 1 that the extraction is accurate' },
  },
  required: ['vendor', 'amount', 'currency', 'date', 'description', 'confidence'],
  additionalProperties: false,
};

export async function extractReceiptData(
  buffer: Buffer,
  mimeType: string,
): Promise<ExtractedReceiptData> {
  const base64Data = buffer.toString('base64');
  const prompt =
    'Extract the vendor, total amount, currency, date, and a one-line description from this receipt. ' +
    'If a field is not clearly legible, set it to null — do not guess or invent a plausible-looking value, ' +
    'especially for the amount. Lower the confidence score whenever any field is null.';

  const fileBlock =
    mimeType === 'application/pdf'
      ? { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64Data } }
      : {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: mimeType as 'image/jpeg' | 'image/png',
            data: base64Data,
          },
        };

  try {
    const response = await claude.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema } },
      messages: [
        {
          role: 'user',
          content: [fileBlock, { type: 'text', text: prompt }],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new VisionExtractionError('Claude returned no text content for vision extraction');
    }

    const parsed = JSON.parse(textBlock.text) as Omit<ExtractedReceiptData, 'tokensUsed'>;

    return {
      ...parsed,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (err) {
    if (err instanceof VisionExtractionError) throw err;
    throw new VisionExtractionError(err instanceof Error ? err.message : 'Unknown vision extraction error');
  }
}
