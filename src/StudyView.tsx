import { useState } from "react";
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

      <p className="flip-hint">Click card to flip</p>

      <div className="study-actions">
        <button className="btn not-learned" onClick={handleNotLearned}>
          Not Learned
        </button>
        <button className="btn skip" onClick={next}>
          Skip
        </button>
        <button className="btn learned" onClick={handleLearned}>
          Learned
        </button>
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
