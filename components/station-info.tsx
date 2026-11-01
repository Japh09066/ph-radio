import { Clock, Globe, Radio } from "lucide-react";

interface StationInfoProps {
  name: string;
  description: string;
}

const STATS = [
  { icon: Radio, label: "Live", value: "24/7 Broadcast" },
  { icon: Globe, label: "Reach", value: "Worldwide" },
  { icon: Clock, label: "Uptime", value: "Always On" },
];

/**
 * Station identity block: name, description and quick stats.
 */
export function StationInfo({ name, description }: StationInfoProps) {
  return (
    <section aria-label="About the station" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          About {name}
        </h2>
        <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STATS.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {label}
              </dt>
              <dd className="text-sm font-semibold text-foreground">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
