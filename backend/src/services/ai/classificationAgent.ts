import { claude, DEFAULT_MODEL } from './claudeClient';
import { ClassificationError } from '../../api/errors/AppError';

export type ClassifiableExpense = {
  vendor?: string;
  description: string;
  amount?: number;
};

export type CategoryOption = {
  slug: string;
  name: string;
};

export type ClassificationResult = {
  categorySlug: string;
  confidence: number;
  tokensUsed: number;
};

export async function classifyExpense(
  expense: ClassifiableExpense,
  categories: CategoryOption[],
): Promise<ClassificationResult> {
  if (categories.length === 0) {
    throw new ClassificationError('No categories available for this organization');
  }

  const schema = {
    type: 'object',
    properties: {
      categorySlug: {
        type: 'string',
        enum: categories.map((c) => c.slug),
      },
      confidence: {
        type: 'number',
        description: 'Confidence from 0 to 1',
      },
    },
    required: ['categorySlug', 'confidence'],
    additionalProperties: false,
  };

  const categoryList = categories.map((c) => `- ${c.slug}: ${c.name}`).join('\n');

  try {
    const response = await claude.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema } },
      messages: [
        {
          role: 'user',
          content: [
            'Classify this expense into exactly one of the categories below.',
            '',
            `Vendor: ${expense.vendor ?? 'unknown'}`,
            `Description: ${expense.description}`,
            expense.amount !== undefined ? `Amount: ${expense.amount}` : '',
            '',
            'Categories:',
            categoryList,
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new ClassificationError('Claude returned no text content');
    }

    const parsed = JSON.parse(textBlock.text) as { categorySlug: string; confidence: number };

    return {
      categorySlug: parsed.categorySlug,
      confidence: parsed.confidence,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (err) {
    if (err instanceof ClassificationError) throw err;
    throw new ClassificationError(err instanceof Error ? err.message : 'Unknown classification error');
  }
}
