import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback: React.ReactNode
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Generic error boundary for isolating risky child renders (e.g. third-party
 * libraries like QR code generation that can throw synchronously on
 * unexpected input) so a failure there doesn't crash the entire screen/app.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[Vela] ErrorBoundary caught:', error)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}