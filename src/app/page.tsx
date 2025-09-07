import { Header } from "@/components/dashboard/header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { NewsCard } from "@/components/dashboard/news-card";
import { AssetTrackerCard } from "@/components/dashboard/asset-tracker-card";
import { AlertsCard } from "@/components/dashboard/alerts-card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
          <div className="lg:col-span-2 xl:col-span-3">
            <ChartCard />
          </div>
          <div className="lg:col-span-1 xl:col-span-1">
            <AssetTrackerCard />
          </div>
          <div className="lg:col-span-3 xl:col-span-4">
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
              <NewsCard />
              <AlertsCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
