const iconMap = {
  idle: (
    <svg viewBox="0 0 24 24" className="h-10 w-10 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16v16H4z"></path>
      <path d="M8 8h8v8H8z"></path>
    </svg>
  ),
  empty: (
    <svg viewBox="0 0 24 24" className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7"></circle>
      <path d="M20 20l-3.5-3.5"></path>
    </svg>
  ),
  timeout: (
    <svg viewBox="0 0 24 24" className="h-10 w-10 text-amber-300" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8"></circle>
      <path d="M12 8v4l2 2"></path>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" className="h-10 w-10 text-red-300" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 5h16v10H4z"></path>
      <path d="M8 19h8"></path>
    </svg>
  )
};

const ErrorState = ({ status, error, onRetry }) => {
  let title = "";
  let subtitle = "";

  if (status === "idle") {
    title = "Select a task to start exploring";
    subtitle = "Search across 500,000+ public models.";
  } else if (status === "empty") {
    title = "No models found";
    subtitle = "Try a different task or relax your filters.";
  } else if (status === "timeout") {
    title = "HuggingFace is taking too long to respond";
    subtitle = "Try again in a moment.";
  } else if (status === "error") {
    if (error?.code === "HF_DOWN") {
      title = "HuggingFace API is currently down";
      subtitle = "Please retry shortly.";
    } else if (error?.code === "NETWORK_ERROR") {
      title = "Can't reach the server — is it running?";
      subtitle = "Check the backend and your connection.";
    } else {
      title = "Something went wrong";
      subtitle = "Please try again.";
    }
  }

  if (!title) return null;

  const icon = iconMap[status] || iconMap.error;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-gray-800 bg-gray-900/40 px-4 py-12 text-center">
      {icon}
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="text-sm text-gray-400">{subtitle}</div>
      {status !== "idle" && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-indigo-500 px-4 py-2 text-xs text-indigo-200 hover:bg-indigo-500/20"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
