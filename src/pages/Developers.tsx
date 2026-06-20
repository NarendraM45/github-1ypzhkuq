import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const developers = [
  {
    name: "Narendra Natha Mishra",
    age: 21,
    image: "/devs/narendra-mishra.png",
    profilePosition: "center 28%",
    accent: "from-primary/30 via-accent/20 to-transparent",
    delayClass: "[animation-delay:0.12s]",
    about:
      "Backend-focused developer who enjoys API design, database modeling, and building reliable server-side systems.",
  },
  {
    name: "Krishnakant Yadav",
    age: 20,
    image: "/devs/krishnakant-yadav.png",
    profilePosition: "center 30%",
    accent: "from-accent/25 via-primary/20 to-transparent",
    delayClass: "[animation-delay:0.28s]",
    about:
      "Frontend-focused developer passionate about responsive interfaces, polished interactions, and user-first web experiences.",
  },
] as const;

const Developers = () => {
  const [activeImage, setActiveImage] = useState<null | (typeof developers)[number]>(null);

  useEffect(() => {
    if (!activeImage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeImage]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-[120px] animate-float-1 opacity-80 dark:opacity-50" />
        <div className="absolute top-1/3 -left-32 h-[22rem] w-[22rem] rounded-full bg-accent/20 blur-[100px] animate-float-2 opacity-70 dark:opacity-40" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary-glow/15 blur-[80px] animate-float-3" />
      </div>

      <header className="relative z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-4 py-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-elevated/80 shadow-elevated transition-transform group-hover:-translate-x-0.5">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Back to MockDrop</span>
            <span className="sm:hidden">Home</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10">
        <section className="container pt-14 pb-10 md:pt-20 md:pb-16">
          <div className="max-w-2xl mx-auto text-center space-y-5 animate-slide-up-spring">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-elevated">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              People behind the project
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Meet the developers
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed animate-fade-in [animation-delay:0.08s] opacity-0 [animation-fill-mode:forwards]">
              We are undergraduate engineers at{" "}
              <span className="text-foreground font-medium">
                Symbiosis University of Applied Sciences, Indore
              </span>
              , crafting MockDrop and exploring full-stack product development.
            </p>
          </div>
        </section>

        <section className="container pb-20 md:pb-28">
          <div className="grid gap-8 md:gap-10 md:grid-cols-2 max-w-5xl mx-auto">
            {developers.map((dev) => (
              <article
                key={dev.name}
                className={`group relative rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-elevated overflow-hidden animate-fade-in opacity-0 [animation-fill-mode:forwards] ${dev.delayClass} transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-glow`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${dev.accent} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative p-6 sm:p-8 flex flex-col items-center text-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-40 blur-xl scale-110 group-hover:opacity-60 transition-opacity duration-500" />
                    <button
                      type="button"
                      onClick={() => setActiveImage(dev)}
                      className="relative h-40 w-40 sm:h-44 sm:w-44 rounded-full p-1 bg-gradient-to-br from-primary/50 to-accent/40 shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`View ${dev.name} photo in full screen`}
                    >
                      <img
                        src={dev.image}
                        alt={dev.name}
                        className="h-full w-full rounded-full object-cover ring-4 ring-background transition-transform duration-500 group-hover:scale-[1.02]"
                        style={{ objectPosition: dev.profilePosition }}
                      />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{dev.name}</h2>
                    <p className="text-sm font-medium text-primary">{dev.age} years old</p>
                  </div>

                  <div className="w-full space-y-3 text-left rounded-xl border border-border/80 bg-elevated/50 px-4 py-3.5">
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                      <span>
                        3<sup>rd</sup> year BTech, Computer Science &amp; Information Technology (CSIT)
                      </span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                      <span>Symbiosis University of Applied Sciences, Indore</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{dev.about}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {activeImage && (
        <div
          className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActiveImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeImage.name} full photo preview`}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute top-5 right-5 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition-colors"
          >
            Close
          </button>
          <img
            src={activeImage.image}
            alt={activeImage.name}
            className="max-h-[90vh] max-w-[92vw] rounded-2xl border border-white/15 shadow-2xl object-contain animate-scale-in"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Developers;
