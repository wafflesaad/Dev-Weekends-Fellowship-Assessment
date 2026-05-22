const formatMetric = (value) => {
  if (typeof value !== "number") return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const formatParamCount = (value) => {
  if (typeof value !== "number") return "—";
  const billions = (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
  return `${billions}B`;
};

const formatText = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return value;
};

const formatList = (value) => {
  if (!Array.isArray(value) || value.length === 0) return "—";
  return value.join(", ");
};

const formatLicense = (value) => {
  if (!value || value === "unknown") return "—";
  return value;
};

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const ComparisonPanel = ({ pinned, onUnpin, onClearAll }) => {
  const downloadMax = Math.max(...pinned.map((item) => item.downloads || 0), 0);
  const likeMax = Math.max(...pinned.map((item) => item.likes || 0), 0);

  const columnsPerRow = pinned.length >= 4 ? 2 : Math.max(pinned.length, 1);
  const pinnedRows = [];
  for (let i = 0; i < pinned.length; i += columnsPerRow) {
    pinnedRows.push(pinned.slice(i, i + columnsPerRow));
  }

  const rows = [
    { label: "Downloads", value: (item) => formatMetric(item.downloads), highlight: "downloads", max: downloadMax },
    { label: "Likes", value: (item) => formatMetric(item.likes), highlight: "likes", max: likeMax },
    { label: "Library", value: (item) => formatText(item.library) },
    { label: "License", value: (item) => formatLicense(item.license) },
    { label: "Architecture", value: (item) => formatText(item.architecture) },
    { label: "Model Type", value: (item) => formatText(item.modelType) },
    { label: "Param Count", value: (item) => formatParamCount(item.paramCount) },
    { label: "Base Model", value: (item) => formatText(item.baseModel) },
    { label: "Datasets", value: (item) => formatList(item.datasets) },
    { label: "Languages", value: (item) => formatList(toArray(item.language)) },
    { label: "Trending Score", value: (item) => formatText(item.trendingScore) },
    { label: "Last Updated", value: (item) => formatDate(item.lastModified) },
    {
      label: "Link",
      value: (item) =>
        item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">
            Open
          </a>
        ) : (
          "—"
        )
    }
  ];

  return (
    <div className="sticky top-14 flex max-h-[calc(100vh-3.5rem)] flex-1 flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="text-sm font-semibold text-white">Compare</div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-gray-200"
        >
          Clear all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-6">
          {pinnedRows.map((rowItems, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid grid-cols-[140px_minmax(0,1fr)] gap-3">
              <div className="space-y-4 text-xs text-gray-400">
                <div className="h-5" aria-hidden="true"></div>
                {rows.map((row) => (
                  <div key={row.label}>
                    {row.label}
                  </div>
                ))}
              </div>

              <div>
                <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
                {rowItems.map((item) => (
                  <div key={item.modelId} className="min-w-[180px] space-y-4">
                    <div className="flex items-start justify-between gap-2 text-xs font-semibold text-white">
                      <span className="truncate" title={item.id || item.modelId}>
                        {item.name || item.id || item.modelId}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUnpin(item.modelId)}
                        className="text-gray-400 hover:text-gray-200"
                        aria-label="Unpin"
                      >
                        x
                      </button>
                    </div>

                    {rows.map((row) => {
                      const highlight = row.highlight && (item[row.highlight] || 0) === row.max && row.max > 0;
                      const value = row.value(item);
                      return (
                        <div
                          key={row.label}
                          className={`text-xs ${highlight ? "text-indigo-300" : "text-gray-100"}`}
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                ))}

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPanel;
