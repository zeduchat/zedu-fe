import Image from "next/image";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "../ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.resetError = this.resetError.bind(this);
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  resetError() {
    this.setState({ hasError: false });
    // window.location.href = "/client";
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          {/* <h2>Something went wrong.</h2> */}
          <div className="max-w-full h-screen flex flex-col items-center justify-center gap-5">
            <Image
              src="/images/error-img.svg"
              height="100"
              width="400"
              alt="error image"
              className="w-60 h-40"
            />
            <p className="text-xl font-semibold leading-6 text-slate-600">
              Ooops!! Something went wrong
            </p>
            <p className="text-neutral-700 text-center leading-6">
              We cannot load this page at the moment
            </p>
            <Button
              onClick={this.resetError}
              className="bg-gradient-to-b from-[#8760f8] to-[#7141f8] py-2 px-6 text-white"
            >
              Go Back to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
