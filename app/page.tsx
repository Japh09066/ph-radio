import { Footer } from "@/components/footer";
import { ShareButtons } from "@/components/share-buttons";
import { Hero } from "@/components/hero";
import { NowPlaying } from "@/components/now-playing";
import { RadioPlayer } from "@/components/radio-player";
import { StationInfo } from "@/components/station-info";
import { StationPicker } from "@/components/station-picker";
import { siteUrl, stationConfig } from "@/lib/station";

export default function HomePage() {
  const shareTitle = `${stationConfig.name} — ${stationConfig.tagline}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">
        {/* 1. Hero */}
        <section className="container pt-16 sm:pt-24">
          <Hero name={stationConfig.name} tagline={stationConfig.tagline} />
        </section>

        {/* 3. Live Radio Player + 4. Now Playing */}
        <section className="container mt-12 sm:mt-16">
          <div className="mx-auto max-w-xl space-y-4">
            <RadioPlayer />
            <NowPlaying nowPlayingUrl={stationConfig.nowPlayingUrl} />
          </div>
        </section>

        {/* Station directory (Radio Garden style) */}
        <section className="container mt-16 sm:mt-20">
          <div className="mx-auto max-w-5xl">
            <StationPicker />
          </div>
        </section>

        {/* 2 + 5. Station Information / About */}
        <section className="container mt-20 sm:mt-28">
          <div className="mx-auto max-w-3xl">
            <StationInfo
              name={stationConfig.name}
              description={stationConfig.description}
            />
          </div>
        </section>

        {/* 6. Share */}
        <section className="container mt-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
            <h2 className="text-lg font-semibold text-foreground">
              Share {stationConfig.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Love the stations? Share them with friends and family.
            </p>
            <ShareButtons url={siteUrl} title={shareTitle} className="mt-2" />
          </div>
        </section>

        <div className="h-20 sm:h-28" />
      </main>

      {/* 7. Footer */}
      <Footer
        name={stationConfig.name}
        tagline={stationConfig.tagline}
        shareUrl={siteUrl}
        shareTitle={shareTitle}
      />
    </div>
  );
}
