import { useEffect, useMemo, useState } from "react";
import { fetchModels } from "./api.js";
import SearchBar from "./components/SearchBar.jsx";
import FilterPanel from "./components/FilterPanel.jsx";
import ModelCard from "./components/ModelCard.jsx";
import ComparisonPanel from "./components/ComparisonPanel.jsx";
import ComparisonDrawer from "./components/ComparisonDrawer.jsx";
import LoadingGrid from "./components/LoadingGrid.jsx";
import ErrorState from "./components/ErrorState.jsx";

const taskOptions = [
  { label: "Text Generation", value: "text-generation" },
  { label: "Text to Image", value: "text-to-image" },
  { label: "Image to Image", value: "image-to-image" },
  { label: "ASR", value: "automatic-speech-recognition" },
  { label: "Embeddings", value: "text-embedding" },
  { label: "Summarization", value: "summarization" }
];

const sortOptions = [
  { label: "Downloads", value: "downloads" },
  { label: "Likes", value: "likes" },
  { label: "Recently Updated", value: "lastModified" }
];

const libraryOptions = [
  { label: "Transformers", value: "transformers" },
  { label: "Diffusers", value: "diffusers" },
  { label: "Sentence Transformers", value: "sentence-transformers" },
  { label: "Timm", value: "timm" },
  { label: "PEFT", value: "peft" }
];

const limitOptions = [20, 40, 60];

const maxPins = 4;

const App = () => {
  const [results, setResults] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const [task, setTask] = useState("");
  const [sort, setSort] = useState("downloads");
  const [library, setLibrary] = useState("");
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (!task) {
      setStatus("idle");
      setResults([]);
      return;
    }

    const runSearch = async () => {
      setStatus("loading");
      setError(null);
      setResults([]);

      const params = {
        task,
        sort,
        library: library || undefined,
        search: debouncedSearch || undefined,
        limit
      };

      const { data, error: apiError } = await fetchModels(params);

      if (apiError) {
        if (apiError.code === "NOT_FOUND") {
          setStatus("empty");
          setResults([]);
        } else if (apiError.code === "TIMEOUT") {
          setStatus("timeout");
          setError(apiError);
        } else {
          setStatus("error");
          setError(apiError);
        }
        return;
      }

      if (!Array.isArray(data) || data.length === 0) {
        setStatus("empty");
        setResults([]);
        return;
      }

      setResults(data);
      setStatus("success");
    };

    runSearch();
  }, [task, sort, library, limit, debouncedSearch, retryTick]);

  useEffect(() => {
    if (pinned.length === 0) {
      setDrawerOpen(false);
    }
  }, [pinned.length]);

  const gridColumns = pinned.length <= 1 ? 3 : 2;
  const gridClass = gridColumns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  const compareWidthClass = useMemo(() => {
    if (pinned.length === 1) return "w-72";
    if (pinned.length === 2) return "w-[34rem]";
    if (pinned.length === 3) return "w-[42rem]";
    if (pinned.length >= 4) return "w-[60vw] max-w-4xl";
    return "w-0";
  }, [pinned.length]);

  const pinnedIds = useMemo(() => pinned.map((item) => item.modelId), [pinned]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (task) count += 1;
    if (sort) count += 1;
    if (library) count += 1;
    if (limit) count += 1;
    return count;
  }, [task, sort, library, limit]);

  const handlePin = (model) => {
    setPinned((prev) => {
      if (prev.find((item) => item.modelId === model.modelId)) return prev;
      if (prev.length >= maxPins) return prev;
      return [...prev, model];
    });
  };

  const handleUnpin = (modelId) => {
    setPinned((prev) => prev.filter((item) => item.modelId !== modelId));
  };

  const handleClearPins = () => {
    setPinned([]);
  };

  const handleRetry = () => {
    if (!task) return;
    setRetryTick((prev) => prev + 1);
  };

  const modelsForGrid = results.map((model) => {
    const modelId = model.modelId || model.id || "";
    return {
      ...model,
      modelId
    };
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="h-14 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
        <div className="flex h-full w-full items-center justify-between px-4">
          <div className="text-lg font-semibold tracking-tight">HF Model Scout</div>
          <div className="flex items-center gap-2 rounded-full border border-gray-800 px-3 py-1 text-sm text-gray-300">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            {pinned.length} pinned
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)] w-full flex-col gap-4 px-4 py-4 lg:flex-row">
        <section className="flex min-h-0 flex-1 flex-col gap-4">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onClear={() => setSearchInput("")}
            isLoading={status === "loading"}
          />

          <FilterPanel
            task={task}
            sort={sort}
            library={library}
            limit={limit}
            taskOptions={taskOptions}
            sortOptions={sortOptions}
            libraryOptions={libraryOptions}
            limitOptions={limitOptions}
            activeCount={activeFilterCount}
            isCollapsed={!filtersOpen}
            onToggleCollapse={() => setFiltersOpen((prev) => !prev)}
            onChange={(next) => {
              if (next.task !== undefined) setTask(next.task);
              if (next.sort !== undefined) setSort(next.sort);
              if (next.library !== undefined) setLibrary(next.library);
              if (next.limit !== undefined) setLimit(next.limit);
            }}
          />

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {status === "loading" && (
              <LoadingGrid columns={gridColumns} count={6} />
            )}

            {(status === "idle" || status === "empty" || status === "error" || status === "timeout") && (
              <ErrorState status={status} error={error} onRetry={handleRetry} />
            )}

            {status === "success" && (
              <div className={`grid grid-cols-1 gap-4 ${gridClass}`}>
                {modelsForGrid.map((model) => (
                  <ModelCard
                    key={model.modelId}
                    model={model}
                    isPinned={pinnedIds.includes(model.modelId)}
                    canPinMore={pinned.length < maxPins}
                    onPin={() => handlePin(model)}
                    onUnpin={() => handleUnpin(model.modelId)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {pinned.length > 0 && (
          <aside className={`hidden min-h-0 flex-col lg:flex ${compareWidthClass} transition-all duration-200`}>
            <ComparisonPanel pinned={pinned} onUnpin={handleUnpin} onClearAll={handleClearPins} />
          </aside>
        )}
      </div>

      <ComparisonDrawer
        pinned={pinned}
        isOpen={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        onUnpin={handleUnpin}
        onClearAll={handleClearPins}
      />
    </div>
  );
};

export default App;
