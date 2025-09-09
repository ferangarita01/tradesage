import { config } from 'dotenv';
config();

// This MUST be the first import
import '@/ai/genkit';

import '@/ai/flows/aggregate-relevant-news.ts';
import '@/ai/flows/analyze-chart-patterns.ts';
import '@/ai/flows/chat.ts';
