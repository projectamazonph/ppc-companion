"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Warning as AlertTriangle, ArrowsCounterClockwise as RotateCcw } from "@phosphor-icons/react";
import styles from "./error-boundary.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className={styles.root}>
            <div className={styles.iconBox}>
              <AlertTriangle className={styles.icon} />
            </div>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <Button onClick={this.handleReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
