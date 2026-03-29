import { useCallback, useEffect, useState } from "react";
import { FlashcardSetSchema } from "./schema";
import type { StoredFlashcardSet } from "./schema";
import { loadSets, addSet, deleteSet, markCardLearned, markCardNotLearned, resetDeck } from "./storage";
import ImportView from "./ImportView";
import DeckList from "./DeckList";
import StudyView from "./StudyView";
import "./App.css";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getDeckIdFromUrl(): string | null {
  const path = window.location.pathname.replace(BASE, "").replace(/^\//, "");
  return path || null;
}

export default function App() {
  const [sets, setSets] = useState<StoredFlashcardSet[]>(loadSets);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(getDeckIdFromUrl);
  const [showImport, setShowImport] = useState(false);

  const navigateTo = useCallback((deckId: string | null) => {
    setActiveDeckId(deckId);
    const url = deckId ? `${BASE}/${deckId}` : `${BASE}/`;
    window.history.pushState(null, "", url);
  }, []);

  useEffect(() => {
    const onPopState = () => setActiveDeckId(getDeckIdFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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

  const studyingIndex = activeDeckId !== null ? sets.findIndex((s) => s.id === activeDeckId) : -1;
  const studyingSet = studyingIndex >= 0 ? sets[studyingIndex] : null;

  function handleMarkLearned(cardId: string) {
    if (studyingIndex < 0) return;
    const updated = markCardLearned(studyingIndex, cardId);
    setSets(updated);
  }

  function handleMarkNotLearned(cardId: string) {
    if (studyingIndex < 0) return;
    const updated = markCardNotLearned(studyingIndex, cardId);
    setSets(updated);
  }

  function handleReset() {
    if (studyingIndex < 0) return;
    const updated = resetDeck(studyingIndex);
    setSets(updated);
  }

  if (studyingSet) {
    return (
      <div className="app study-mode">
        <StudyView
          set={studyingSet}
          onMarkLearned={handleMarkLearned}
          onMarkNotLearned={handleMarkNotLearned}
          onReset={handleReset}
          onBack={() => navigateTo(null)}
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
      <DeckList sets={sets} onSelect={(i) => navigateTo(sets[i].id)} onDelete={handleDelete} onImport={() => setShowImport(true)} />

      <footer className="app-footer">
        Data is stored in your browser's local storage. It won't sync across devices or persist if you clear your browser data.
      </footer>

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
