"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { House, ArrowCounterClockwise } from "@phosphor-icons/react";
import Image from "next/image";
import type { AIDifficulty } from "@/types/chess";
import ChessBoard from "@/components/ChessBoard";
import Confetti from "@/components/Confetti";
import GameMascotBar from "@/components/GameMascotBar";
import TapHint from "@/components/TapHint";
import { useChessGame } from "@/hooks/useChessGame";
import { useAudio } from "@/hooks/useAudio";
import { getAIMove } from "@/lib/chess-ai";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { useLocale } from "@/hooks/useLocale";

const OPPONENTS: Record<number, { nameKey: string; image: string; bgColor: string; accentColor: string }> = {
  1: { nameKey: "opponent_mouse_name", image: "/opponents/mouse.webp", bgColor: "#D1FAE5", accentColor: "#6EE7B7" },
  2: { nameKey: "opponent_fox_name", image: "/opponents/fox.webp", bgColor: "#FEF3C7", accentColor: "#FCD34D" },
  3: { nameKey: "opponent_owl_name", image: "/opponents/owl.webp", bgColor: "#DBEAFE", accentColor: "#93C5FD" },
  4: { nameKey: "opponent_bear_name", image: "/opponents/bear.webp", bgColor: "#FCE7F3", accentColor: "#FDA4AF" },
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
        // Unlock bear opponent when the player beats the owl (level 3)
        if (difficulty >= 3) {
          localStorage.setItem("chesspenguin_owl_beaten", "true");
        }
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

  const opponent = OPPONENTS[difficulty] || OPPONENTS[1];

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--ck-bg) url(/game-bg.webp) center / cover no-repeat" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleExit}
          className="card-pillow p-2 active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <House size={28} weight="fill" style={{ color: "var(--ck-purple)" }} />
        </button>

        {/* Opponent indicator — portrait + name + thinking dot */}
        <div className="flex items-center gap-2">
          <div
            className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              turn === "black" && !gameOver.over
                ? "border-amber-400 shadow-md scale-110"
                : "border-white/50"
            }`}
            style={{ background: opponent.bgColor }}
          >
            <Image
              src={opponent.image}
              alt={t(opponent.nameKey)}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <span
            className="text-sm font-extrabold"
            style={{ color: "var(--ck-text)" }}
          >
            {t(opponent.nameKey)}
          </span>
          {isAIThinking && (
            <div className="flex gap-0.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
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
        {/* Mascot bar — changes expression based on game state */}
        <GameMascotBar
          expression={
            gameResult === "win" ? "celebrating"
              : gameResult === "loss" ? "thinking"
                : gameResult === "draw" ? "happy"
                  : isAIThinking ? "thinking" : "happy"
          }
          narrationKey={
            gameResult === "win" ? "you_win"
              : gameResult === "loss" ? "you_lose"
                : gameResult === "draw" ? "draw"
                  : isAIThinking ? "game_ai_thinking" : "game_your_turn"
          }
        />

        {/* Board is always visible — with celebration overlay when game ends */}
        <div className="relative w-full flex justify-center">
          <ChessBoard
            pieces={pieces}
            theme={boardTheme}
            pieceColors={pieceColors}
            selectedSquare={gameResult ? null : selectedSquare}
            validMoves={gameResult ? [] : validMoves}
            lastMove={lastMove}
            onSquareTap={handleSquareTap}
            interactive={!gameResult && turn === "white" && !isAIThinking}
          />

          {/* Game over overlay on top of the board */}
          {gameResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl animate-slide-in"
              style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(2px)" }}
            >
              {gameResult === "win" && <Confetti active />}

              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-celebrate-pop shadow-lg ${
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
                className="btn-3d btn-3d-purple flex items-center gap-2 px-6 py-2.5 text-white font-bold text-base mt-4"
              >
                <ArrowCounterClockwise size={22} weight="bold" />
                <span>{t("rematch")}</span>
              </button>
            </div>
          )}
        </div>

        {!gameResult && turn === "white" && !isAIThinking && (
          <TapHint visible={showTapHint} />
        )}
      </div>
    </div>
  );
}
