"use client";

type Cell = { letter: string };

type BoardProps = {
  board: Cell[][];
  selected: { r: number; c: number } | null;
  onSelect: (r: number, c: number) => void;
};

export default function Board({ board, selected, onSelect }: BoardProps) {
  return (
    <div className="inline-block rounded-xl border-3 border-neutral-800 bg-neutral-900 p-3 shadow-sm">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(15, 2.4rem)" }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selected?.r === r && selected?.c === c;

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => onSelect(r, c)}
                className={[
                  "h-10 w-10 rounded-md border",
                  "flex items-center justify-center",
                  "text-lg font-bold uppercase",
                  "transition active:scale-[0.98]",
                  cell.letter
                    ? "bg-neutral-800 border-neutral-600 text-neutral-50"
                    : "bg-neutral-950 border-neutral-800 hover:bg-neutral-900 text-neutral-50",
                  isSelected ? "ring-2 ring-neutral-900" : "",
                ].join(" ")}
              >
                {cell.letter}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
