import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error);
    console.error("Component stack:", errorInfo.componentStack);
}

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="card max-w-md w-full p-8 text-center space-y-6 border-rose-500/20 bg-rose-500/5">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
                            <AlertTriangle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
                            <p className="text-slate-400">An unexpected error occurred. Please try refreshing the page.</p>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCcw size={18} /> Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
