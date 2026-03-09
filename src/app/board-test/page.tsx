"use client";

import ChessBoard from "@/components/ChessBoard";
import { useChessGame } from "@/hooks/useChessGame";
import { DEFAULT_BOARD_THEME, DEFAULT_PIECE_COLORS } from "@/data/themes";

export default function BoardTestPage() {
  const {
    pieces,
    selectedSquare,
    validMoves,
    lastMove,
    turn,
    gameOver,
    handleSquareTap,
    reset,
  } = useChessGame({
    playerColor: "both",
    onMove: (from, to, captured) => {
      console.log(`Move: ${from} -> ${to}${captured ? ` (captured ${captured})` : ""}`);
    },
    onGameOver: (result) => {
      console.log(`Game over: ${result}`);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <h1 className="text-2xl font-bold text-amber-900">Board Test</h1>

      <div className="text-lg font-semibold text-amber-800">
        {gameOver.over ? (
          <span className="text-red-600">
            Game Over — {gameOver.result === "checkmate" ? "Checkmate!" : gameOver.result === "stalemate" ? "Stalemate" : "Draw"}
          </span>
        ) : (
          <span>{turn === "white" ? "White" : "Black"} to move</span>
        )}
      </div>

      <ChessBoard
        pieces={pieces}
        theme={DEFAULT_BOARD_THEME}
        pieceColors={DEFAULT_PIECE_COLORS}
        selectedSquare={selectedSquare}
        validMoves={validMoves}
        lastMove={lastMove}
        onSquareTap={handleSquareTap}
        interactive={!gameOver.over}
      />

      <button
        onClick={() => reset()}
        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-md hover:bg-indigo-700 active:scale-95 transition-transform"
      >
        Reset Game
      </button>
    </div>
  );
}
