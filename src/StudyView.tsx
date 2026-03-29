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
  const [flash, setFlash] = useState<"learned" | "not-learned" | null>(null);
  const [slide, setSlide] = useState<"slide-left" | "slide-right" | "slide-up" | null>(null);
  const [markedNotLearned, setMarkedNotLearned] = useState<Set<string>>(new Set());

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

  const animating = slide !== null || flash !== null;

  function animateSlide(direction: "slide-left" | "slide-right" | "slide-up", then: () => void) {
    setSlide(direction);
    setTimeout(() => {
      then();
      setFlipped(false);
      setSlide(null);
    }, 250);
  }

  const isFirst = safeIndex === 0;
  const isLast = safeIndex >= unlearnedCards.length - 1;

  function prev() {
    if (animating || isFirst) return;
    setFlipped(false);
    animateSlide("slide-right", () => {
      setCurrentIndex((i) => i - 1);
    });
  }

  function next() {
    if (animating || isLast) return;
    setFlipped(false);
    animateSlide("slide-left", () => {
      setCurrentIndex((i) => i + 1);
    });
  }

  function handleLearned() {
    if (animating) return;
    setFlipped(false);
    setFlash("learned");
    setTimeout(() => {
      animateSlide("slide-up", () => {
        setFlash(null);
        onMarkLearned(card.id);
        if (safeIndex >= unlearnedCards.length - 1) {
          setCurrentIndex(0);
        }
      });
    }, 300);
  }

  function handleNotLearned() {
    if (animating) return;
    setFlipped(false);
    setFlash("not-learned");
    setMarkedNotLearned((prev) => new Set(prev).add(card.id));
    setTimeout(() => {
      animateSlide("slide-left", () => {
        setFlash(null);
        onMarkNotLearned(card.id);
        setCurrentIndex((i) => (i + 1 >= unlearnedCards.length ? 0 : i + 1));
      });
    }, 300);
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "Enter":
        case "ArrowUp":
        case "ArrowDown":
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
        case "1":
          e.preventDefault();
          handleNotLearned();
          break;
        case "2":
          e.preventDefault();
          handleLearned();
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
        <button className="btn nav-arrow" onClick={prev} disabled={isFirst} aria-label="Previous card">&larr;</button>
        <div className={`flashcard ${flipped ? "flipped" : ""} ${flash ? `flash-${flash}` : ""} ${slide || ""} ${!flash && markedNotLearned.has(card.id) ? "marked-not-learned" : ""}`} onClick={() => !animating && setFlipped(!flipped)}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <span className="card-label">Question {safeIndex + 1}/{unlearnedCards.length}</span>
              <p>{card.front}</p>
            </div>
            <div className="flashcard-back">
              <span className="card-label">Answer {safeIndex + 1}/{unlearnedCards.length}</span>
              <p>{card.back}</p>
            </div>
          </div>
        </div>
        <button className="btn nav-arrow" onClick={next} disabled={isLast} aria-label="Next card">&rarr;</button>
      </div>

      <p className="flip-hint">Click or press ↑↓ / Space to flip</p>

      <div className="study-actions">
        <button className="btn not-learned" onClick={handleNotLearned}>
          Not Learned
          <span className="shortcut-hint">1</span>
        </button>
        <button className="btn learned" onClick={handleLearned}>
          Learned
          <span className="shortcut-hint">2</span>
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
