"use client"

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-sm">
          <div className="w-16 h-16 bg-red-50 flex items-center justify-center rounded-full mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-primary uppercase tracking-tighter mb-2">Systems Failure Detected</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8 text-center max-w-md">
            The administrative interface encountered an unexpected interruption in the telemetry stream.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-xl flex items-center gap-3"
          >
            <RefreshCw className="w-4 h-4" /> Restart Console
          </button>
          {this.state.error && (
            <pre className="mt-12 p-4 bg-muted/20 border border-border text-[10px] text-muted-foreground overflow-auto max-w-full font-mono">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
