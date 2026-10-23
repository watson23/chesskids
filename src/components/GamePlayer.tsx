"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import NavIcon from "@/components/NavIcon";
import TopBar from "@/components/TopBar";
import ActionButton from "@/components/ActionButton";
import { UI } from "@/lib/ui";
import type { AIDifficulty } from "@/types/chess";
import ChessBoard from "@/components/ChessBoard";
import Confetti from "@/components/Confetti";

import Piku, { type Expression } from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import TapHint from "@/components/TapHint";
import { useChessGame } from "@/hooks/useChessGame";
import { useAudio } from "@/hooks/useAudio";
import { getAIMove } from "@/lib/chess-ai";
import { GAME_RESULT_DELAY, PIKU_MOOD_DURATION } from "@/lib/timing";
import { isBareKing } from "@/lib/stuck-detection";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { useLocale } from "@/hooks/useLocale";
import type { LocaleKey } from "@/types/locale";

interface OpponentDef {
  nameKey: LocaleKey;
  image: string;
  bgColor: string;
  accentColor: string;
  /** Mood portraits for the result card (sad = lost to the kid, proud = beat the kid). */
  moods?: { sad?: string; proud?: string };
}

const OPPONENTS: Record<number, OpponentDef> = {
  1: { nameKey: "opponent_mouse_name", image: "/opponents/mouse-t.webp", bgColor: "#D1FAE5", accentColor: "#6EE7B7", moods: { sad: "/opponents/mouse-sad.webp", proud: "/opponents/mouse-proud.webp" } },
  2: { nameKey: "opponent_fox_name", image: "/opponents/fox-t.webp", bgColor: "#FEF3C7", accentColor: "#FCD34D", moods: { sad: "/opponents/fox-sad.webp", proud: "/opponents/fox-proud.webp" } },
  3: { nameKey: "opponent_owl_name", image: "/opponents/owl-t.webp", bgColor: "#DBEAFE", accentColor: "#93C5FD", moods: { sad: "/opponents/owl-sad.webp", proud: "/opponents/owl-proud.webp" } },
  4: { nameKey: "opponent_bear_name", image: "/opponents/bear-t.webp", bgColor: "#FCE7F3", accentColor: "#FDA4AF", moods: { sad: "/opponents/bear-sad.webp", proud: "/opponents/bear-proud.webp" } },
};

interface GamePlayerProps {
  difficulty: AIDifficulty;
  onExit: () => void;
}

export default function GamePlayer({ difficulty, onExit }: GamePlayerProps) {
  const { say, sfx, stop, language } = useAudio();
  const { boardTheme, pieceColors } = useActiveTheme();
  const { t } = useLocale();
  const [gameResult, setGameResult] = useState<"win" | "loss" | "draw" | null>(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [showStuckNudge, setShowStuckNudge] = useState(false);
  const [pikuMood, setPikuMood] = useState<Expression | null>(null);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPieceCountRef = useRef<number>(32);

  // Stop speech when leaving the game
  useEffect(() => () => stop(), [stop]);

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
    checkSquare,
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
      if (turn === "black") {
        // Win: let the kid admire the checkmate position first
        setGameResult("win");
        sfx("confetti");
        say("game_over_win");
        if (difficulty >= 3) {
          localStorage.setItem("mfcm_owl_beaten", "true");
        }
        // Show overlay after a delay so the board is visible with confetti
        const timer = setTimeout(() => setShowResultOverlay(true), GAME_RESULT_DELAY);
        return () => clearTimeout(timer);
      } else {
        setGameResult("loss");
        setShowResultOverlay(true);
        say("game_over_loss");
      }
    } else {
      setGameResult("draw");
      setShowResultOverlay(true);
      say("game_over_draw");
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

  // Detect bare king (player lost all pieces except king) — offer friendly rematch
  useEffect(() => {
    if (turn === "white" && !gameOver.over && !gameResult && !showStuckNudge && isBareKing(fen, "white")) {
      const timer = setTimeout(() => {
        setShowStuckNudge(true);
        say("stuck_nudge");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [fen, turn, gameOver.over, gameResult, showStuckNudge, say]);

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
      const timer = setTimeout(() => setPikuMood(null), PIKU_MOOD_DURATION);
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
    setShowResultOverlay(false);
    setIsAIThinking(false);
    setShowTapHint(false);
    setShowStuckNudge(false);
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
  const opponentSad = opponent.moods?.sad ?? opponent.image;
  const opponentProud = opponent.moods?.proud ?? opponent.image;
  const resultKey: LocaleKey | null =
    gameResult === "win" ? "game_over_win"
      : gameResult === "loss" ? "game_over_loss"
        : gameResult === "draw" ? "game_over_draw" : null;

  // Opponent speech (shown near the opponent character)
  const opponentText = isAIThinking && !gameResult ? t("game_ai_thinking") : "";
  const opponentIcon = isAIThinking && !gameResult ? "/speech/speech-opponent-thinking.webp" : undefined;

  // Piku coach speech (shown near Piku, below the board)
  const pikuText = gameResult === "win" ? t("game_over_win")
    : gameResult === "loss" ? t("game_over_loss")
      : gameResult === "draw" ? t("game_over_draw")
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
      {/* Top bar: back to opponents */}
      <TopBar left={<NavIcon icon="icon-back" alt="Back to opponents" onClick={handleExit} />} />

      {/* Opponent above the board */}
      <div className="flex flex-col items-center px-4 pb-2 -mt-1">
        <div className="relative">
          <div className={`transition-transform duration-500 ${isAIThinking ? "animate-opponent-think" : ""}`}>
            <Image
              src={opponent.image}
              alt={t(opponent.nameKey)}
              width={UI.opponent.header}
              height={UI.opponent.header}
              className="object-contain"
              style={{ width: UI.opponent.header, height: UI.opponent.header, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
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
          <span className="text-[15px] font-extrabold leading-tight" style={{ color: "var(--ck-text)" }}>
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
                <Image key={i} src="/icons/icon-star-full.webp" alt="Difficulty star" width={UI.star.inline} height={UI.star.inline} className="object-contain" style={{ width: UI.star.inline, height: UI.star.inline }} />
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
            checkSquare={gameResult ? null : checkSquare}
            lastMove={lastMove}
            onSquareTap={handleSquareTap}
            interactive={!gameResult && turn === "white" && !isAIThinking}
          />

          {/* Stuck nudge — bare king detected */}
          {showStuckNudge && !gameResult && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 rounded-xl animate-slide-in"
              style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(3px)" }}
            >
              <Image
                src={opponent.image}
                alt={t(opponent.nameKey)}
                width={UI.opponent.header}
                height={UI.opponent.header}
                className="object-contain drop-shadow-lg"
                style={{ width: UI.opponent.header, height: UI.opponent.header }}
              />
              <SpeechBubble text={t("stuck_nudge")} visible pointer="bottom" />
              <div className="flex gap-4 mt-2">
                <ActionButton icon="/icons/icon-retry.webp" label={t("rematch")} tone="purple" onClick={handleRematch} />
                <ActionButton icon="/icons/icon-back.webp" label="Back to opponents" tone="gray" onClick={handleExit} />
              </div>
              <button
                onClick={() => setShowStuckNudge(false)}
                className="mt-1 text-sm font-bold underline"
                style={{ color: "var(--ck-text-light)" }}
              >
                {t("keep_playing")}
              </button>
            </div>
          )}

          {/* Win: confetti over the final position while the kid admires it */}
          {gameResult === "win" && !showResultOverlay && <Confetti active />}

          {/* Result card on top of the board */}
          {showResultOverlay && gameResult && resultKey && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 rounded-xl animate-slide-in"
              style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(3px)" }}
            >
              {gameResult === "win" && <Confetti active />}

              {gameResult === "win" ? (
                /* The kid won: Piku is the hero, the opponent is a small good sport */
                <div className="relative">
                  <Piku expression="standing-celebrating" size={UI.opponent.hero} />
                  <Image
                    src={opponentSad}
                    alt={t(opponent.nameKey)}
                    width={UI.opponent.small}
                    height={UI.opponent.small}
                    className="object-contain absolute -left-14 bottom-0 drop-shadow-md"
                    style={{ width: UI.opponent.small, height: UI.opponent.small, opacity: 0.9 }}
                  />
                </div>
              ) : (
                /* Loss or draw: the opponent takes the stage, Piku consoles below the board */
                <Image
                  src={gameResult === "loss" ? opponentProud : opponent.image}
                  alt={t(opponent.nameKey)}
                  width={UI.opponent.hero}
                  height={UI.opponent.hero}
                  className="object-contain drop-shadow-lg"
                  style={{ width: UI.opponent.hero, height: UI.opponent.hero }}
                />
              )}

              <SpeechBubble text={t(resultKey)} visible pointer={gameResult === "win" ? "left" : "bottom"} />

              <div className="flex gap-4 mt-1">
                <ActionButton icon="/icons/icon-retry.webp" label={t("rematch")} tone="purple" bounce onClick={handleRematch} />
                <ActionButton icon="/icons/icon-back.webp" label="Back to opponents" tone="gray" onClick={handleExit} />
              </div>
            </div>
          )}
        </div>

        {/* Piku coach below the board */}
        <div className="flex items-end gap-2 w-full max-w-[400px]">
          <div className="drop-shadow-md">
            <Piku expression={pikuExpression} size={UI.piku.talk} />
          </div>
          <div className="pb-3 min-w-0">
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
