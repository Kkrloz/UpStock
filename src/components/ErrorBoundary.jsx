import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-(--bg-color) text-(--text-primary-color) p-8">
          <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-8 max-w-md w-full text-center flex flex-col gap-4">
            <div className="text-4xl">⚠️</div>
            <h1 className="text-xl font-bold">Algo deu errado</h1>
            <p className="text-sm text-(--text-secondary-color)">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-(--blue-color3) text-white font-bold rounded-xl hover:bg-(--blue-color2) transition-colors cursor-pointer"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
