import { Chess } from "chess.js";

/**
 * Returns true if the given side has only a king remaining.
 * This is the simplest, most unambiguous "stuck" signal for young kids.
 */
export function isBareKing(fen: string, color: "white" | "black"): boolean {
  const chess = new Chess(fen);
  const pieces = chess.board().flat().filter(
    (p) => p !== null && p.color === (color === "white" ? "w" : "b")
  );
  return pieces.length === 1 && pieces[0]!.type === "k";
}
