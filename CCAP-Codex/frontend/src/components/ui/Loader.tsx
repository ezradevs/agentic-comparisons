const Loader = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="flex w-full items-center justify-center px-4 py-10">
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <span className="h-3 w-3 animate-ping rounded-full bg-primary-400"></span>
      {label}
    </div>
  </div>
);

export default Loader;
