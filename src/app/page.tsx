"use client";

import { useEffect, useState } from "react";
import Board from "./Board";
import Rack from "./Rack";
import { Trie } from "../lib/trie";
import { rackWords } from "../lib/rackWords";

type Cell = { letter: string };

function makeEmptyBoard(): Cell[][] {
  return Array.from({ length: 15 }, () =>
    Array.from({ length: 15 }, () => ({ letter: "" }))
  );
}

export default function Page() {
  // --- Board state ---
  const [board, setBoard] = useState<Cell[][]>(() => makeEmptyBoard());
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(
    null
  );

  // --- Rack state ---
  const [rack, setRack] = useState<string[]>(() => Array(7).fill(""));
  const [rackSelected, setRackSelected] = useState<number | null>(null);

  // --- Dictionary / Trie state ---
  const [trie, setTrie] = useState<Trie | null>(null);
  const [dictStatus, setDictStatus] = useState<string>("Loading dictionary...");
  const [dictCount, setDictCount] = useState<number>(0);

  // --- Generation results ---
  const [rackWordsList, setRackWordsList] = useState<
    { word: string; usedBlank: boolean }[]
  >([]);

  // 1) Load dictionary and build trie once
  useEffect(() => {
    let cancelled = false;

    async function loadDictionary() {
      try {
        setDictStatus("Loading dictionary...");

        const res = await fetch("/words.txt");
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const text = await res.text();
        const lines = text.split(/\r?\n/);

        const t = new Trie();
        let count = 0;

        for (const line of lines) {
          const w = line.trim().toUpperCase();
          if (!w) continue;

          // optional: skip any non A-Z words (safe guard)
          if (!/^[A-Z]+$/.test(w)) continue;

          t.insert(w);
          count++;
        }

        if (cancelled) return;

        setTrie(t);
        setDictCount(count);
        setDictStatus(`Dictionary loaded: ${count.toLocaleString()} words`);
      } catch (e: any) {
        if (cancelled) return;
        setTrie(null);
        setDictCount(0);
        setDictStatus(`Dictionary load error: ${e?.message ?? "unknown error"}`);
      }
    }

    loadDictionary();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Keyboard input (board + rack)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isEditingBoard = selected !== null;
      const isEditingRack = rackSelected !== null;

      if (!isEditingBoard && !isEditingRack) return;

      // --- letters A-Z ---
      if (/^[a-zA-Z]$/.test(e.key)) {
        const letter = e.key.toUpperCase();

        if (isEditingBoard && selected) {
          const { r, c } = selected;
          setBoard((prev) => {
            const next = prev.map((row) => row.map((cell) => ({ ...cell })));
            next[r][c].letter = letter;
            return next;
          });
        } else if (isEditingRack && rackSelected !== null) {
          setRack((prev) => {
            const next = [...prev];
            next[rackSelected] = letter;
            return next;
          });
        }
        return;
      }

      // --- blank tile on rack with '?' ---
      if (e.key === "?" && rackSelected !== null) {
        setRack((prev) => {
          const next = [...prev];
          next[rackSelected] = "?";
          return next;
        });
        return;
      }

      // --- delete ---
      if (e.key === "Backspace" || e.key === "Delete") {
        if (isEditingBoard && selected) {
          const { r, c } = selected;
          setBoard((prev) => {
            const next = prev.map((row) => row.map((cell) => ({ ...cell })));
            next[r][c].letter = "";
            return next;
          });
        } else if (isEditingRack && rackSelected !== null) {
          setRack((prev) => {
            const next = [...prev];
            next[rackSelected] = "";
            return next;
          });
        }
        return;
      }

      // --- arrow keys ---
      // If rack is selected, arrows move within rack.
      if (isEditingRack && rackSelected !== null) {
        if (e.key === "ArrowLeft") {
          setRackSelected((i) => (i === null ? 0 : Math.max(0, i - 1)));
          return;
        }
        if (e.key === "ArrowRight") {
          setRackSelected((i) => (i === null ? 0 : Math.min(6, i + 1)));
          return;
        }
      }

      // Otherwise arrows move on the board selection.
      if (isEditingBoard) {
        if (e.key === "ArrowUp")
          setSelected((s) => (s ? { r: Math.max(0, s.r - 1), c: s.c } : s));
        if (e.key === "ArrowDown")
          setSelected((s) => (s ? { r: Math.min(14, s.r + 1), c: s.c } : s));
        if (e.key === "ArrowLeft")
          setSelected((s) => (s ? { r: s.r, c: Math.max(0, s.c - 1) } : s));
        if (e.key === "ArrowRight")
          setSelected((s) => (s ? { r: s.r, c: Math.min(14, s.c + 1) } : s));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, rackSelected]);

  // 3) Generate rack words
  function handleGenerateRackWords() {
    if (!trie) return;

    const results = rackWords(trie, rack, {
      minLen: 2,
      maxLen: 15,
      limit: 200,
    });

    setRackWordsList(results);
  }

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight">UnScrabble!</h1>
        <p className="mt-1 text-neutral-500">
          Click a square (board) or a rack tile. Type A–Z. Use{" "}
          <span className="font-mono">?</span> for blank.
        </p>

        <div className="mt-6 flex gap-6">
          <Board
            board={board}
            selected={selected}
            onSelect={(r, c) => {
              setSelected({ r, c });
              setRackSelected(null);
            }}
          />

          <div className="w-80 rounded-xl border-2 border-neutral-800 bg-neutral-900 p-4 shadow-sm">
            <div className="text-sm font-medium text-neutral-200">Selected</div>
            <div className="mt-1 font-mono text-sm text-neutral-300">
              {selected ? `Board (${selected.r}, ${selected.c})` : "Board none"}
            </div>
            <div className="mt-2 font-mono text-sm text-neutral-300">
              {rackSelected !== null ? `Rack [${rackSelected}]` : "Rack none"}
            </div>

            <div className="mt-4 text-xs text-neutral-500">{dictStatus}</div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
                onClick={() => {
                  setBoard(makeEmptyBoard());
                  setSelected(null);
                }}
              >
                Clear board
              </button>

              <button
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
                onClick={() => {
                  setRack(Array(7).fill(""));
                  setRackSelected(null);
                  setRackWordsList([]);
                }}
              >
                Clear rack
              </button>

              <button
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800 disabled:opacity-50"
                disabled={!trie}
                onClick={handleGenerateRackWords}
                title={!trie ? "Dictionary still loading..." : "Generate words"}
              >
                Generate rack words
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-neutral-800 bg-neutral-950 p-3">
              <div className="text-xs font-semibold tracking-widest text-neutral-400">
                RACK WORDS ({rackWordsList.length})
              </div>

              <div className="mt-2 space-y-1 font-mono text-sm text-neutral-200">
                {rackWordsList.length === 0 ? (
                  <div className="text-neutral-500">
                    {trie
                      ? "No results yet. Fill your rack and click Generate."
                      : "Waiting for dictionary..."}
                  </div>
                ) : (
                  rackWordsList.map(({ word, usedBlank }) => (
                    <div
                      key={word}
                      className="flex items-center justify-between"
                    >
                      <span>{word}</span>
                      {usedBlank ? (
                        <span className="text-xs text-neutral-500">blank</span>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-3 text-xs text-neutral-600">
              Loaded: {dictCount.toLocaleString()} words
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Rack
            rack={rack}
            selectedIndex={rackSelected}
            onSelect={(i) => {
              setRackSelected(i);
              setSelected(null);
            }}
          />

          <div className="text-sm text-neutral-400">
            Tip: Click rack → arrows move rack. Click board → arrows move board.
          </div>
        </div>
      </div>
    </main>
  );
}
