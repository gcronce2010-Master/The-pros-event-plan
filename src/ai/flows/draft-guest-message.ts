'use server';
/**
 * @fileOverview An AI agent for drafting personalized and engaging messages for event guests.
 *
 * - draftGuestMessage - A function that handles the guest message drafting process.
 * - DraftGuestMessageInput - The input type for the draftGuestMessage function.
 * - DraftGuestMessageOutput - The return type for the draftGuestMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DraftGuestMessageInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventDate: z.string().describe('The date of the event (e.g., "YYYY-MM-DD").'),
  eventTime: z.string().describe('The time of the event (e.g., "HH:MM AM/PM").'),
  eventLocation: z.string().describe('The location where the event will take place.'),
  eventTheme: z.string().optional().describe('The theme of the event (optional).'),
  eventDescription: z.string().describe('A brief description of the event.'),
  messageType: z.string().describe('The type of message to draft (e.g., "invitation", "welcome", "update", "thank you").'),
  guestName: z.string().optional().describe('The specific guest to address the message to (optional).'),
  additionalContext: z.string().optional().describe('Any additional context or specific details to include in the message.'),
  tone: z.string().describe('The desired tone of the message (e.g., "formal", "casual", "exciting", "friendly", "professional").'),
});
export type DraftGuestMessageInput = z.infer<typeof DraftGuestMessageInputSchema>;

const DraftGuestMessageOutputSchema = z.object({
  draftedMessage: z.string().describe('The AI-generated draft of the personalized guest message.'),
});
export type DraftGuestMessageOutput = z.infer<typeof DraftGuestMessageOutputSchema>;

export async function draftGuestMessage(input: DraftGuestMessageInput): Promise<DraftGuestMessageOutput> {
  return draftGuestMessageFlow(input);
}

const draftGuestMessagePrompt = ai.definePrompt({
  name: 'draftGuestMessagePrompt',
  input: { schema: DraftGuestMessageInputSchema },
  output: { schema: DraftGuestMessageOutputSchema },
  prompt: `You are an AI assistant specialized in drafting engaging and personalized messages for event guests. Your goal is to help party organizers communicate effectively and save time.

Your task is to create a message based on the provided event details and context. Ensure the message is personalized, engaging, and adheres to the specified tone and message type.

Event Details:
- Event Name: {{{eventName}}}
- Date: {{{eventDate}}}
- Time: {{{eventTime}}}
- Location: {{{eventLocation}}}
- Theme: {{{eventTheme}}}
- Description: {{{eventDescription}}}

Message Context:
- Message Type: {{{messageType}}}
{{#if guestName}}- Specific Guest: {{{guestName}}}{{/if}}
{{#if additionalContext}}- Additional Context: {{{additionalContext}}}{{/if}}
- Desired Tone: {{{tone}}}

Draft a clear, engaging, and personalized message. Ensure it matches the specified 'Desired Tone' and 'Message Type'.
If a 'Specific Guest' is provided, address the message directly to them. Include all relevant event details.
`,
});

const draftGuestMessageFlow = ai.defineFlow(
  {
    name: 'draftGuestMessageFlow',
    inputSchema: DraftGuestMessageInputSchema,
    outputSchema: DraftGuestMessageOutputSchema,
  },
  async (input) => {
    const { output } = await draftGuestMessagePrompt(input);
    return output!;
  }
);
