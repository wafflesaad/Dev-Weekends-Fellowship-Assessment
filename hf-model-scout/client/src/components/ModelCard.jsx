const formatMetric = (value) => {
  if (typeof value !== "number") return "-";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const tagStyle = (tag) => {
  const normalized = tag.toLowerCase();
  if (normalized.includes("gguf")) return "bg-amber-500/20 text-amber-200";
  if (normalized.includes("quant")) return "bg-purple-500/20 text-purple-200";
  if (normalized.includes("lora")) return "bg-pink-500/20 text-pink-200";
  return "bg-gray-800 text-gray-300";
};

const ModelCard = ({ model, isPinned, canPinMore, onPin, onUnpin }) => {
  const modelId = model.modelId || model.id || "";
  const author = model.author || modelId.split("/")[0] || "unknown";
  const displayName = modelId.split("/")[1] || modelId;
  const tags = Array.isArray(model.tags) ? model.tags.slice(0, 6) : [];

  return (
    <div
      className={`rounded-xl border bg-gray-900 p-4 transition ${
        isPinned ? "border-indigo-500 ring-2 ring-indigo-500/50" : "border-gray-800"
      } hover:-translate-y-0.5 hover:border-gray-600`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-gray-400">{author}</div>
          <div className="truncate text-base font-semibold text-white" title={modelId}>
            {displayName}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            {formatMetric(model.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21l-6.5-7.2a4.5 4.5 0 016.5-6.1 4.5 4.5 0 016.5 6.1L12 21z"></path>
            </svg>
            {formatMetric(model.likes)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {model.library_name && (
          <span className="rounded-full bg-blue-500/20 px-2 py-1 text-blue-200">
            {model.library_name}
          </span>
        )}
        {model.license && (
          <span className="rounded-full bg-green-500/20 px-2 py-1 text-green-200">
            {model.license}
          </span>
        )}
        <span className="text-gray-400">Updated {formatDate(model.lastModified)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className={`rounded-full px-2 py-1 text-[11px] ${tagStyle(tag)}`}>
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <a
          href={`https://huggingface.co/${modelId}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-indigo-300 hover:text-indigo-200"
        >
          Open on HF
        </a>
        <button
          type="button"
          onClick={isPinned ? onUnpin : onPin}
          disabled={!isPinned && !canPinMore}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            isPinned
              ? "border-indigo-500 bg-indigo-500 text-white"
              : "border-indigo-500 text-indigo-200 hover:bg-indigo-500/20"
          } ${!isPinned && !canPinMore ? "cursor-not-allowed opacity-40" : ""}`}
        >
          {isPinned ? "Unpin" : "Pin"}
        </button>
      </div>
    </div>
  );
};

export default ModelCard;
