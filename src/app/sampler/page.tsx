import { SamplerView } from "@/components/sections/sampler-view";

export const metadata = {
  title: "Amazon PPC VA — Free Starter Sampler | Project Amazon PH",
  description:
    "A short, free taste of the work a real Amazon PPC Virtual Assistant does. No login, no Seller Central, no prior PPC knowledge needed. Finish with one credible resume artifact.",
};

// Public lead-funnel route. Intentionally OUTSIDE the (app) auth-guarded group:
// the sampler must be usable with no login, no client account, and no DB.
export const dynamic = "force-static";

export default function SamplerPage() {
  return <SamplerView />;
}
