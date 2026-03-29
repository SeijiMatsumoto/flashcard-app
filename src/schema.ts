import { z } from "zod";

export const CardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
});

export const FlashcardSetSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  cards: z.array(CardSchema).min(1),
});

export type Card = z.infer<typeof CardSchema>;
export type FlashcardSet = z.infer<typeof FlashcardSetSchema>;

export interface StoredFlashcardSet extends FlashcardSet {
  id: string;
  learnedCardIds: string[];
}
