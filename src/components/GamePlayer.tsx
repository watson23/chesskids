"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import NavIcon from "@/components/NavIcon";
import type { AIDifficulty } from "@/types/chess";
import ChessBoard from "@/components/ChessBoard";
import Confetti from "@/components/Confetti";

import SpeechBubble from "@/components/SpeechBubble";
import TapHint from "@/components/TapHint";
import { useChessGame } from "@/hooks/useChessGame";
import { useAudio } from "@/hooks/useAudio";
import { getAIMove } from "@/lib/chess-ai";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { useLocale } from "@/hooks/useLocale";
import type { LocaleKey } from "@/types/locale";

const OPPONENTS: Record<number, { nameKey: LocaleKey; image: string; bgColor: string; accentColor: string }> = {
  1: { nameKey: "opponent_mouse_name", image: "/opponents/mouse-t.webp", bgColor: "#D1FAE5", accentColor: "#6EE7B7" },
  2: { nameKey: "opponent_fox_name", image: "/opponents/fox-t.webp", bgColor: "#FEF3C7", accentColor: "#FCD34D" },
  3: { nameKey: "opponent_owl_name", image: "/opponents/owl-t.webp", bgColor: "#DBEAFE", accentColor: "#93C5FD" },
  4: { nameKey: "opponent_bear_name", image: "/opponents/bear-t.webp", bgColor: "#FCE7F3", accentColor: "#FDA4AF" },
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
  const [pikuMood, setPikuMood] = useState<string | null>(null);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPieceCountRef = useRef<number>(32);

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
          localStorage.setItem("mfcm_owl_beaten", "true");
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

  // Track captures and game events → set temporary Piku mood
  const pieceCount = useMemo(() => Object.keys(pieces).length, [pieces]);
  const moveCount = useMemo(() => {
    // Move count from FEN fullmove number (last field)
    const parts = fen.split(" ");
    return parseInt(parts[5] || "1", 10);
  }, [fen]);

  useEffect(() => {
    if (gameResult) return; // game-end expressions take priority

    const prevCount = prevPieceCountRef.current;
    prevPieceCountRef.current = pieceCount;

    if (pieceCount < prevCount) {
      // A capture happened!
      if (turn === "black") {
        // White just captured — player captured a piece
        setPikuMood("cheering");
      } else {
        // Black just captured — opponent captured player's piece
        setPikuMood("surprised");
      }
      const timer = setTimeout(() => setPikuMood(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [pieceCount, turn, gameResult]);

  // Idle timers during player's turn — puzzled at 10s, sleepy at 30s
  const sleepyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (tapHintTimer.current) clearTimeout(tapHintTimer.current);
    if (sleepyTimer.current) clearTimeout(sleepyTimer.current);
    setShowTapHint(false);

    if (turn === "white" && !isAIThinking && !gameOver.over && !gameResult && !selectedSquare) {
      tapHintTimer.current = setTimeout(() => {
        setShowTapHint(true);
        setPikuMood("puzzled");
      }, 10000);
      sleepyTimer.current = setTimeout(() => {
        setPikuMood("sleepy");
      }, 30000);
    } else {
      // Clear idle moods when player acts
      if (pikuMood === "sleepy" || pikuMood === "puzzled") setPikuMood(null);
    }

    return () => {
      if (tapHintTimer.current) clearTimeout(tapHintTimer.current);
      if (sleepyTimer.current) clearTimeout(sleepyTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, isAIThinking, gameOver.over, gameResult, selectedSquare]);

  const handleRematch = useCallback(() => {
    sfx("button-tap");
    setGameResult(null);
    setIsAIThinking(false);
    setShowTapHint(false);
    setPikuMood(null);
    prevPieceCountRef.current = 32;
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    if (tapHintTimer.current) {
      clearTimeout(tapHintTimer.current);
    }
    if (sleepyTimer.current) {
      clearTimeout(sleepyTimer.current);
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

  // Opponent speech (shown near the opponent character)
  const opponentText = isAIThinking && !gameResult ? t("game_ai_thinking") : "";
  const opponentIcon = isAIThinking && !gameResult ? "/speech/speech-opponent-thinking.webp" : undefined;

  // Piku coach speech (shown near Piku, below the board)
  const pikuText = gameResult === "win" ? t("you_win")
    : gameResult === "loss" ? t("you_lose")
      : gameResult === "draw" ? t("draw")
        : !isAIThinking ? t("game_your_turn") : "";

  const pikuIcon = gameResult === "win" ? "/speech/speech-you-won.webp"
    : gameResult === "loss" ? "/speech/speech-you-lost.webp"
      : gameResult === "draw" ? "/speech/speech-its-a-draw.webp"
        : !isAIThinking ? "/speech/speech-your-turn-white.webp" : undefined;

  // Count player's remaining pieces to detect when player is struggling
  const playerPieceCount = useMemo(() => {
    return Object.values(pieces).filter(p => p.color === "white").length;
  }, [pieces]);

  // Piku expression: game result > temporary mood > contextual default
  const pikuExpression = gameResult === "win" ? "celebrating"
    : gameResult === "loss" ? "sad"
      : gameResult === "draw" ? "proud"
        : pikuMood ? pikuMood
          : isAIThinking ? "puzzled"
            : playerPieceCount <= 8 ? "determined"
              : moveCount <= 1 ? "happy"
                : moveCount % 7 === 0 ? "winking"
                  : moveCount % 5 === 0 ? "proud" : "happy";

  return (
    <div className="min-h-dvh flex flex-col overflow-y-auto" style={{ background: "var(--ck-bg) url(/game-bg.webp) center / cover no-repeat" }}>
      {/* Top bar: home button */}
      <div className="flex items-center px-4 pt-3 pb-1">
        <NavIcon icon="icon-home" alt="Back to opponents" onClick={handleExit} />
      </div>

      {/* Floating opponent */}
      <div className="flex flex-col items-center px-4 pb-1">
        {/* Character image with speech bubble anchored to its right */}
        <div className="relative">
          <div
            className={`transition-transform duration-500 ${
              isAIThinking ? "animate-opponent-think" : ""
            }`}
          >
            <Image
              src={opponent.image}
              alt={t(opponent.nameKey)}
              width={100}
              height={100}
              className="drop-shadow-lg"
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
              priority
            />
          </div>
          {!!opponentText && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2">
              <SpeechBubble text={opponentText} icon={opponentIcon} visible pointer="left" />
            </div>
          )}
        </div>

        {/* Name badge + status */}
        <div
          className={`card-pillow flex items-center gap-2 px-4 py-1.5 -mt-2 transition-all duration-300 ${
            turn === "black" && !gameOver.over ? "ring-2 ring-amber-400 shadow-lg" : ""
          }`}
        >
          <span
            className="text-[15px] font-extrabold leading-tight"
            style={{ color: "var(--ck-text)" }}
          >
            {t(opponent.nameKey)}
          </span>

          {isAIThinking && (
            <div className="flex gap-0.5 items-center ml-1">
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: opponent.accentColor, animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: opponent.accentColor, animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: opponent.accentColor, animationDelay: "300ms" }} />
            </div>
          )}

          {!isAIThinking && turn === "white" && !gameOver.over && !gameResult && (
            <div className="flex gap-0.5 ml-1">
              {Array.from({ length: difficulty }, (_, i) => (
                <Image key={i} src="/icons/icon-star-full.webp" alt="Difficulty star" width={14} height={14} className="object-contain" style={{ width: 14, height: "auto" }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 gap-2">
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
                <Image src="/icons/icon-retry.webp" alt="" width={22} height={22} className="object-contain" />
                <span>{t("rematch")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Piku coach below the board */}
        <div className="flex items-start gap-2 w-full max-w-[360px]">
          <div className="flex-shrink-0 w-[72px] h-[86px] relative overflow-hidden">
            <Image
              src={`/mascot/piku-${pikuExpression}.webp`}
              alt="Piku"
              width={72}
              height={108}
              className="drop-shadow-md absolute bottom-0 left-0"
              style={{ width: 72, height: "auto" }}
            />
          </div>
          <div className="pt-2">
            <SpeechBubble text={pikuText} icon={pikuIcon} visible={!!pikuText} />
          </div>
        </div>

        {!gameResult && turn === "white" && !isAIThinking && (
          <TapHint visible={showTapHint} />
        )}
      </div>
    </div>
  );
}
