import { useCallback, useEffect, useRef, useState } from "react";
import { FlashcardSetSchema } from "./schema";
import type { StoredFlashcardSet } from "./schema";
import { loadSets, addSet, deleteSet, markCardLearned, markCardNotLearned, resetDeck, updateCard, updateDeck } from "./storage";
import ImportView from "./ImportView";
import DeckList from "./DeckList";
import StudyView from "./StudyView";
import DeckEditor from "./DeckEditor";
import "./App.css";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Route {
  deckId: string | null;
  editing: boolean;
}

// URLs: /<deckId> to study, /<deckId>/edit to edit the deck
function getRouteFromUrl(): Route {
  const [deckId, sub] = window.location.pathname.replace(BASE, "").replace(/^\//, "").split("/");
  return { deckId: deckId || null, editing: !!deckId && sub === "edit" };
}

export default function App() {
  const [sets, setSets] = useState<StoredFlashcardSet[]>(loadSets);
  const [route, setRoute] = useState<Route>(getRouteFromUrl);
  const [showImport, setShowImport] = useState(false);
  // Where the deck editor returns to on save/cancel
  const editorReturnsToListRef = useRef(false);
  const activeDeckId = route.deckId;

  const navigateTo = useCallback((deckId: string | null, editing = false) => {
    setRoute({ deckId, editing });
    const url = deckId ? `${BASE}/${deckId}${editing ? "/edit" : ""}` : `${BASE}/`;
    window.history.pushState(null, "", url);
  }, []);

  function openEditor(deckId: string, fromList: boolean) {
    editorReturnsToListRef.current = fromList;
    navigateTo(deckId, true);
  }

  function closeEditor() {
    navigateTo(editorReturnsToListRef.current ? null : activeDeckId);
    editorReturnsToListRef.current = false;
  }

  useEffect(() => {
    const onPopState = () => setRoute(getRouteFromUrl());
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

  function handleEditCard(cardId: string, changes: { front: string; back: string }) {
    if (studyingIndex < 0) return;
    const updated = updateCard(studyingIndex, cardId, changes);
    setSets(updated);
  }

  function handleSaveDeck(changes: Parameters<typeof updateDeck>[1]) {
    if (studyingIndex < 0) return;
    setSets(updateDeck(studyingIndex, changes));
    closeEditor();
  }

  if (studyingSet && route.editing) {
    return (
      <div className="app study-mode">
        <DeckEditor key={studyingSet.id} set={studyingSet} onSave={handleSaveDeck} onCancel={closeEditor} />
      </div>
    );
  }

  if (studyingSet) {
    return (
      <div className="app study-mode">
        <StudyView
          set={studyingSet}
          onMarkLearned={handleMarkLearned}
          onMarkNotLearned={handleMarkNotLearned}
          onReset={handleReset}
          onEditCard={handleEditCard}
          onEditDeck={() => openEditor(studyingSet.id, false)}
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
      <DeckList sets={sets} onSelect={(i) => navigateTo(sets[i].id)} onDelete={handleDelete} onEdit={(i) => openEditor(sets[i].id, true)} onImport={() => setShowImport(true)} />

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
