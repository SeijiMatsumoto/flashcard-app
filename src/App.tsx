import { useState } from "react";
import { FlashcardSetSchema } from "./schema";
import type { StoredFlashcardSet } from "./schema";
import { loadSets, addSet, deleteSet, markCardLearned, markCardNotLearned, resetDeck } from "./storage";
import ImportView from "./ImportView";
import DeckList from "./DeckList";
import StudyView from "./StudyView";
import "./App.css";

export default function App() {
  const [sets, setSets] = useState<StoredFlashcardSet[]>(loadSets);
  const [studyingIndex, setStudyingIndex] = useState<number | null>(null);
  const [showImport, setShowImport] = useState(false);

  function handleImport(json: string): string | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return "Invalid JSON. Please check your input.";
    }

    const result = FlashcardSetSchema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return `Validation error: ${issues}`;
    }

    const updated = addSet(result.data);
    setSets(updated);
    setShowImport(false);
    return null;
  }

  function handleDelete(index: number) {
    const updated = deleteSet(index);
    setSets(updated);
  }

  function handleMarkLearned(cardId: string) {
    if (studyingIndex === null) return;
    const updated = markCardLearned(studyingIndex, cardId);
    setSets(updated);
  }

  function handleMarkNotLearned(cardId: string) {
    if (studyingIndex === null) return;
    const updated = markCardNotLearned(studyingIndex, cardId);
    setSets(updated);
  }

  function handleReset() {
    if (studyingIndex === null) return;
    const updated = resetDeck(studyingIndex);
    setSets(updated);
  }

  if (studyingIndex !== null && sets[studyingIndex]) {
    return (
      <div className="app study-mode">
        <StudyView
          set={sets[studyingIndex]}
          onMarkLearned={handleMarkLearned}
          onMarkNotLearned={handleMarkNotLearned}
          onReset={handleReset}
          onBack={() => setStudyingIndex(null)}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="home-header">
        <h1>Flashcard App</h1>
        <button className="btn primary add-deck-btn" onClick={() => setShowImport(true)}>
          + Import Deck
        </button>
      </div>
      <DeckList sets={sets} onSelect={setStudyingIndex} onDelete={handleDelete} onImport={() => setShowImport(true)} />

      {showImport && (
        <div className="modal-overlay" onClick={() => setShowImport(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Deck</h2>
              <button className="btn modal-close" onClick={() => setShowImport(false)}>
                &times;
              </button>
            </div>
            <ImportView onImport={handleImport} />
          </div>
        </div>
      )}
    </div>
  );
}
