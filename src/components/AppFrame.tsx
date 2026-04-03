import RouteWarmup from './RouteWarmup';
import SiteFooter from './SiteFooter';

export default function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-glow"></div>
      <div className="bg-glow-right"></div>
      <RouteWarmup />
      {children}
      <SiteFooter />
    </>
  );
}
