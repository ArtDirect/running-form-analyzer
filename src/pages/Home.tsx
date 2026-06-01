import { Link } from "react-router-dom";
import { ArrowRight, Activity, FileVideo, GitCompare } from "lucide-react";

const FEATURES = [
  {
    icon: Activity,
    title: "Real biomechanics",
    body: "Cadence, stride, vertical oscillation, knee angles, foot strike — extracted with MediaPipe pose.",
  },
  {
    icon: FileVideo,
    title: "Annotated playback",
    body: "Skeleton overlay on every frame. Scrub through to see exactly what the model saw.",
  },
  {
    icon: GitCompare,
    title: "Track drift over time",
    body: "Compare clips week-over-week. Catch form changes before they become injuries.",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 pt-6">
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
          See your stride. <span className="text-accent">Fix what's slow.</span>
        </h1>
        <p className="text-muted-fg max-w-xl mx-auto">
          Drop a side-on iPhone clip. Get cadence, stride length, vertical oscillation,
          and a plain-English coaching report in under a minute.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/analyze" className="btn-primary">
            Analyze a clip <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link to="/history" className="btn-ghost">View history</Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <f.icon className="text-accent size-6" />
            <h3 className="font-display text-lg font-semibold mt-3">{f.title}</h3>
            <p className="text-sm text-muted-fg mt-1">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
