export const Skeleton = () => {
  return (
    <div className="min-h-screen bg-background p-8 animate-pulse">
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-12 w-96 bg-secondary rounded mb-4" />
            <div className="h-4 w-64 bg-secondary rounded" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-16 bg-secondary rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-secondary rounded-lg"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 h-96 bg-secondary rounded-lg" />
        <div className="h-96 bg-secondary rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-96 bg-secondary rounded-lg"
          />
        ))}
      </div>
    </div>
  );
};
