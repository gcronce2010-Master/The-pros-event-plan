'use server';
/**
 * @fileOverview This file provides a Genkit flow for generating comprehensive party task suggestions and timelines.
 *
 * - suggestPartyTasks - A function that leverages AI to suggest tasks and timelines for event planning.
 * - SuggestPartyTasksInput - The input type for the suggestPartyTasks function.
 * - SuggestPartyTasksOutput - The return type for the suggestPartyTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const SuggestPartyTasksInputSchema = z.object({
  eventType: z
    .string()
    .describe('The type of event (e.g., birthday, wedding, corporate event).'),
  theme: z
    .string()
    .describe('The theme of the event (e.g., Hawaiian luau, 80s retro, elegant gala).'),
  eventDate: z
    .string()
    .datetime()
    .describe('The date of the event in ISO 8601 format (e.g., 2024-12-31T18:00:00Z).'),
});
export type SuggestPartyTasksInput = z.infer<typeof SuggestPartyTasksInputSchema>;

// Output Schema
const SuggestPartyTasksOutputSchema = z.object({
  tasks: z.array(
    z.object({
      description: z.string().describe('Description of the task.'),
      timeline: z
        .string()
        .describe(
          'When the task should be completed relative to the event date (e.g., "2 months before", "1 week before", "day of", "after the event").'
        ),
    })
  ).describe('A comprehensive list of suggested tasks with their timelines.'),
});
export type SuggestPartyTasksOutput = z.infer<typeof SuggestPartyTasksOutputSchema>;

// Define the prompt
const suggestPartyTasksPrompt = ai.definePrompt({
  name: 'suggestPartyTasksPrompt',
  input: {schema: SuggestPartyTasksInputSchema},
  output: {schema: SuggestPartyTasksOutputSchema},
  prompt: `You are an expert party planner and event organizer. Your goal is to generate a comprehensive list of tasks and a recommended timeline for a party based on the provided details.\n\nGiven the following event information:\nEvent Type: {{{eventType}}}\nTheme: {{{theme}}}\nEvent Date: {{{eventDate}}}\n\nPlease generate a list of tasks, each with a clear description and a suggested timeline relative to the event date (e.g., "2 months before", "1 month before", "2 weeks before", "1 week before", "few days before", "day before", "day of", "after the event"). Ensure the tasks cover all aspects of party planning, from initial conceptualization to post-event cleanup. Focus on being thorough and practical.`,
});

// Define the Genkit flow
const suggestPartyTasksFlow = ai.defineFlow(
  {
    name: 'suggestPartyTasksFlow',
    inputSchema: SuggestPartyTasksInputSchema,
    outputSchema: SuggestPartyTasksOutputSchema,
  },
  async input => {
    const {output} = await suggestPartyTasksPrompt(input);
    if (!output) {
      throw new Error('Failed to generate party tasks.');
    }
    return output;
  }
);

// Exported wrapper function
export async function suggestPartyTasks(
  input: SuggestPartyTasksInput
): Promise<SuggestPartyTasksOutput> {
  return suggestPartyTasksFlow(input);
}
