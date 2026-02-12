'use server';
/**
 * @fileOverview A GenAI tool for brainstorming party themes, decor ideas, and activities.
 *
 * - brainstormPartyTheme - A function that generates creative party ideas based on user input.
 * - BrainstormPartyThemeInput - The input type for the brainstormPartyTheme function.
 * - BrainstormPartyThemeOutput - The return type for the brainstormPartyTheme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BrainstormPartyThemeInputSchema = z.object({
  occasion: z.string().describe('The occasion for the party (e.g., Birthday, Anniversary, Holiday, Graduation).'),
  guestCount: z.number().int().positive().describe('The estimated number of guests attending the party.'),
  vibe: z.string().describe('The desired atmosphere or mood for the party (e.g., Elegant, Casual, Fun, Relaxed, Lively).'),
});
export type BrainstormPartyThemeInput = z.infer<typeof BrainstormPartyThemeInputSchema>;

const BrainstormPartyThemeOutputSchema = z.object({
  theme: z.string().describe('A creative and fitting party theme.'),
  decorIdeas: z.array(z.string()).describe('A list of detailed decor ideas that align with the theme and vibe.'),
  activityIdeas: z.array(z.string()).describe('A list of engaging activity ideas suitable for the occasion, guest count, and theme.'),
});
export type BrainstormPartyThemeOutput = z.infer<typeof BrainstormPartyThemeOutputSchema>;

export async function brainstormPartyTheme(input: BrainstormPartyThemeInput): Promise<BrainstormPartyThemeOutput> {
  return brainstormPartyThemeFlow(input);
}

const brainstormPartyThemePrompt = ai.definePrompt({
  name: 'brainstormPartyThemePrompt',
  input: {schema: BrainstormPartyThemeInputSchema},
  output: {schema: BrainstormPartyThemeOutputSchema},
  prompt: `You are an expert party planner, highly creative and imaginative. Your task is to brainstorm unique and engaging party ideas based on the provided details.

Given the following information about an upcoming party:
Occasion: {{{occasion}}}
Guest Count: {{{guestCount}}}
Desired Vibe: {{{vibe}}}

Please generate:
1.  A creative and fitting party theme.
2.  Detailed decor ideas that align with the theme and vibe.
3.  Engaging activity ideas suitable for the occasion, guest count, and theme.

Format your output as a JSON object.`,
});

const brainstormPartyThemeFlow = ai.defineFlow(
  {
    name: 'brainstormPartyThemeFlow',
    inputSchema: BrainstormPartyThemeInputSchema,
    outputSchema: BrainstormPartyThemeOutputSchema,
  },
  async (input) => {
    const {output} = await brainstormPartyThemePrompt(input);
    if (!output) {
      throw new Error('Failed to generate party theme ideas.');
    }
    return output;
  }
);
