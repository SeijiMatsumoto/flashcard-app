import { useEffect, useRef, useState } from "react";
import type { Card, FlashcardSet, StoredFlashcardSet } from "./schema";

interface Props {
  set: StoredFlashcardSet;
  onSave: (changes: Pick<FlashcardSet, "title" | "description" | "cards">) => void;
  onCancel: () => void;
}

function newCardId(existing: Card[]): string {
  const ids = new Set(existing.map((c) => c.id));
  let id: string;
  do {
    id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  } while (ids.has(id));
  return id;
}

export default function DeckEditor({ set, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(set.title);
  const [description, setDescription] = useState(set.description ?? "");
  const [cards, setCards] = useState<Card[]>(set.cards);
  const [error, setError] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const dirty = title !== set.title || description !== (set.description ?? "") || cards !== set.cards;

  // Focus the front field of a newly added card
  useEffect(() => {
    if (!focusId) return;
    const el = listRef.current?.querySelector<HTMLTextAreaElement>(`[data-card-id="${CSS.escape(focusId)}"] textarea`);
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusId]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function updateCard(id: string, field: "front" | "back", value: string) {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    setError(null);
  }

  function deleteCard(id: string) {
    setCards((cs) => cs.filter((c) => c.id !== id));
    setError(null);
  }

  function addCard() {
    const id = newCardId(cards);
    setCards((cs) => [...cs, { id, front: "", back: "" }]);
    setFocusId(id);
    setError(null);
  }

  function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Deck needs a title.");
      return;
    }
    // Silently drop cards left completely blank
    const kept = cards
      .map((c) => ({ ...c, front: c.front.trim(), back: c.back.trim() }))
      .filter((c) => c.front || c.back);
    const missingFront = kept.findIndex((c) => !c.front);
    if (missingFront >= 0) {
      setError(`Card ${cards.findIndex((c) => c.id === kept[missingFront].id) + 1} needs a front.`);
      return;
    }
    if (kept.length === 0) {
      setError("Deck needs at least one card.");
      return;
    }
    onSave({ title: trimmedTitle, description: description.trim() || undefined, cards: kept });
  }

  function handleCancel() {
    if (dirty && !window.confirm("Discard your changes to this deck?")) return;
    onCancel();
  }

  return (
    <div className="deck-editor">
      <div className="deck-editor-header">
        <button className="btn back-btn" onClick={handleCancel}>
          &larr; Back
        </button>
        <h2>Edit Deck</h2>
      </div>

      <div className="deck-editor-meta">
        <label htmlFor="deck-title">Title</label>
        <input id="deck-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="deck-description">Description</label>
        <input id="deck-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
      </div>

      <div className="deck-editor-count">
        {cards.length} card{cards.length !== 1 ? "s" : ""}
      </div>

      <ol className="deck-editor-cards" ref={listRef}>
        {cards.map((card, i) => (
          <li key={card.id} className="deck-editor-card" data-card-id={card.id}>
            <span className="deck-editor-num">{i + 1}</span>
            <div className="deck-editor-fields">
              <label>
                <span>Front</span>
                <textarea rows={2} value={card.front} onChange={(e) => updateCard(card.id, "front", e.target.value)} />
              </label>
              <label>
                <span>Back</span>
                <textarea rows={2} value={card.back} onChange={(e) => updateCard(card.id, "back", e.target.value)} />
              </label>
            </div>
            <button className="btn deck-editor-delete" onClick={() => deleteCard(card.id)} aria-label={`Delete card ${i + 1}`} title="Delete card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </li>
        ))}
      </ol>

      <button className="btn deck-editor-add" onClick={addCard}>
        + Add card
      </button>

      <div className="deck-editor-footer">
        {error && <p className="error">{error}</p>}
        <div className="deck-editor-actions">
          <button className="btn skip" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn primary" onClick={handleSave} disabled={!dirty}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
