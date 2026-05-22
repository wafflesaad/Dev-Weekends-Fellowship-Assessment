const SearchBar = ({ value, onChange, onClear, isLoading }) => {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="M20 20l-3.5-3.5"></path>
        </svg>
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search models... e.g. llama, mistral, stable-diffusion"
        className="w-full rounded-xl border border-gray-800 bg-gray-900/70 py-3 pl-10 pr-10 text-sm text-gray-100 outline-none transition-colors focus:border-indigo-500"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-200"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6l12 12"></path>
            <path d="M18 6l-12 12"></path>
          </svg>
        </button>
      )}
      {isLoading && (
        <span className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-500">
          <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3a9 9 0 109 9" />
          </svg>
        </span>
      )}
    </div>
  );
};

export default SearchBar;
