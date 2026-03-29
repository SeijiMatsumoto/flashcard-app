import { useState, useRef } from "react";
import type { DragEvent } from "react";

interface Props {
  onImport: (json: string) => string | null;
}

export default function ImportView({ onImport }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    if (!text.trim()) return;
    const err = onImport(text);
    if (err) setError(err);
    else {
      setText("");
      setError(null);
    }
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      const err = onImport(content);
      if (err) setError(err);
      else setError(null);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
      return;
    }
    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      setText(text);
      const err = onImport(text);
      if (err) setError(err);
      else setError(null);
    }
  }

  const example = JSON.stringify(
    {
      title: "JavaScript Fundamentals",
      description: "Core JS concepts for interview prep",
      tags: ["javascript", "interview"],
      cards: [
        {
          id: "1",
          front: "What is a closure?",
          back: "A function that retains access to its outer scope even after the outer function has returned.",
        },
      ],
    },
    null,
    2
  );

  return (
    <div className="import-view">
      <h2>Import Flashcard Set</h2>
      <div
        className={`drop-zone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p>Drop a JSON file here, or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      <div className="or-divider">or paste JSON below</div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null);
        }}
        placeholder={example}
        rows={12}
      />
      {error && <p className="error">{error}</p>}
      <button className="btn primary" onClick={handleSubmit}>
        Import
      </button>

      <details className="schema-hint">
        <summary>Expected JSON format</summary>
        <pre>{example}</pre>
      </details>
    </div>
  );
}
