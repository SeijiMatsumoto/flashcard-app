import type { StoredFlashcardSet, FlashcardSet } from "./schema";

const STORAGE_KEY = "flashcard-app-sets";

export function loadSets(): StoredFlashcardSet[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSets(sets: StoredFlashcardSet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

export function addSet(set: FlashcardSet): StoredFlashcardSet[] {
  const sets = loadSets();
  const stored: StoredFlashcardSet = { ...set, learnedCardIds: [] };
  sets.push(stored);
  saveSets(sets);
  return sets;
}

export function deleteSet(index: number): StoredFlashcardSet[] {
  const sets = loadSets();
  sets.splice(index, 1);
  saveSets(sets);
  return sets;
}

export function markCardLearned(setIndex: number, cardId: string): StoredFlashcardSet[] {
  const sets = loadSets();
  if (!sets[setIndex].learnedCardIds.includes(cardId)) {
    sets[setIndex].learnedCardIds.push(cardId);
  }
  saveSets(sets);
  return sets;
}

export function markCardNotLearned(setIndex: number, cardId: string): StoredFlashcardSet[] {
  const sets = loadSets();
  sets[setIndex].learnedCardIds = sets[setIndex].learnedCardIds.filter((id) => id !== cardId);
  saveSets(sets);
  return sets;
}

export function resetDeck(setIndex: number): StoredFlashcardSet[] {
  const sets = loadSets();
  sets[setIndex].learnedCardIds = [];
  saveSets(sets);
  return sets;
}
