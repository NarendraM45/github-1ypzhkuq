import {
  Rocket,
  ShieldCheck,
  AlertOctagon,
  Timer,
  Globe,
  Database,
} from "lucide-react";

const FEATURES = [
  { icon: Rocket, title: "Zero Setup", desc: "No server, no config files, no env vars. Paste JSON and go." },
  { icon: ShieldCheck, title: "Live Validation", desc: "Invalid JSON is caught before saving — line numbers and all." },
  { icon: AlertOctagon, title: "Custom Status Codes", desc: "Simulate 404s, 500s, 401s — anything you need to test." },
  { icon: Timer, title: "Response Delay", desc: "Add up to 3 seconds of delay to test your loading states." },
  { icon: Globe, title: "CORS Ready", desc: "Allow-any-origin headers built in. Works from any frontend." },
  { icon: Database, title: "Persistent URLs", desc: "Endpoints survive page reloads. Share them with your team." },
];

export const Features = () => {
  return (
    <section id="features" className="relative py-20 md:py-28 bg-gradient-subtle">
      <div className="container">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-primary-glow font-semibold">Features</p>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
            Everything you need. Nothing you don't.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-lg card-border bg-surface p-6 hover:bg-elevated hover:border-primary/30 transition-all hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary-glow group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
