"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    // 生产环境上报 Sentry 等
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", this.props.section ?? "unknown", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="border border-dashed border-[var(--destructive)] rounded-md p-6 text-center bg-[var(--secondary)]/30">
          <p className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--destructive)] mb-2">
            这块区域加载失败
          </p>
          <p className="text-[14px] text-[var(--ink-dim)] max-w-[360px] mx-auto mb-4">
            {this.props.section ? `${this.props.section} · ` : ""}
            {this.state.error?.message ?? "未知错误"}
          </p>
          <Button
            variant="outline"
            size="md"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            重试
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
