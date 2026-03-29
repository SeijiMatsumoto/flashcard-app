import type { StoredFlashcardSet, FlashcardSet } from "./schema";

const STORAGE_KEY = "flashcard-app-sets";

export function loadSets(): StoredFlashcardSet[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const sets: StoredFlashcardSet[] = JSON.parse(raw);
    // Migrate legacy decks without IDs
    let needsSave = false;
    const usedIds = new Set<string>();
    for (const s of sets) {
      if (!s.id) {
        needsSave = true;
        const base = s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "deck";
        let slug = base;
        let i = 2;
        while (usedIds.has(slug)) slug = `${base}-${i++}`;
        s.id = slug;
      }
      usedIds.add(s.id);
    }
    if (needsSave) saveSets(sets);
    return sets;
  } catch {
    return [];
  }
}

export function saveSets(sets: StoredFlashcardSet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

function generateId(title: string, existing: StoredFlashcardSet[]): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = base || "deck";
  const existingIds = new Set(existing.map((s) => s.id));
  if (!existingIds.has(slug)) return slug;
  let i = 2;
  while (existingIds.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

export function addSet(set: FlashcardSet): StoredFlashcardSet[] {
  const sets = loadSets();
  const id = generateId(set.title, sets);
  const stored: StoredFlashcardSet = { ...set, id, learnedCardIds: [] };
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
