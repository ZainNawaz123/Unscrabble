import type { Trie, TrieNode } from "./trie";

type WordResult = { word: string; usedBlank: boolean };

function countLetters(rack: string[]) {
  const counts: Record<string, number> = {};
  let blanks = 0;

  for (const raw of rack) {
    const ch = (raw || "").toUpperCase();
    if (!ch) continue;
    if (ch === "?") blanks++;
    else if (ch >= "A" && ch <= "Z") counts[ch] = (counts[ch] ?? 0) + 1;
  }
  return { counts, blanks };
}

// DFS through trie, consuming rack letters as we go.
function dfs(
  node: TrieNode,
  counts: Record<string, number>,
  blanks: number,
  path: string[],
  usedBlank: boolean,
  out: WordResult[],
  minLen: number,
  maxLen: number
) {
  const len = path.length;

  if (node.isWord && len >= minLen) {
    out.push({ word: path.join(""), usedBlank });
  }
  if (len === maxLen) return;

  // Try each possible next letter from trie children.
  for (const [ch, child] of node.children.entries()) {
    // Use real tile if available
    if ((counts[ch] ?? 0) > 0) {
      counts[ch]--;
      path.push(ch);
      dfs(child, counts, blanks, path, usedBlank, out, minLen, maxLen);
      path.pop();
      counts[ch]++;
      continue;
    }

    // Otherwise use blank if available
    if (blanks > 0) {
      path.push(ch);
      dfs(child, counts, blanks - 1, path, true, out, minLen, maxLen);
      path.pop();
    }
  }
}

export function rackWords(
  trie: Trie,
  rack: string[],
  opts?: { minLen?: number; maxLen?: number; limit?: number }
) {
  const minLen = opts?.minLen ?? 2;
  const maxLen = opts?.maxLen ?? 15;
  const limit = opts?.limit ?? 200;

  const { counts, blanks } = countLetters(rack);

  const raw: WordResult[] = [];
  dfs(trie.root, counts, blanks, [], false, raw, minLen, maxLen);

  // Deduplicate (blanks can create duplicates)
  const best = new Map<string, WordResult>();
  for (const r of raw) {
    const existing = best.get(r.word);
    // prefer the version that did NOT use a blank (nicer UX)
    if (!existing || (existing.usedBlank && !r.usedBlank)) best.set(r.word, r);
  }

  // Sort: longest first, then alphabetical
  const sorted = [...best.values()].sort((a, b) => {
    if (b.word.length !== a.word.length) return b.word.length - a.word.length;
    return a.word.localeCompare(b.word);
  });

  return sorted.slice(0, limit);
}
