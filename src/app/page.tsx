"use client";

import {useEffect, useState} from "react";
import Board from "./Board";

type Cell = { letter: string };

function makeEmptyBoard(): Cell[][] {
  return Array.from({ length: 15 }, () =>
    Array.from({ length: 15 }, () => ({ letter: "" }))
  );
}

export default function Page() {
  const [board, setBoard] = useState<Cell[][]>(() => makeEmptyBoard());
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(
    null
  );

    useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selected) return;

      const { r, c } = selected;

      if (/^[a-zA-Z]$/.test(e.key)) {
        const letter = e.key.toUpperCase();
        setBoard(prev => {
          const next = prev.map(row => row.map(cell => ({ ...cell })));
          next[r][c].letter = letter;
          return next;
        });
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        setBoard(prev => {
          const next = prev.map(row => row.map(cell => ({ ...cell })));
          next[r][c].letter = "";
          return next;
        });
      }

      if (e.key === "ArrowUp")
    setSelected(s => (s ? { r: Math.max(0, s.r - 1), c: s.c } : s));
    if (e.key === "ArrowDown")
      setSelected(s => (s ? { r: Math.min(14, s.r + 1), c: s.c } : s));
    if (e.key === "ArrowLeft")
      setSelected(s => (s ? { r: s.r, c: Math.max(0, s.c - 1) } : s));
    if (e.key === "ArrowRight")
      setSelected(s => (s ? { r: s.r, c: Math.min(14, s.c + 1) } : s));
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  return (
    <main className="min-h-screen bg-neutral-900 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight">UnScrabble!</h1>
        <p className="mt-1 text-neutral-500">Phase 1: Click a square.</p>

        <div className="mt-6 flex gap-6">
          <Board board={board} selected={selected} onSelect={(r, c) => setSelected({ r, c })} />

          <div className="w-72 rounded-xl border-3 border-neutral-800 bg-800 p-4 shadow-sm">
            <div className="text-sm font-medium text-neutral-100">Selected</div>
            <div className="mt-1 font-mono text-sm">
              {selected ? `(${selected.r}, ${selected.c})` : "none"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
