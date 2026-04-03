import SiteFooter from './SiteFooter';

export default function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-glow"></div>
      <div className="bg-glow-right"></div>
      {children}
      <SiteFooter />
    </>
  );
}

