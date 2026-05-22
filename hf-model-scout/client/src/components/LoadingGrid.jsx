const LoadingGrid = ({ columns, count }) => {
  const gridClass = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 gap-4 ${gridClass}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-24 rounded bg-gray-800"></div>
            <div className="h-5 w-40 rounded bg-gray-800"></div>
            <div className="flex gap-3">
              <div className="h-3 w-16 rounded bg-gray-800"></div>
              <div className="h-3 w-16 rounded bg-gray-800"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-20 rounded-full bg-gray-800"></div>
              <div className="h-5 w-20 rounded-full bg-gray-800"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-gray-800"></div>
              <div className="h-5 w-16 rounded-full bg-gray-800"></div>
              <div className="h-5 w-16 rounded-full bg-gray-800"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-gray-800"></div>
              <div className="h-6 w-16 rounded-full bg-gray-800"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingGrid;
