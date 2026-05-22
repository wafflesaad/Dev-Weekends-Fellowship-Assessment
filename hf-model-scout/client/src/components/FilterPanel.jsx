const FilterPanel = ({
  task,
  sort,
  library,
  limit,
  taskOptions,
  sortOptions,
  libraryOptions,
  limitOptions,
  activeCount,
  isCollapsed,
  onToggleCollapse,
  onChange
}) => {
  const renderPills = (options, selected, onSelect, variant) => {
    return options.map((option) => {
      const isActive = selected === option.value || selected === option;
      const baseClass =
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors";
      const activeClass = variant === "primary"
        ? "border-indigo-500 bg-indigo-500 text-white"
        : "border-indigo-500 bg-indigo-500/20 text-indigo-200";
      const inactiveClass = "border-gray-700 text-gray-300 hover:border-gray-500";
      return (
        <button
          key={option.value || option}
          type="button"
          onClick={() => onSelect(option.value ?? option)}
          className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
        >
          {option.label || option}
        </button>
      );
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-full border border-gray-800 px-3 py-1 text-sm text-gray-300"
        >
          Filters ({activeCount})
        </button>
      </div>

      <div className={`${isCollapsed ? "hidden" : "flex"} flex-col gap-3 lg:flex`}> 
        <div className="flex gap-2 overflow-x-auto pb-1">
          {renderPills(taskOptions, task, (value) => onChange({ task: value }), "primary")}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {renderPills(sortOptions, sort, (value) => onChange({ sort: value }), "secondary")}
          {renderPills(libraryOptions, library, (value) => onChange({ library: value }), "secondary")}
          {renderPills(limitOptions, limit, (value) => onChange({ limit: value }), "secondary")}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
