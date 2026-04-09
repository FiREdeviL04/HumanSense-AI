import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown UI error" };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="glass-card p-6 max-w-lg text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-300">Application Error</p>
            <h2 className="text-2xl font-display font-bold mt-2">Something went wrong</h2>
            <p className="text-slate-300 mt-2">{this.state.message}</p>
            <button onClick={this.handleRetry} className="mt-4 rounded-xl bg-cyan-400 text-slate-950 px-4 py-2 font-bold">
              Retry UI
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
