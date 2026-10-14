import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { Card } from "./schema";

interface Props {
  card: Card;
  onSave: (changes: { front: string; back: string }) => void;
  onClose: () => void;
}

export default function EditCardModal({ card, onSave, onClose }: Props) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);

  const canSave = front.trim() !== "";

  function handleSave() {
    if (!canSave) return;
    onSave({ front: front.trim(), back: back.trim() });
  }

  function handleKeyDown(e: KeyboardEvent) {
    // Keep keystrokes from reaching StudyView's window-level shortcuts
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal edit-card-modal" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="modal-header">
          <h2>Edit Card</h2>
          <button className="btn modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <label htmlFor="edit-front">Front</label>
        <textarea id="edit-front" rows={3} value={front} onChange={(e) => setFront(e.target.value)} autoFocus />
        <label htmlFor="edit-back">Back</label>
        <textarea id="edit-back" rows={6} value={back} onChange={(e) => setBack(e.target.value)} />
        <div className="edit-card-actions">
          <button className="btn skip" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={handleSave} disabled={!canSave}>
            Save
          </button>
        </div>
        <p className="edit-card-hint">⌘/Ctrl + Enter to save &middot; Esc to cancel</p>
      </div>
    </div>
  );
}
