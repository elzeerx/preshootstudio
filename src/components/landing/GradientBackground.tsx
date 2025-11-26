export const GradientBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float opacity-40" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float opacity-30" style={{ animationDelay: "4s" }} />
      
      {/* Floating shapes */}
      <div className="absolute top-20 right-20 w-32 h-32 border border-primary/10 rounded-lg rotate-12 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-40 left-10 w-24 h-24 border border-accent/10 rounded-full animate-float" style={{ animationDelay: "3s" }} />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    </div>
  );
};
