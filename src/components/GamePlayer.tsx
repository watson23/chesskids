"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { House, ArrowCounterClockwise } from "@phosphor-icons/react";
import type { AIDifficulty, PieceType } from "@/types/chess";
import ChessBoard from "@/components/ChessBoard";
import Confetti from "@/components/Confetti";
import GameMascotBar from "@/components/GameMascotBar";
import TapHint from "@/components/TapHint";
import { useChessGame } from "@/hooks/useChessGame";
import { useAudio } from "@/hooks/useAudio";
import { getAIMove } from "@/lib/chess-ai";
import { speak } from "@/lib/tts";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { useLocale } from "@/hooks/useLocale";

/** Map chess.js piece abbreviation to a spoken name */
const PIECE_NAMES: Record<PieceType, string> = {
  pawn: "pawn",
  knight: "knight",
  bishop: "bishop",
  rook: "rook",
  queen: "queen",
  king: "king",
};

const PIECE_NAMES_FI: Record<PieceType, string> = {
  pawn: "sotilas",
  knight: "ratsu",
  bishop: "lähetti",
  rook: "torni",
  queen: "kuningatar",
  king: "kuningas",
};

interface GamePlayerProps {
  difficulty: AIDifficulty;
  onExit: () => void;
}

export default function GamePlayer({ difficulty, onExit }: GamePlayerProps) {
  const { say, sfx, language } = useAudio();
  const { boardTheme, pieceColors } = useActiveTheme();
  const { t } = useLocale();
  const [gameResult, setGameResult] = useState<"win" | "loss" | "draw" | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMove = useCallback(() => {
    sfx("piece-place");
  }, [sfx]);

  // Game over is handled via the useEffect that watches gameOver.over,
  // because we need access to `turn` to determine who won.
  const handleGameOver = useCallback(() => {}, []);

  const {
    fen,
    pieces,
    selectedSquare,
    validMoves,
    lastMove,
    turn,
    gameOver,
    handleSquareTap,
    programmaticMove,
    reset,
  } = useChessGame({
    playerColor: "white",
    onMove: handleMove,
    onGameOver: handleGameOver,
  });

  // Determine game result when game ends
  useEffect(() => {
    if (!gameOver.over) return;

    if (gameOver.result === "checkmate") {
      // If it's black's turn and checkmate, that means white delivered checkmate
      // (the game is over after white's move, now it's "black's turn" but they're mated)
      if (turn === "black") {
        setGameResult("win");
        sfx("confetti");
        say("you_win");
      } else {
        setGameResult("loss");
        say("you_lose");
      }
    } else {
      setGameResult("draw");
      say("draw");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver.over]);

  // AI plays as black — make a move when it's black's turn
  useEffect(() => {
    if (turn !== "black" || gameOver.over || isAIThinking) return;

    setIsAIThinking(true);

    // Random delay between 800ms-1500ms so it feels like "thinking"
    const delay = 800 + Math.random() * 700;

    aiTimeoutRef.current = setTimeout(() => {
      const aiMove = getAIMove(fen, difficulty);
      if (aiMove) {
        // Narrate the AI move via TTS
        const pieceName = pieces[aiMove.from];
        if (pieceName) {
          const names = language === "fi" ? PIECE_NAMES_FI : PIECE_NAMES;
          const spokenName = names[pieceName.type];
          const text =
            language === "fi"
              ? `${spokenName} siirtyy ruutuun ${aiMove.to}`
              : `The ${spokenName} moves to ${aiMove.to}`;
          speak(text, { lang: language });
        }

        // Execute the AI move directly (bypasses playerColor check)
        programmaticMove(aiMove.from, aiMove.to);
        setIsAIThinking(false);
      } else {
        setIsAIThinking(false);
      }
    }, delay);

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, gameOver.over]);

  // 10-second idle timer during player's turn — show tap hint
  useEffect(() => {
    if (tapHintTimer.current) clearTimeout(tapHintTimer.current);
    setShowTapHint(false);

    if (turn === "white" && !isAIThinking && !gameOver.over && !gameResult && !selectedSquare) {
      tapHintTimer.current = setTimeout(() => setShowTapHint(true), 10000);
    }

    return () => { if (tapHintTimer.current) clearTimeout(tapHintTimer.current); };
  }, [turn, isAIThinking, gameOver.over, gameResult, selectedSquare]);

  const handleRematch = useCallback(() => {
    sfx("button-tap");
    setGameResult(null);
    setIsAIThinking(false);
    setShowTapHint(false);
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    if (tapHintTimer.current) {
      clearTimeout(tapHintTimer.current);
    }
    reset();
  }, [sfx, reset]);

  const handleExit = useCallback(() => {
    sfx("button-tap");
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    onExit();
  }, [sfx, onExit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--ck-bg)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleExit}
          className="card-pillow p-2 active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <House size={28} weight="fill" style={{ color: "var(--ck-purple)" }} />
        </button>

        {/* Turn indicator */}
        <div className="flex items-center gap-2">
          {/* White indicator */}
          <div
            className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
              turn === "white" && !gameOver.over
                ? "border-amber-400 bg-white shadow-md scale-110 animate-pulse-glow"
                : "border-gray-300 bg-white/60"
            }`}
            aria-label={turn === "white" ? "White's turn" : "White"}
          />
          {/* Black indicator */}
          <div
            className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
              turn === "black" && !gameOver.over
                ? "border-amber-400 bg-gray-700 shadow-md scale-110 animate-pulse-glow"
                : "border-gray-400 bg-gray-600/60"
            }`}
            aria-label={turn === "black" ? "Black's turn (computer thinking)" : "Black"}
          />
        </div>

        {/* Difficulty stars */}
        <div className="flex gap-0.5" aria-label={`Difficulty level ${difficulty}`}>
          {Array.from({ length: difficulty }, (_, i) => (
            <span key={i} className="text-lg" role="img" aria-hidden="true">
              &#11088;
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-2 px-4 gap-3">
        {gameResult ? (
          /* Game Over */
          <div className="flex flex-col items-center gap-5 animate-slide-in mt-auto mb-auto">
            {gameResult === "win" && <Confetti active />}

            <GameMascotBar
              expression={gameResult === "win" ? "celebrating" : gameResult === "loss" ? "thinking" : "happy"}
              narrationKey={gameResult === "win" ? "you_win" : gameResult === "loss" ? "you_lose" : "draw"}
            />

            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-celebrate-pop ${
                gameResult === "win"
                  ? "bg-green-100"
                  : gameResult === "loss"
                    ? "bg-red-100"
                    : "bg-amber-100"
              }`}
            >
              {gameResult === "win" ? (
                <span role="img" aria-label="Trophy">&#127942;</span>
              ) : gameResult === "loss" ? (
                <span role="img" aria-label="Thinking face">&#129300;</span>
              ) : (
                <span role="img" aria-label="Handshake">&#129309;</span>
              )}
            </div>

            <button
              onClick={handleRematch}
              className="btn-3d btn-3d-purple flex items-center gap-2 px-8 py-3 text-white font-bold text-lg"
            >
              <ArrowCounterClockwise size={24} weight="bold" />
              <span>
                {t("rematch")}
              </span>
            </button>
          </div>
        ) : (
          /* Active game */
          <>
            <GameMascotBar
              expression={isAIThinking ? "thinking" : "happy"}
              narrationKey={isAIThinking ? "game_ai_thinking" : "game_your_turn"}
            />

            <ChessBoard
              pieces={pieces}
              theme={boardTheme}
              pieceColors={pieceColors}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareTap={handleSquareTap}
              interactive={turn === "white" && !isAIThinking}
            />

            {turn === "white" && !isAIThinking && (
              <TapHint visible={showTapHint} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
