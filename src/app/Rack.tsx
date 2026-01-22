"use client";

type RackProps = {
  rack: string[]; // length 7
  selectedIndex: number | null;
  onSelect: (i: number) => void;
};

export default function Rack({ rack, selectedIndex, onSelect }: RackProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-800 bg-neutral-900 p-3 shadow-sm">
      {rack.map((ch, i) => {
        const isSel = selectedIndex === i;

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={[
              "h-12 w-21 rounded-lg border-2",
              "flex items-center justify-center",
              "text-xl font-extrabold uppercase",
              "transition active:scale-[0.98]",
              ch
                ? "bg-neutral-800 border-neutral-600 text-neutral-50"
                : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900",
              isSel
                ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-900"
                : "",
            ].join(" ")}
            aria-label={`Rack tile ${i + 1}`}
          >
            {ch || " "}
          </button>
        );
      })}
    </div>
  );
}
