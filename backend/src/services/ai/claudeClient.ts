import Anthropic from '@anthropic-ai/sdk';

export const claude = new Anthropic();

// Change CLAUDE_MODEL in .env to switch models without touching code.
export const DEFAULT_MODEL = process.env.CLAUDE_MODEL ?? 'claude-haiku-4-5';
