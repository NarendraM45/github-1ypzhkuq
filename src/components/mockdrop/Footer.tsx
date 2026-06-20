

export const Footer = () => {
  return (
    <footer className="relative mt-12">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <img src="/logo.png" alt="MockDrop Logo" className="h-6 w-6 object-contain" />
          <span><span className="font-semibold text-foreground">MockDrop</span> · Built on LAMP · Free forever</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Report a Bug</a>
        </div>
      </div>
    </footer>
  );
};
