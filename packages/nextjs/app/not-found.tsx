import type { NextPage } from "next";
import { ErrorProps } from "next/error";

const NotFound: NextPage<ErrorProps> = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sauti-50 via-white to-orange-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-sauti-100 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-500 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="inline-block w-full bg-sauti-500 hover:bg-sauti-600 text-white font-semibold py-3 rounded-xl transition"
        >
          Back to Sauti
        </a>
      </div>
    </div>
  );
};

export default NotFound;
