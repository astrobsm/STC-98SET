export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <img src="/logo.png" alt="STOBA 98" className="w-20 h-20 mx-auto mb-4 animate-pulse rounded-full" />
        <div className="w-8 h-8 border-4 border-stoba-green border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-stoba-green font-medium">Loading...</p>
      </div>
    </div>
  );
}
