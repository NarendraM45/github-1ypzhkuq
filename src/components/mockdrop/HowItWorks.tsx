import { Code2, Zap, MousePointerClick } from "lucide-react";

const STEPS = [
  {
    icon: Code2,
    title: "Paste JSON",
    desc: "Drop in any JSON payload — a user object, a product list, an error response. We validate it on the fly.",
  },
  {
    icon: Zap,
    title: "Generate URL",
    desc: "Hit generate and we hand you a unique, always-on URL. Configure status code, delay, and CORS as you like.",
  },
  {
    icon: MousePointerClick,
    title: "Hit the API",
    desc: "Call it from your frontend, Postman, or curl. Your payload is served instantly with the response you defined.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-primary-glow font-semibold">How it works</p>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
            Three steps. Zero friction.
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* connecting line */}
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="relative rounded-lg card-border bg-surface p-6 hover:bg-elevated transition-colors group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground/70">0{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
