import type { StoredFlashcardSet } from "./schema";

interface Props {
  sets: StoredFlashcardSet[];
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function DeckList({ sets, onSelect, onDelete }: Props) {
  if (sets.length === 0) return null;

  return (
    <div className="deck-list">
      <h2>Your Decks</h2>
      <div className="decks">
        {sets.map((set, i) => {
          const learned = set.learnedCardIds.length;
          const total = set.cards.length;
          const pct = Math.round((learned / total) * 100);
          return (
            <div key={i} className="deck-card" onClick={() => onSelect(i)}>
              <div className="deck-info">
                <h3>{set.title}</h3>
                {set.description && <p className="deck-desc">{set.description}</p>}
                {set.tags && set.tags.length > 0 && (
                  <div className="tags">
                    {set.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="deck-stats">
                  {learned}/{total} learned ({pct}%)
                </p>
              </div>
              <button
                className="btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(i);
                }}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
