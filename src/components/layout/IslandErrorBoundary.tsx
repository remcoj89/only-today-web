import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Card } from "@/components/ui";
import "./IslandErrorBoundary.css";

type IslandErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
  message?: string;
  retryLabel?: string;
};

type IslandErrorBoundaryState = {
  hasError: boolean;
};

export class IslandErrorBoundary extends Component<IslandErrorBoundaryProps, IslandErrorBoundaryState> {
  state: IslandErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): IslandErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Island render error", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="island-error-boundary" variant="accent" role="alert">
          <h2>{this.props.title ?? "Er ging iets mis."}</h2>
          <p>{this.props.message ?? "We konden dit onderdeel niet laden. Probeer het opnieuw."}</p>
          <Button variant="secondary" onClick={this.handleRetry}>
            {this.props.retryLabel ?? "Opnieuw proberen"}
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
