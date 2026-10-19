export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sauti-50 via-white to-orange-50 p-4">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-3xl animate-pulse">🔊</span>
          <span className="text-2xl font-bold text-gray-900">Sauti</span>
        </div>
        <div className="text-gray-500 text-sm">Loading...</div>
        <div className="mt-4 w-48 h-1 bg-sauti-100 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-sauti-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
