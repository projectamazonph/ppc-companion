import { LandingPage } from "@/components/sections/landing";

// Root landing route. Once authenticated, the (app) layout's auth guard plus
// the LandingPage's login/guest handlers route the user to /dashboard.
export default function Home() {
  return <LandingPage />;
}