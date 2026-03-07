export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="relative">
          <img 
            src="/PayMama.png" 
            alt="PayMama" 
            className="w-56 h-56 lg:w-64 lg:h-64 object-contain animate-pulse"
          />
        </div>
        
        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Loading your finances...</p>
        </div>
      </div>
    </div>
  );
}

