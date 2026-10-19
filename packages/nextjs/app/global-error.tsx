"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sauti global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-sauti-50 via-white to-orange-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-sauti-100 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application error</h2>
          <p className="text-gray-500 text-sm mb-6">
            {error.message || "A critical error occurred."}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="w-full bg-sauti-500 hover:bg-sauti-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
