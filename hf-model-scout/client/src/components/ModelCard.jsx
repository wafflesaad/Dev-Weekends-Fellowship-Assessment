const formatMetric = (value) => {
  if (typeof value !== "number") return "-";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
};

const formatRelativeTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = date.getTime() - Date.now();
  const units = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000]
  ];

  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms) {
      const value = Math.round(diffMs / ms);
      return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(value, unit);
    }
  }

  return "just now";
};

const formatParamCount = (value) => {
  if (typeof value !== "number") return null;
  const billions = (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
  return `${billions}B params`;
};

const specialTagStyle = (tag) => {
  const normalized = tag.toLowerCase();
  if (normalized === "gguf") return "bg-amber-500/20 text-amber-200";
  if (normalized === "quantized") return "bg-purple-500/20 text-purple-200";
  if (normalized === "lora") return "bg-pink-500/20 text-pink-200";
  if (normalized === "awq") return "bg-blue-500/20 text-blue-200";
  if (normalized === "gptq") return "bg-orange-500/20 text-orange-200";
  return "bg-gray-800 text-gray-300";
};

const ModelCard = ({ model, isPinned, canPinMore, onPin, onUnpin }) => {
  const modelId = model.id || model.modelId || "";
  const author = model.author || modelId.split("/")[0] || "unknown";
  const displayName = model.name || modelId.split("/")[1] || modelId;
  const languages = Array.isArray(model.language)
    ? model.language
    : model.language
      ? [model.language]
      : [];
  const visibleLanguages = languages.slice(0, 3);
  const extraLanguageCount = Math.max(languages.length - visibleLanguages.length, 0);
  const paramCountLabel = formatParamCount(model.paramCount);
  const licenseLabel = model.license && model.license !== "unknown" ? model.license : null;

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
          <div className="text-[11px] text-gray-500" title={modelId}>{modelId}</div>
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
        {model.library && (
          <span className="rounded-full bg-blue-500/20 px-2 py-1 text-blue-200">
            {model.library}
          </span>
        )}
        {model.task && (
          <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-indigo-200">
            {model.task}
          </span>
        )}
        {licenseLabel && (
          <span className="rounded-full bg-green-500/20 px-2 py-1 text-green-200">
            {licenseLabel}
          </span>
        )}
        {model.trendingScore > 50 && (
          <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-1 text-orange-200">
            <span aria-hidden="true">🔥</span>
            Trending
          </span>
        )}
        {model.gated && (
          <span className="flex items-center gap-1 rounded-full bg-gray-800 px-2 py-1 text-gray-200">
            <span aria-hidden="true">🔒</span>
            Gated
          </span>
        )}
        <span className="text-gray-400">Updated {formatRelativeTime(model.lastModified)}</span>
      </div>

      {paramCountLabel && (
        <div className="mt-2 text-xs text-gray-300">{paramCountLabel}</div>
      )}
      {model.baseModel && (
        <div className="mt-1 text-xs text-gray-400">Fine-tune of {model.baseModel}</div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {model.specialTags?.map((tag) => (
          <span key={tag} className={`rounded-full px-2 py-1 text-[11px] ${specialTagStyle(tag)}`}>
            {tag}
          </span>
        ))}
        {visibleLanguages.map((lang) => (
          <span key={lang} className="rounded-full bg-gray-800 px-2 py-1 text-[11px] text-gray-200">
            {lang}
          </span>
        ))}
        {extraLanguageCount > 0 && (
          <span className="rounded-full bg-gray-800 px-2 py-1 text-[11px] text-gray-200">
            +{extraLanguageCount} more
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <a
          href={model.url || `https://huggingface.co/${modelId}`}
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
