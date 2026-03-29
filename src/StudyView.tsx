import { useCallback, useEffect, useState } from "react";
import type { StoredFlashcardSet } from "./schema";

interface Props {
  set: StoredFlashcardSet;
  onMarkLearned: (cardId: string) => void;
  onMarkNotLearned: (cardId: string) => void;
  onReset: () => void;
  onBack: () => void;
}

export default function StudyView({ set, onMarkLearned, onMarkNotLearned, onReset, onBack }: Props) {
  const unlearnedCards = set.cards.filter((c) => !set.learnedCardIds.includes(c.id));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const totalCards = set.cards.length;
  const learnedCount = set.learnedCardIds.length;

  if (unlearnedCards.length === 0) {
    return (
      <div className="study-view">
        <button className="btn back-btn" onClick={onBack}>
          &larr; Back
        </button>
        <div className="completed">
          <h2>All cards learned!</h2>
          <p>
            You've completed all {totalCards} cards in "{set.title}".
          </p>
          <button className="btn primary" onClick={onReset}>
            Reset Deck
          </button>
        </div>
      </div>
    );
  }

  const safeIndex = currentIndex >= unlearnedCards.length ? 0 : currentIndex;
  const card = unlearnedCards[safeIndex];

  function prev() {
    setFlipped(false);
    setCurrentIndex((i) => (i - 1 < 0 ? unlearnedCards.length - 1 : i - 1));
  }

  function next() {
    setFlipped(false);
    setCurrentIndex((i) => (i + 1 >= unlearnedCards.length ? 0 : i + 1));
  }

  function handleLearned() {
    onMarkLearned(card.id);
    setFlipped(false);
    if (safeIndex >= unlearnedCards.length - 1) {
      setCurrentIndex(0);
    }
  }

  function handleNotLearned() {
    onMarkNotLearned(card.id);
    setFlipped(false);
    next();
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          setFlipped((f) => !f);
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "ArrowUp":
        case "1":
          e.preventDefault();
          handleLearned();
          break;
        case "ArrowDown":
        case "2":
          e.preventDefault();
          handleNotLearned();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unlearnedCards.length, safeIndex, card?.id],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="study-view">
      <div className="study-header">
        <button className="btn back-btn" onClick={onBack}>
          &larr; Back
        </button>
        <h2>{set.title}</h2>
        <div className="progress">
          {learnedCount} / {totalCards} learned
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(learnedCount / totalCards) * 100}%` }} />
        </div>
      </div>

      <div className="card-nav-container">
        <button className="btn nav-arrow" onClick={prev} aria-label="Previous card">&larr;</button>
        <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <span className="card-label">Question</span>
              <p>{card.front}</p>
            </div>
            <div className="flashcard-back">
              <span className="card-label">Answer</span>
              <p>{card.back}</p>
            </div>
          </div>
        </div>
        <button className="btn nav-arrow" onClick={next} aria-label="Next card">&rarr;</button>
      </div>

      <p className="flip-hint">Click or press Space to flip</p>

      <div className="study-actions">
        <button className="btn not-learned" onClick={handleNotLearned}>
          Not Learned
          <span className="shortcut-hint">↓ / 2</span>
        </button>
        <button className="btn learned" onClick={handleLearned}>
          Learned
          <span className="shortcut-hint">↑ / 1</span>
        </button>
      </div>

      <div className="nav-hint">
        ← Previous &middot; → Next
      </div>

      <div className="remaining">
        {unlearnedCards.length} card{unlearnedCards.length !== 1 ? "s" : ""} remaining
      </div>

      <button className="btn reset-btn" onClick={onReset}>
        Reset Deck
      </button>
    </div>
  );
}
