"use client";

import { Component, type ReactNode } from "react";
import en from "@/data/locale/en.json";
import fi from "@/data/locale/fi.json";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches React render errors in child components so the whole page
 * doesn't crash. Shows a friendly retry screen instead.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const lang = typeof window !== "undefined" ? localStorage.getItem("mfcm_language") : null;
      const strings = lang === "fi" ? fi : en;

      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center"
          style={{ background: "var(--ck-bg)" }}>
          <span className="text-5xl">😵</span>
          <p className="text-lg font-bold" style={{ color: "var(--ck-text)" }}>
            {strings.error_oops}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-3d btn-3d-purple"
          >
            {strings.error_try_again}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
