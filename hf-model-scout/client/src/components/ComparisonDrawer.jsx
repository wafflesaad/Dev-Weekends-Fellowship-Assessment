import { useMemo } from "react";

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

const ComparisonDrawer = ({ pinned, isOpen, onOpen, onClose, onUnpin, onClearAll }) => {
  const downloadMax = Math.max(...pinned.map((item) => item.downloads || 0), 0);
  const likeMax = Math.max(...pinned.map((item) => item.likes || 0), 0);

  const rows = useMemo(
    () => [
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
    ],
    [downloadMax, likeMax]
  );

  if (pinned.length === 0) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        className="fixed bottom-4 left-4 right-4 z-40 rounded-full border border-indigo-500 bg-gray-950/90 px-4 py-2 text-left text-sm text-indigo-200 backdrop-blur"
      >
        Compare: {pinned.map((item) => item.name || item.id || item.modelId).join(", ")}
      </button>

      <div
        className={`fixed inset-0 z-50 bg-gray-950/80 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      ></div>

      <div
        className={`fixed inset-x-0 bottom-0 z-50 h-[85vh] rounded-t-3xl border border-gray-800 bg-gray-950 transition-transform duration-200 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <div className="text-sm font-semibold text-white">Compare</div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <button type="button" onClick={onClearAll} className="hover:text-gray-200">
              Clear all
            </button>
            <button type="button" onClick={onClose} className="hover:text-gray-200">
              Close
            </button>
          </div>
        </div>

        <div className="h-[calc(85vh-3rem)] overflow-y-auto px-4 py-3">
          <div className="space-y-6">
            {pinned.map((item) => (
              <div key={item.modelId} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span className="truncate" title={item.id || item.modelId}>{item.name || item.id || item.modelId}</span>
                  <button type="button" onClick={() => onUnpin(item.modelId)} className="text-gray-400 hover:text-gray-200">
                    Unpin
                  </button>
                </div>
                <div className="mt-3 space-y-3 text-xs">
                  {rows.map((row) => {
                    const highlight = row.highlight && (item[row.highlight] || 0) === row.max && row.max > 0;
                    const value = row.value(item);
                    return (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-gray-400">{row.label}</span>
                        <span className={`${highlight ? "text-indigo-300" : "text-gray-100"}`}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonDrawer;
