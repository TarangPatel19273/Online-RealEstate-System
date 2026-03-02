import React from "react";

/**
 * Catches React render errors and logs full details.
 * "Script error." usually means the browser hid the real error (e.g. cross-origin).
 * This boundary logs error.message, error.stack, and componentStack for debugging.
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, componentStack: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", {
      message: error?.message,
      stack: error?.stack,
      componentStack: info?.componentStack,
    });
    this.setState({ componentStack: info?.componentStack });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 600 }}>
          <h2 style={{ color: "#b91c1c" }}>Something went wrong</h2>
          <p>
            <strong>Error:</strong> {this.state.error.message || "Unknown error"}
          </p>
          {this.state.error.stack && (
            <pre style={{ fontSize: 12, overflow: "auto", background: "#f5f5f5", padding: 12 }}>
              {this.state.error.stack}
            </pre>
          )}
          {this.state.componentStack && (
            <details>
              <summary>Component stack</summary>
              <pre style={{ fontSize: 11, overflow: "auto" }}>{this.state.componentStack}</pre>
            </details>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null, componentStack: null })}
            style={{ marginTop: 16, padding: "8px 16px" }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
