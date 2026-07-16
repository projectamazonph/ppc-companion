// Amazon PPC Manager — Companion Course Data
// Structured content extracted from the official student workbook (Version 2026)

export type Phase = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  weeks: string;
  duration: string;
  color: string; // tailwind gradient classes
  goals: string[];
  modules: Module[];
  checkpoint?: Quiz;
  submissionChecklist?: string[];
};

export type Module = {
  id: string;
  code: string; // e.g. "1.1"
  title: string;
  content: ModuleSection[];
  exercises?: Exercise[];
};

export type ModuleSection = {
  heading: string;
  type: "text" | "list" | "definition" | "table" | "flow";
  body?: string;
  items?: { term?: string; description?: string; subItems?: string[] }[];
  // For tables
  columns?: string[];
  rows?: string[][];
  // For flows
  steps?: { title: string; description: string }[];
};

export type Exercise = {
  id: string; // e.g. "1.1A"
  title: string;
  prompt: string;
  type: "open" | "calculation" | "choice" | "decision";
  inputs?: { label: string; value: string }[]; // given data
  placeholder?: string;
  modelAnswer?: string;
  // For calculation exercises
  questions?: {
    id: string;
    question: string;
    inputs: { label: string; value: string }[];
    answer: string;
    formula: string;
    hint?: string;
  }[];
  // For decision exercises
  decisions?: {
    id: string;
    scenario: string;
    options: { id: string; label: string; correct?: boolean; explanation?: string }[];
  }[];
};

export type Quiz = {
  id: string;
  title: string;
  questions: {
    id: string;
    question: string;
    type: "open" | "numeric" | "mcq";
    modelAnswer?: string;
    acceptableAnswers?: string[];
    explanation?: string;
    options?: { id: string; label: string; correct?: boolean; description?: string }[];
  }[];
};

export type GlossaryTerm = {
  term: string;
  definition: string;
  category: "fundamental" | "ad-type" | "metric" | "strategy";
};

export type Formula = {
  name: string;
  formula: string;
  example: string;
  interpretation: string;
};

// =============================================================
// PROGRAM OVERVIEW
// =============================================================

export const programOverview = {
  title: "Amazon PPC Manager",
  subtitle: "Student Workbook",
  version: "2026",
  duration: "8–12 weeks",
  prerequisites: "None",
  note: "No Seller Central access required",
  learningOutcomes: [
    "Understand how the Amazon marketplace works (even without access to Seller Central).",
    "Explain all major Amazon PPC ad types and when to use each one.",
    "Do keyword research using free tools and manual methods.",
    "Design complete PPC campaign structures for Amazon.",
    "Read performance data (dummy reports) and decide what to optimize.",
    "Create clear weekly/monthly reports for clients or managers.",
    "Communicate PPC results and strategy in simple, business-friendly language.",
  ],
  howItWorks: [
    { label: "Lessons", description: "You read each module and learn the concepts." },
    { label: "Exercises", description: "You apply what you learned using realistic examples." },
    { label: "Checkpoints / Quizzes", description: "You answer questions to test understanding." },
    { label: "Capstone Project", description: "At the end, you build a complete PPC strategy for a product." },
  ],
  whatYouNeed: [
    "Computer with stable internet.",
    "Google account (for Google Docs/Sheets).",
    "Free Helium 10 account (for keyword research).",
    "Around 6–10 hours per week for study and practice.",
  ],
};

// =============================================================
// PHASE 1 - FOUNDATIONS
// =============================================================

const phase1Checkpoint: Quiz = {
  id: "phase1-checkpoint",
  title: "Phase 1 Checkpoint",
  questions: [
    {
      id: "p1q1",
      type: "open",
      question: "Describe the Amazon customer journey in your own words (3–4 sentences).",
      modelAnswer:
        "A customer searches for a product on Amazon by typing or using voice. Amazon returns a results page with a mix of sponsored ads and organic listings. The customer clicks a product, views the detail page, and if the offer is good (price, reviews, Prime, Buy Box) adds to cart and purchases. After receiving the product, they may leave a review that influences future shoppers.",
    },
    {
      id: "p1q2",
      type: "open",
      question: "What happens to Sponsored Products ads if the seller loses the Buy Box?",
      modelAnswer:
        "If the seller loses the Buy Box, their Sponsored Products ads usually will not show (or will not convert well) because Amazon will not promote an offer the customer cannot immediately purchase through the Buy Box.",
    },
    {
      id: "p1q3",
      type: "numeric",
      question: "If ad spend is $800 and ad-attributed sales are $3,200, what is ACoS?",
      modelAnswer: "25%",
      acceptableAnswers: ["25", "25%", "0.25"],
      explanation: "ACoS = Ad Spend ÷ Ad Sales × 100 = 800 ÷ 3200 × 100 = 25%.",
    },
    {
      id: "p1q4",
      type: "open",
      question: "When can a high ACoS be acceptable (for example, during which phase of a product's life)?",
      modelAnswer:
        "A high ACoS (e.g. 30–50%) can be acceptable during the launch phase (first ~30 days) when the goal is data collection, ranking, and keyword discovery rather than immediate profit.",
    },
    {
      id: "p1q5",
      type: "open",
      question: "What is the difference between ACoS and TACoS, and why is TACoS important?",
      modelAnswer:
        "ACoS = Ad Spend ÷ Ad Sales — measures efficiency of ad spend against ad-attributed sales only. TACoS = Ad Spend ÷ Total Revenue (ad + organic) — measures the impact of ads on the entire business. TACoS is important because successful ads grow organic ranking and organic sales, which dilutes ad spend as a share of total revenue. A rising ACoS with a falling TACoS often signals healthy scaling.",
    },
  ],
};

// =============================================================
// PHASE 2 - AMAZON ADS DEEP DIVE
// =============================================================

const phase2Checkpoint: Quiz = {
  id: "phase2-checkpoint",
  title: "Phase 2 Checkpoint",
  questions: [
    {
      id: "p2q1",
      type: "mcq",
      question: "Which ad type requires Brand Registry and appears as a banner at the top of search results?",
      options: [
        { id: "a", label: "Sponsored Products" },
        { id: "b", label: "Sponsored Brands", correct: true },
        { id: "c", label: "Sponsored Display" },
        { id: "d", label: "Sponsored TV" },
      ],
      explanation: "Sponsored Brands (and SB Video) require Brand Registry and appear as banners (and video placements) at the top of search results.",
    },
    {
      id: "p2q2",
      type: "mcq",
      question: "Which match type should you use for proven, profitable 'hero' keywords?",
      options: [
        { id: "a", label: "Auto" },
        { id: "b", label: "Broad" },
        { id: "c", label: "Phrase" },
        { id: "d", label: "Exact", correct: true },
      ],
      explanation: "Exact match gives maximum control over proven, profitable 'hero' keywords.",
    },
    {
      id: "p2q3",
      type: "mcq",
      question: "For untested keywords and new launches, which bid strategy is safest?",
      options: [
        { id: "a", label: "Dynamic – Up and Down" },
        { id: "b", label: "Dynamic – Down Only", correct: true },
        { id: "c", label: "Fixed Bids" },
        { id: "d", label: "Placement Multiplier Only" },
      ],
      explanation: "'Dynamic – Down Only' protects budget on untested keywords because Amazon can only lower bids, not raise them.",
    },
    {
      id: "p2q4",
      type: "open",
      question: "Why are negatives more important in 2026's Broad/Auto strategy?",
      modelAnswer:
        "CPCs are higher in 2026, so wasted spend on irrelevant search terms is more painful. Using Auto and Broad for discovery exposes you to many irrelevant terms; negatives are how you stop that waste while still harvesting the winners.",
    },
    {
      id: "p2q5",
      type: "open",
      question: "Rewrite this bullet in a voice-friendly, natural way: 'PREMIUM STAINLESS STEEL CONSTRUCTION – Durable 18/8 food-grade material, double-wall vacuum insulation.'",
      modelAnswer:
        "This bottle is built to last. It's made of food-grade stainless steel with double-wall insulation, so it keeps your drinks cold for 24 hours and hot for 12 — perfect for daily use, the gym, or a long hike.",
    },
  ],
};

// =============================================================
// PHASE 3 - SIMULATED PRACTICE
// =============================================================

const phase3Checkpoint: Quiz = {
  id: "phase3-checkpoint",
  title: "Phase 3 Checkpoint",
  questions: [
    {
      id: "p3q1",
      type: "mcq",
      question: "A search term has 12 clicks and 0 orders. What is the most likely action?",
      options: [
        { id: "a", label: "Increase bid 20%" },
        { id: "b", label: "Promote to Exact" },
        { id: "c", label: "Add as negative keyword", correct: true },
        { id: "d", label: "Do nothing" },
      ],
      explanation: "10–15+ clicks with 0 orders is a strong negative candidate (over a meaningful period).",
    },
    {
      id: "p3q2",
      type: "mcq",
      question: "A search term has 3+ orders and ACoS at or below target. What should you do?",
      options: [
        { id: "a", label: "Pause the keyword" },
        { id: "b", label: "Promote to Exact (Hero campaign)", correct: true },
        { id: "c", label: "Decrease bid 20%" },
        { id: "d", label: "Add as negative" },
      ],
      explanation: "3+ orders at or below target ACoS = promote to a Phrase/Exact Hero campaign.",
    },
    {
      id: "p3q3",
      type: "mcq",
      question: "Which budget split matches the four-layer structure?",
      options: [
        { id: "a", label: "Discovery 10% / Expansion 10% / Heroes 70% / Defense 10%" },
        { id: "b", label: "Discovery 30% / Expansion 20% / Heroes 40% / Defense 10%", correct: true },
        { id: "c", label: "Discovery 40% / Expansion 30% / Heroes 20% / Defense 10%" },
        { id: "d", label: "Discovery 20% / Expansion 40% / Heroes 30% / Defense 10%" },
      ],
      explanation: "Recommended split: Discovery ~30%, Expansion ~20%, Heroes ~40%, Defense ~10%.",
    },
    {
      id: "p3q4",
      type: "open",
      question: "Name the three free (or free-tier) keyword research tools recommended in Module 3.1.",
      modelAnswer:
        "Helium 10 Magnet (free tier), Amazon Autocomplete (search bar suggestions), and competitor listings (titles, bullets, A+ content).",
    },
    {
      id: "p3q5",
      type: "open",
      question: "Explain the difference between Tier 1, Tier 2, and Tier 3 keywords.",
      modelAnswer:
        "Tier 1 = Hero keywords: high volume, high intent, very relevant (e.g. 'insulated water bottle 32oz'). Tier 2 = Discovery / long-tail: more specific, lower volume, experimental (e.g. 'water bottle for hiking with straw'). Tier 3 = Competitor/ASIN-based: competitor brand names, product names, ASINs (e.g. 'hydroflask alternative').",
    },
    {
      id: "p3q6",
      type: "mcq",
      question: "Which budget split matches the four-layer campaign structure for a mature account?",
      options: [
        { id: "a", label: "Discovery 10% / Expansion 10% / Heroes 70% / Defense 10%" },
        { id: "b", label: "Discovery 20% / Expansion 20% / Heroes 50% / Defense 10%", correct: true },
        { id: "c", label: "Discovery 30% / Expansion 10% / Heroes 50% / Defense 10%" },
        { id: "d", label: "Discovery 40% / Expansion 20% / Heroes 30% / Defense 10%" },
      ],
      explanation: "For a mature account: Discovery ~20%, Expansion ~20%, Heroes ~50%, Defense ~10%. Heroes get the largest share because they're proven profit drivers.",
    },
    {
      id: "p3q7",
      type: "mcq",
      question: "A search term has 6 orders, $180 sales, $57 spend (32% ACoS). Your target ACoS is 30%. What's the right action?",
      options: [
        { id: "a", label: "Promote to Exact and slightly increase bid", correct: true },
        { id: "b", label: "Add as negative keyword immediately" },
        { id: "c", label: "Pause the entire campaign" },
        { id: "d", label: "Leave it — no change needed" },
      ],
      explanation: "6 orders at 32% ACoS (just slightly above target) from a Broad/Auto campaign means the term is proven. Promote to Exact Hero campaign and increase bid ~10-15% — the Exact match will tighten spend and the slightly higher bid captures more volume. Within Exact, the ACoS often improves because wasted broad-matching is eliminated.",
    },
  ],
};

// =============================================================
// PHASE 4 - REPORTING & CAPSTONE
// =============================================================

const phase4Checkpoint: Quiz = {
  id: "phase4-checkpoint",
  title: "Phase 4 Checkpoint",
  questions: [
    {
      id: "p4q1",
      type: "mcq",
      question: "Which is NOT a required section of the weekly report?",
      options: [
        { id: "a", label: "Executive Summary" },
        { id: "b", label: "Wins" },
        { id: "c", label: "Issues" },
        { id: "d", label: "Competitor P&L", correct: true },
      ],
      explanation: "The 5 sections are: Executive Summary, Wins, Issues, Actions Taken, Next Steps & Requests.",
    },
    {
      id: "p4q2",
      type: "mcq",
      question: "A client says 'ACoS is 45%, turn off the ads!' — what's the first thing you should do?",
      options: [
        { id: "a", label: "Immediately pause all campaigns" },
        { id: "b", label: "Acknowledge the concern, then ask about margin & target ACoS", correct: true },
        { id: "c", label: "Argue that 45% is fine" },
        { id: "d", label: "Cut all bids by 50%" },
      ],
      explanation: "Acknowledge the concern, then ask about their margin and target ACoS so you can contextualize whether 45% is actually a problem.",
    },
    {
      id: "p4q3",
      type: "open",
      question: "List the 5 capstone deliverables.",
      modelAnswer:
        "1) Keyword Research File (50–100 keywords in Tier 1/2/3). 2) Campaign Blueprint (Discovery, Expansion, Heroes, Defense). 3) 30-Day Launch Plan (week-by-week). 4) Optimization Report (using dummy data). 5) 5–10 minute presentation.",
    },
    {
      id: "p4q4",
      type: "open",
      question: "Why is TACoS often a better long-term metric than ACoS for a growing product?",
      modelAnswer:
        "TACoS accounts for organic sales too. As ads lift organic ranking, organic sales grow, so ad spend becomes a smaller share of total revenue. A product can have a stable (or even rising) ACoS while TACoS falls — that signals healthy scaling and strong long-term unit economics.",
    },
    {
      id: "p4q5",
      type: "open",
      question:
        "Your client says 'I don't care about ACoS — just make me #1 in search results.' How do you respond? Outline your approach.",
      modelAnswer:
        "First, acknowledge the goal: 'I understand — ranking #1 would drive more sales and brand visibility.' Then set realistic expectations: 'Ranking is determined by the A9 algorithm, which weighs sales velocity, conversion rate, price, and reviews. PPC can drive sales velocity, but we also need a strong listing to convert those clicks. Here's a 90-day plan: (1) Launch a structured campaign with discovery + hero campaigns, (2) Push aggressive bids on top-of-search for the first 30 days to build sales velocity, (3) After 30 days, optimize toward target ACoS while maintaining organic ranking. I won't promise #1 by week 2, but I will show measurable progress toward it.' The key is to say 'yes, let's work toward that' while educating on what's realistic.",
    },
    {
      id: "p4q6",
      type: "mcq",
      question: "Which of the following is NOT one of the 5 required sections in the weekly PPC report structure?",
      options: [
        { id: "a", label: "TACoS breakdown by campaign", correct: true },
        { id: "b", label: "Wins" },
        { id: "c", label: "Issues" },
        { id: "d", label: "Actions Taken" },
      ],
      explanation: "The 5 sections are: Executive Summary, Wins, Issues, Actions Taken, Next Steps & Requests. TACoS breakdown by campaign is a useful metric but is data you'd include within those sections, not a separate required section.",
    },
  ],
};

// =============================================================
// TRIAL GATE — only these modules are accessible without enrollment
// =============================================================

export const TRIAL_MODULE_IDS = ["m1-1", "m1-2"] as const satisfies readonly string[];

// =============================================================
// ALL PHASES
// =============================================================

export const phases: Phase[] = [
  {
    id: "phase-1",
    number: 1,
    title: "Foundations",
    subtitle: "How Amazon works + core PPC metrics",
    weeks: "Weeks 1–2",
    duration: "2 weeks",
    color: "bg-amber-500",
    goals: [
      "Explain what happens when a customer shops on Amazon.",
      "Define and calculate core PPC metrics (CTR, CPC, ACoS, ROAS, TACoS, etc.).",
      "Understand key Amazon terms like ASIN, Buy Box, FBA/FBM.",
    ],
    modules: [
      {
        id: "m1-1",
        code: "1.1",
        title: "How Amazon Works",
        content: [
          {
            heading: "The Amazon Marketplace in 60 Seconds",
            type: "text",
            body: "Amazon is both a store and a search engine. When a customer types a query, Amazon's algorithm (called A9) decides which products to show based on two factors: relevance (does the product match the search?) and performance (does the product sell well?). Sponsored ads let sellers pay to appear higher in those results, but Amazon only shows ads for products that are already relevant — you cannot simply buy your way to the top with a bad listing. This is fundamentally different from Google Ads, where the landing page quality matters less. On Amazon, your listing IS your landing page.",
          },
          {
            heading: "Customer Journey (Step by Step)",
            type: "flow",
            steps: [
              { title: "Search", description: "Customer searches for a product (typing or using voice/Alexa)." },
              { title: "Results Page", description: "Amazon shows a results page — a mix of ads and organic listings." },
              { title: "Product Page", description: "Customer clicks a product → goes to the product detail page." },
              { title: "Add to Cart", description: "If they like the offer, they add to cart and purchase." },
              { title: "Review", description: "They may later leave a review that influences future shoppers." },
            ],
          },
          {
            heading: "Where Ads Show",
            type: "list",
            items: [
              { term: "Search results page", subItems: ["Top of search (first positions — most valuable, highest CPC)", "Middle of the page (rotates with organic)", "Bottom of the page (lower CPC, lower CTR)"] },
              { term: "Product pages", subItems: ['"Sponsored products related to this item" — appears on competitor listings', '"Sponsored products related to this category" — category pages'] },
              { term: "Brand stores", subItems: ["Sponsored Brands banner drives traffic to a brand's store page"] },
            ],
          },
          {
            heading: "Important Amazon Concepts",
            type: "definition",
            items: [
              { term: "ASIN", description: "Amazon Standard Identification Number; unique ID for each product. Ads always point to an ASIN." },
              { term: "SKU", description: "Internal stock ID used by the seller; you'll see it in reports but ads still connect to ASINs." },
              { term: "Buy Box", description: 'The main "Add to Cart" / "Buy Now" area on a product page. If your client doesn\'t hold the Buy Box, their Sponsored Products ads usually won\'t show or won\'t convert well.' },
              { term: "FBA (Fulfilled by Amazon)", description: "Amazon stores and ships the product; usually better delivery and higher conversion." },
              { term: "FBM (Fulfilled by Merchant)", description: "Seller ships themselves; can be slower and convert worse." },
              { term: "BSR (Best Sellers Rank)", description: "Amazon's hourly ranking of how well a product sells in its category. Lower number = better. Ad sales lift BSR, which lifts organic ranking." },
              { term: "A9 Algorithm", description: "Amazon's search ranking algorithm. Weighs sales velocity, relevance, price, and availability. Ads influence A9 by driving sales velocity." },
              { term: "Brand Registry", description: "Amazon's program for trademark owners. Required for Sponsored Brands, SB Video, and A+ Content. Gives access to enhanced brand protection." },
            ],
          },
          {
            heading: "FBA vs FBM Comparison",
            type: "table",
            columns: ["Factor", "FBA (Fulfilled by Amazon)", "FBM (Fulfilled by Merchant)"],
            rows: [
              ["Storage", "Amazon warehouses", "Seller's own warehouse/home"],
              ["Shipping speed", "1-2 day Prime", "3-7 days typical"],
              ["Prime badge", "Yes", "No (unless Seller Fulfilled Prime)"],
              ["Conversion rate impact", "Higher (Prime trust)", "Lower (slower shipping)"],
              ["Cost structure", "Fulfillment fee + storage fee", "Shipping cost + packaging"],
              ["Buy Box advantage", "Strong", "Weaker (unless price is much lower)"],
              ["PPC recommendation", "Best for scaling", "OK for testing or bulky items"],
              ["Returns handling", "Amazon handles", "Seller handles"],
            ],
          },
          {
            heading: "Buy Box Factors (What Wins the Buy Box)",
            type: "table",
            columns: ["Factor", "Weight", "How to Win"],
            rows: [
              ["Price (landed)", "Highest", "Lowest price + shipping wins most often"],
              ["Shipping speed", "High", "Prime or 1-2 day shipping"],
              ["Seller rating", "High", "Maintain 90%+ positive feedback"],
              ["Order defect rate", "High", "Keep under 1% (cancellations, returns, negative feedback)"],
              ["Inventory depth", "Medium", "Don't run out of stock"],
              ["Fulfillment method", "Medium", "FBA gives a natural edge over FBM"],
              ["Return rate", "Medium", "Keep return rate low relative to category"],
            ],
          },
          {
            heading: "Common Pitfalls for New PPC Managers",
            type: "list",
            items: [
              { term: "Ignoring the Buy Box", description: "If your client loses the Buy Box, pause campaigns immediately — you're burning spend on ads that can't convert." },
              { term: "Confusing SKU and ASIN", description: "Reports show SKUs, but ad campaigns target ASINs. Always map your SKUs to ASINs in a reference sheet." },
              { term: "Forgetting that ads feed organic", description: "PPC isn't just about ad sales — it lifts BSR, which lifts organic ranking. TACoS captures this; ACoS doesn't." },
              { term: "Treating Amazon like Google", description: "On Amazon, the listing IS the landing page. You can't send traffic to a custom landing page — your listing quality determines conversion." },
            ],
          },
        ],
        exercises: [
          {
            id: "1.1A",
            title: "Identify Ads vs Organic",
            prompt: "Go to Amazon and search for 'water bottle'. Find 3 results marked 'Sponsored' and 3 without that label. Note: (1) What differences do you see in placement and labels? (2) Which ones would you click and why?",
            type: "open",
            placeholder: "Describe your observations about ad placement, labeling, and which listings you'd click on...",
          },
          {
            id: "1.1B",
            title: "Buy Box",
            prompt: "Find a product with multiple sellers (on the same ASIN). (1) Who currently holds the Buy Box? (2) Why do you think they hold it? (Consider price, shipping, rating, Prime badge.)",
            type: "open",
            placeholder: "Name the product, the Buy Box holder, and your reasoning...",
          },
        ],
      },
      {
        id: "m1-2",
        code: "1.2",
        title: "PPC Metrics Fundamentals",
        content: [
          {
            heading: "Why Metrics Matter More in 2026",
            type: "text",
            body: "In 2026, Amazon's CPCs (cost per click) are higher than ever. A keyword that cost $0.80 in 2022 might cost $2.50 today. This means every wasted click hurts more, and every optimization decision has a bigger financial impact. As a PPC manager, your job is to read metrics like a doctor reads vitals — spot the problem early, diagnose the cause, and prescribe a fix. The six metrics below are your stethoscope.",
          },
          {
            heading: "Key Metrics & Formulas",
            type: "definition",
            items: [
              { term: "Impressions", description: "How many times your ad was shown." },
              { term: "Clicks", description: "How many times people clicked your ad." },
              { term: "CTR (Click-Through Rate)", description: "Clicks ÷ Impressions × 100 → Measures how attractive/relevant your ad is." },
              { term: "CPC (Cost Per Click)", description: "Ad Spend ÷ Clicks → How much, on average, each click costs." },
              { term: "Conversion Rate (CVR)", description: "Orders ÷ Clicks × 100 → How good the listing/offer is at turning clicks into orders." },
              { term: "ACoS (Advertising Cost of Sales)", description: "Ad Spend ÷ Ad-Attributed Sales × 100 → Lower is more efficient; but context matters." },
              { term: "ROAS (Return on Ad Spend)", description: "Ad-Attributed Sales ÷ Ad Spend → Higher is better." },
              { term: "TACoS (Total ACoS)", description: "Ad Spend ÷ Total Revenue (ad + organic) × 100 → Shows the impact of ads on the entire business, not just ad sales." },
            ],
          },
          {
            heading: "Metric Formulas Quick Reference",
            type: "table",
            columns: ["Metric", "Formula", "Healthy Range", "What It Tells You"],
            rows: [
              ["CTR", "Clicks ÷ Impressions × 100", "0.25% – 0.50%+", "Ad relevance and appeal"],
              ["CPC", "Spend ÷ Clicks", "$0.50 – $2.50", "Cost efficiency of traffic"],
              ["CVR", "Orders ÷ Clicks × 100", "5% – 15%+", "Listing / offer quality"],
              ["ACoS", "Spend ÷ Ad Sales × 100", "10% – 35% (varies)", "Ad spend efficiency"],
              ["ROAS", "Ad Sales ÷ Spend", "3.0 – 10.0+", "Return per dollar spent"],
              ["TACoS", "Spend ÷ Total Revenue × 100", "5% – 15%", "Ad impact on whole business"],
            ],
          },
          {
            heading: "Sample Metrics Dashboard (Worked Example)",
            type: "table",
            columns: ["Metric", "Value", "Interpretation"],
            rows: [
              ["Impressions", "45,200", "Good visibility — campaign is being shown"],
              ["Clicks", "312", "312 people clicked through to the product page"],
              ["CTR", "0.69%", "Above average — ad is relevant and compelling"],
              ["Spend", "$624.00", "Total ad spend for the period"],
              ["CPC", "$2.00", "Moderate — competitive but not excessive"],
              ["Orders", "28", "28 purchases attributed to these ads"],
              ["CVR", "8.97%", "Healthy — listing converts well"],
              ["Ad Sales", "$2,436.00", "Revenue from ad-attributed orders"],
              ["ACoS", "25.6%", "Within typical target range (25-30%)"],
              ["ROAS", "3.90", "Each $1 of ad spend returned $3.90 in ad sales"],
              ["Total Revenue", "$8,120.00", "Total revenue (ad + organic)"],
              ["TACoS", "7.7%", "Excellent — ads are driving organic growth too"],
            ],
          },
          {
            heading: "How to Read These Metrics (Diagnostic Guide)",
            type: "list",
            items: [
              { term: "Low CTR + many impressions", description: "Your targeting or ad relevance may be poor. The ad is showing but no one clicks — either the keyword is wrong, the main image is bad, or the price is uncompetitive." },
              { term: "High CTR + low conversion", description: "Product page, price, reviews, or offer may be the problem. People click but don't buy — fix the listing (images, bullets, price, reviews) before adjusting bids." },
              { term: "ACoS higher than target", description: "Bids too high, wrong keywords, or weak listing. Diagnose by checking: (1) which keywords have high ACoS, (2) whether CVR is low, (3) whether bids were recently raised." },
              { term: "Campaign not spending", description: "Bids too low, wrong targeting, or low search volume. Check: (1) are bids below the suggested range? (2) is the keyword too niche? (3) is the campaign paused or budget-capped?" },
              { term: "TACoS rising while ACoS is stable", description: "Organic sales are dropping faster than ad sales. This is a yellow flag — your product may be losing organic ranking. Investigate listing quality, stock levels, and competitor activity." },
              { term: "TACoS falling while ACoS is rising", description: "This is actually healthy! It means organic sales are growing faster than ad spend. You're successfully using ads to build organic momentum." },
            ],
          },
          {
            heading: "Worked Example: Diagnosing a Problem Campaign",
            type: "text",
            body: 'Imagine your client says: "My ACoS jumped from 22% to 41% last week — what happened?" You pull the search term report and see: (1) A new competitor launched 5 days ago with aggressive pricing. (2) Your CPC went from $1.40 to $2.10 because the competitor is bidding on your keywords. (3) Your CVR dropped from 9% to 6% because the competitor\'s listing now undercuts your price by $4. Diagnosis: the problem is NOT your ads — it\'s your price. Recommendation: either lower the price to match, or add a coupon, or improve the listing\'s value proposition. Pausing ads would only accelerate the loss of organic ranking. This is why metrics alone aren\'t enough — you need to read them in context.',
          },
        ],
        exercises: [
          {
            id: "1.2A",
            title: "Calculations",
            prompt: "Calculate each metric using the given inputs. Use the in-app calculator or write your answer.",
            type: "calculation",
            questions: [
              {
                id: "1.2A-1",
                question: "Calculate CTR",
                inputs: [
                  { label: "Impressions", value: "10,000" },
                  { label: "Clicks", value: "150" },
                ],
                formula: "Clicks ÷ Impressions × 100",
                answer: "1.5%",
                hint: "150 ÷ 10000 = 0.015, × 100 = 1.5%",
              },
              {
                id: "1.2A-2",
                question: "Calculate CPC",
                inputs: [
                  { label: "Spend", value: "$500" },
                  { label: "Clicks", value: "400" },
                ],
                formula: "Spend ÷ Clicks",
                answer: "$1.25",
                hint: "500 ÷ 400 = 1.25",
              },
              {
                id: "1.2A-3",
                question: "Calculate Conversion Rate",
                inputs: [
                  { label: "Clicks", value: "400" },
                  { label: "Orders", value: "20" },
                ],
                formula: "Orders ÷ Clicks × 100",
                answer: "5%",
                hint: "20 ÷ 400 = 0.05, × 100 = 5%",
              },
              {
                id: "1.2A-4",
                question: "Calculate ACoS and ROAS",
                inputs: [
                  { label: "Spend", value: "$500" },
                  { label: "Ad Sales", value: "$2,000" },
                ],
                formula: "ACoS = Spend ÷ Ad Sales × 100; ROAS = Ad Sales ÷ Spend",
                answer: "ACoS = 25%, ROAS = 4.0",
                hint: "500 ÷ 2000 = 0.25 (25%). 2000 ÷ 500 = 4.0.",
              },
              {
                id: "1.2A-5",
                question: "Calculate TACoS",
                inputs: [
                  { label: "Spend", value: "$500" },
                  { label: "Total Revenue (ad + organic)", value: "$5,000" },
                ],
                formula: "Spend ÷ Total Revenue × 100",
                answer: "10%",
                hint: "500 ÷ 5000 = 0.10, × 100 = 10%",
              },
            ],
          },
        ],
      },
    ],
    checkpoint: phase1Checkpoint,
  },
  {
    id: "phase-2",
    number: 2,
    title: "Amazon Ads Deep Dive",
    subtitle: "Ad types, match types & 2026 strategy",
    weeks: "Weeks 3–4",
    duration: "2 weeks",
    color: "bg-rose-500",
    goals: [
      "Know every main Amazon ad type and where it appears.",
      "Understand Amazon match types and product targeting.",
      "Understand current (2026) strategy basics: AI bidding, higher CPCs, negatives, and voice search.",
    ],
    modules: [
      {
        id: "m2-1",
        code: "2.1",
        title: "Ad Types",
        content: [
          {
            heading: "The Four Amazon Ad Types",
            type: "text",
            body: "Amazon offers four main ad types, each serving a different stage of the customer journey. Think of them as a funnel: Sponsored TV builds awareness at the top, Sponsored Brands captures branded search in the middle, Sponsored Products drives the bulk of sales at the bottom, and Sponsored Display retargets shoppers who didn't convert. As a new PPC manager, you'll spend 80%+ of your time on Sponsored Products — they're the workhorse of Amazon advertising. The other three become important as your brand grows and your budget expands.",
          },
          {
            heading: "Ad Types Comparison",
            type: "table",
            columns: ["Ad Type", "Placement", "Requires Brand Registry?", "Best For", "Typical Budget Share"],
            rows: [
              ["Sponsored Products (SP)", "Search results + product pages", "No", "Direct sales, launches, scaling", "70-80%"],
              ["Sponsored Brands (SB)", "Top of search (banner)", "Yes", "Brand defense, multi-product showcase", "10-15%"],
              ["Sponsored Brands Video", "Top of search (video)", "Yes", "Brand awareness, new product launches", "5-10%"],
              ["Sponsored Display (SD)", "Product pages + retargeting", "No (but helps)", "Retargeting, competitor conquesting", "5-10%"],
              ["Sponsored TV", "Fire TV / Prime Video", "Yes", "Large brands, upper-funnel awareness", "0-5% (most brands skip)"],
            ],
          },
          {
            heading: "1. Sponsored Products (SP) — The Workhorse",
            type: "definition",
            items: [
              { term: "What it is", description: "Single product ads. Show in search results and on product pages. This is where 70-80% of your ad budget goes." },
              { term: "Placement", description: "Top of search, middle of search, bottom of search, and on competitor product pages under 'Sponsored products related to this item'." },
              { term: "Best use", description: "New product launches, ongoing performance/scaling, and keyword harvesting via Auto campaigns. Normally your first choice if budget is limited." },
              { term: "Real-world example", description: "You sell a stainless steel water bottle. A customer searches 'insulated water bottle 32oz'. Your SP ad appears at the top of search. They click, see your listing, and buy. Amazon attributes that sale to your SP campaign." },
            ],
          },
          {
            heading: "2. Sponsored Brands (SB) & SB Video — Brand Defense",
            type: "definition",
            items: [
              { term: "Placement", description: "Banner at the top of search results or video placements. Takes up significant screen real estate." },
              { term: "Format", description: "Can show logo, custom headline (up to 50 chars), and up to 3 products. Requires Brand Registry." },
              { term: "Best use", description: "Protect your branded search terms (someone searching your brand name should see YOUR ad first). Highlight multiple products together. Drive traffic to your brand store." },
              { term: "SB Video specifics", description: "Short video (~15-30s). Product shown immediately (first 1-3s). Simple, clear text and benefit. Great for new product launches where you need to educate the customer." },
              { term: "Real-world example", description: "Someone searches 'AquaPure water bottle' (your brand). Without SB, a competitor's SP ad might appear above your organic listing. With SB, your banner — with your logo and 3 product images — appears at the very top, defending your brand." },
            ],
          },
          {
            heading: "3. Sponsored Display (SD) — Retargeting & Conquesting",
            type: "definition",
            items: [
              { term: "Use cases", description: "Retargeting (people who viewed your product but didn't buy) and conquesting (showing your ad on competitor product pages)." },
              { term: "Best use", description: "Following up with interested shoppers who left without buying. Stealing sales from competitors where your offer is stronger (better price, more reviews, better rating)." },
              { term: "Real-world example", description: "A shopper views your water bottle, leaves, then views a competitor's bottle. Your SD ad appears on the competitor's product page: 'You viewed AquaPure — check it out'. You win the sale back." },
            ],
          },
          {
            heading: "4. Sponsored TV — Awareness at Scale",
            type: "definition",
            items: [
              { term: "What it is", description: "Upper-funnel video ads on Fire TV / Prime Video. Reaches streaming audiences." },
              { term: "Note", description: "Mostly for larger brands with bigger budgets ($10k+/month). You only need to know what it is; you probably won't manage these early on." },
            ],
          },
          {
            heading: "Sponsored Brands Headline Formula",
            type: "table",
            columns: ["Formula", "Example", "Why It Works"],
            rows: [
              ["Benefit + Product + Audience", "Stay Hydrated Longer with Insulated Water Bottles for Hikers", "Clear benefit, specific product, targets a niche"],
              ["Brand + Category + Promise", "AquaPure: Premium Water Bottles That Keep Drinks Cold for 24h", "Brand-building, specific promise, sets expectation"],
              ["Question + Solution", "Tired of Lukewarm Coffee? Try Our Thermal Flasks", "Pain point agitation, clear solution"],
              ["Social Proof + Product", "Rated 4.8★ by 10,000+ Hikers — Stainless Steel Bottles", "Builds trust immediately with numbers"],
            ],
          },
        ],
        exercises: [
          {
            id: "2.1A",
            title: "Headlines",
            prompt: 'For "Organic Coffee Beans", write 3 potential Sponsored Brands headlines using the formulas above. Example: "Fresh Organic Coffee Beans for Real Coffee Lovers".',
            type: "open",
            placeholder: "Headline 1: ...\nHeadline 2: ...\nHeadline 3: ...\n\nNote which formula you used for each.",
          },
        ],
      },
      {
        id: "m2-2",
        code: "2.2",
        title: "Targeting & Match Types",
        content: [
          {
            heading: "Match Types: Your Targeting Control Panel",
            type: "text",
            body: "Match types determine how closely a customer's search must match your keyword for your ad to show. Think of them as a funnel: Auto is the widest (Amazon decides everything), then Broad, then Phrase, then Exact (tightest control). The 2026 strategy is to use the wide end (Auto + Broad) for discovery, then 'harvest' the winning search terms and promote them into the tight end (Phrase + Exact) for maximum control and profitability.",
          },
          {
            heading: "Match Types Comparison",
            type: "table",
            columns: ["Match Type", "Trigger Example (keyword: 'water bottle')", "Control Level", "Best For", "Risk"],
            rows: [
              ["Auto", "Amazon decides based on your listing", "Lowest", "Discovery, finding new terms", "Wasted spend without negatives"],
              ["Broad", "'stainless water bottle for hiking'", "Low", "Exploring variations & synonyms", "Irrelevant matches"],
              ["Phrase", "'insulated water bottle 32oz'", "Medium", "Scaling proven terms with some flexibility", "Some irrelevant long-tails"],
              ["Exact", "'water bottle' (and close variants)", "Highest", "Hero keywords, max profitability", "Limited volume"],
            ],
          },
          {
            heading: "Match Types on Amazon (Detailed)",
            type: "definition",
            items: [
              { term: "Auto", description: "Amazon decides where to show your ads based on your listing content (title, bullets, description). Great for discovery — you'll find search terms you never thought of. Needs negative keywords to control waste. Amazon splits Auto into 4 match types: Close Match, Loose Match, Substitutes, Complements." },
              { term: "Broad", description: "Shows for variations, synonyms, and related searches. If your keyword is 'water bottle', Broad might trigger for 'stainless steel flask for gym'. Good for exploring new keyword ideas. Easy to waste spend without negatives. Word order doesn't matter." },
              { term: "Phrase", description: "Search must include your keyword phrase in the same order, but can have words before or after. 'water bottle' (Phrase) triggers for 'insulated water bottle 32oz' and 'water bottle for hiking' but NOT 'bottle for water'. Good for scaling terms that are working while still catching some variations." },
              { term: "Exact", description: "Only triggers for that exact keyword or very close variations (plurals, minor misspellings). 'water bottle' (Exact) triggers for 'water bottle' and 'water bottles' but NOT 'insulated water bottle'. Best for 'hero' keywords that are proven and profitable. Gives you maximum control over bids and placement." },
            ],
          },
          {
            heading: "Worked Example: How Each Match Type Triggers",
            type: "table",
            columns: ["Keyword: 'water bottle'", "Auto", "Broad", "Phrase", "Exact"],
            rows: [
              ["'water bottle'", "✓", "✓", "✓", "✓"],
              ["'water bottles'", "✓", "✓", "✓", "✓ (close variant)"],
              ["'insulated water bottle'", "✓", "✓", "✓", "✗"],
              ["'water bottle for hiking'", "✓", "✓", "✓", "✗"],
              ["'stainless steel flask'", "✓ (maybe)", "✓ (synonym)", "✗", "✗"],
              ["'bottle for water'", "✓ (maybe)", "✓", "✗ (wrong order)", "✗"],
              ["'free water bottle'", "✓", "✓", "✗", "✗"],
              ["'water filter bottle'", "✓", "✓", "✓", "✗"],
            ],
          },
          {
            heading: "Product / ASIN Targeting",
            type: "definition",
            items: [
              { term: "What it is", description: "Instead of targeting keywords, you target specific competitor ASINs or complementary ASINs. Your ad shows on those product pages." },
              { term: "When to use", description: "(1) Your product has stronger reviews/price than the competitor. (2) You want to cross-sell (e.g. target your water bottle on your own backpack listing). (3) You want to defend your own ASIN from competitors." },
              { term: "How to evaluate", description: "Compare your offer to the competitor's: price, rating, review count, Prime badge, images. Only target if you have a clear advantage on at least 2 of these." },
            ],
          },
          {
            heading: "ASIN Targeting Decision Matrix",
            type: "table",
            columns: ["Your Product", "Competitor", "Target?", "Reasoning"],
            rows: [
              ["$30, 4.5★, 500 reviews", "$25, 4.5★, 500 reviews", "No", "They're cheaper with same quality — you'll lose"],
              ["$30, 4.5★, 500 reviews", "$35, 3.5★, 50 reviews", "Yes — prioritize", "You're cheaper, better rated, more reviews"],
              ["$30, 4.5★, 500 reviews", "$32, 4.0★, 200 reviews", "Yes — secondary", "Slightly cheaper, better rating, more reviews"],
              ["$30, 4.5★, 500 reviews", "$28, 4.8★, 2000 reviews", "No", "They're cheaper, better rated, more reviews"],
              ["$30, 4.5★, 500 reviews", "Your own $25 backpack", "Yes — cross-sell", "Cross-sell complementary product"],
            ],
          },
          {
            heading: "Negative Keywords: Controlling Waste",
            type: "list",
            items: [
              { term: "What they do", description: "Prevent your ad from showing for specific search terms. The single most important tool for controlling wasted spend in Auto and Broad campaigns." },
              { term: "Negative Exact", description: "Blocks only that exact search term. 'free' (negative exact) blocks 'free' but not 'free shipping water bottle'." },
              { term: "Negative Phrase", description: "Blocks any search containing that phrase. 'free' (negative phrase) blocks 'free water bottle', 'water bottle free', 'free shipping water bottle'." },
              { term: "Common negatives to add", description: "'free', 'cheap', 'used', 'broken', 'parts', 'repair', 'how to', 'DIY', 'replacement' — these signal low intent or wrong product type." },
            ],
          },
        ],
        exercises: [
          {
            id: "2.2A",
            title: "Broad Match Risks",
            prompt: 'Keyword: "yoga mat" (Broad match). (1) List 5 irrelevant or low-quality search terms that might show up (e.g. "free yoga mat"). (2) For each, would you add it as a negative? Why?',
            type: "open",
            placeholder: "1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n\nReasoning for each...",
          },
          {
            id: "2.2B",
            title: "ASIN Targeting Choice",
            prompt: "You sell a premium water bottle at $30. Competitor A: $25, 4.5★, 500 reviews. Competitor B: $35, 3.5★, 50 reviews. Competitor C: $32, 4.0★, 200 reviews. Which competitor(s) would you target first with product targeting ads, and why?",
            type: "open",
            placeholder: "I would target Competitor ___ first because ...",
          },
        ],
      },
      {
        id: "m2-3",
        code: "2.3",
        title: "2026 Strategy Principles",
        content: [
          {
            heading: "The 2026 PPC Landscape",
            type: "text",
            body: "Amazon advertising has changed dramatically in recent years. CPCs are higher, AI plays a bigger role in bidding, and the old 'just launch Exact campaigns' approach no longer works. The 2026 strategy is built on three pillars: (1) AI-driven bidding with smart bid strategies, (2) Broad/Auto discovery + aggressive negative keyword management, and (3) Listing quality as a competitive advantage. If your listing is weak, no amount of PPC optimization will save you — your conversion rate determines whether your ad spend is profitable or wasted.",
          },
          {
            heading: "AI-Driven Bidding",
            type: "definition",
            items: [
              { term: "How it works", description: "Amazon uses AI to raise and lower bids in real-time based on conversion probability. It considers factors like shopper history, time of day, device, and placement. You control: default bid, bid strategy, and placement multipliers." },
              { term: "Dynamic – Down Only", description: "Amazon can lower bids for less likely converters. Best for untested keywords, new launches, and budget protection. Your max bid is your default bid — Amazon will never exceed it." },
              { term: "Dynamic – Up and Down", description: "Amazon can raise bids (up to 100%) for high-probability converters and lower them for low-probability. Use once you know which keywords convert well. Risk: can spend 2x your default bid on a single click." },
              { term: "Fixed Bids", description: "No dynamic changes. Your bid stays exactly what you set. Less common now — mostly used for precise budget control or when AI bidding isn't performing well." },
              { term: "Placement Multipliers", description: "Separate from bid strategy. Lets you increase your bid by a percentage for specific placements (top of search, product pages). E.g., +50% for top of search means your $1.00 bid becomes $1.50 for that placement." },
            ],
          },
          {
            heading: "Bid Strategy Comparison",
            type: "table",
            columns: ["Strategy", "AI Can Lower Bids?", "AI Can Raise Bids?", "Max CPC", "Best For"],
            rows: [
              ["Dynamic – Down Only", "Yes", "No", "= your default bid", "New launches, untested keywords, budget protection"],
              ["Dynamic – Up and Down", "Yes", "Yes (up to 2x)", "Up to 2x your default bid", "Proven keywords, scaling phase, maximizing conversions"],
              ["Fixed Bids", "No", "No", "= your default bid", "Precise budget control, unusual situations"],
            ],
          },
          {
            heading: "Sample Bid Adjustment Scenarios",
            type: "table",
            columns: ["Scenario", "Current Bid", "Recommended Action", "New Bid", "Strategy"],
            rows: [
              ["Hero keyword, ACoS well below target", "$1.20", "Increase bid for more volume", "$1.45 (+20%)", "Up and Down"],
              ["Stable keyword, ACoS slightly above target", "$0.90", "Decrease bid to improve efficiency", "$0.75 (-17%)", "Down Only"],
              ["10+ clicks, 0 orders", "$1.50", "Pause or negate immediately", "—", "Down Only"],
              ["New keyword, no data yet", "—", "Start moderate", "$1.00", "Down Only"],
              ["Hero keyword at top of search", "$1.30", "Add placement multiplier", "$1.30 + 50% TOS = $1.95", "Up and Down"],
              ["Long-tail term, 3+ orders, low ACoS", "$0.80", "Promote to Exact + increase bid", "$1.00 (+25%)", "Up and Down"],
            ],
          },
          {
            heading: "Higher CPCs in 2026",
            type: "list",
            items: [
              { term: "Clicks cost more", description: "Average CPCs have risen 40-60% since 2022. A keyword that cost $0.80 in 2022 might cost $1.50-$2.50 in 2026." },
              { term: "Wasted spend is more painful", description: "Every irrelevant click at $2.00+ adds up fast. A campaign wasting 20% of spend on bad search terms could burn $400/month on nothing." },
              { term: "Implication for strategy", description: "Good structure (negatives, match types) + strong listings (images, reviews, price) matter more than ever. You can't out-bid a bad listing." },
            ],
          },
          {
            heading: "Broad/Auto + Negative Strategy (The 2026 Playbook)",
            type: "flow",
            steps: [
              { title: "1. Discover", description: "Start with Auto and Broad campaigns. Let Amazon find search terms you wouldn't have thought of. Budget: ~30% of total." },
              { title: "2. Inspect", description: "Download the search term report every 3-7 days. Look for: (a) terms with 3+ orders and good ACoS → promote. (b) Terms with 10+ clicks and 0 orders → negate." },
              { title: "3. Promote", description: "Move winning search terms into new Phrase and Exact campaigns. Give them higher bids and 'Up and Down' strategy since you know they convert." },
              { title: "4. Negate", description: "Add bad/irrelevant search terms as negatives in the discovery campaigns. This stops the bleed and concentrates spend on what works." },
              { title: "5. Repeat", description: "This is a weekly cycle. As long as you're running ads, you should be harvesting and negating. The campaign structure improves over time." },
            ],
          },
          {
            heading: "Voice Shopping / Alexa",
            type: "list",
            items: [
              { term: "Trend", description: 'More people talk to devices: "Alexa, find a stainless steel water bottle under $30 for hiking." Voice searches are longer, more conversational, and more specific.' },
              { term: "Implication for listings", description: "Listings must sound natural and answer actual questions, not just stuff keywords. Bullets should read like how a person would describe the product out loud." },
              { term: "Implication for PPC", description: "Long-tail keywords become more important. 'water bottle' is a text search; 'stainless steel water bottle under 30 dollars for hiking' is a voice search. Phrase and Broad match catch these better than Exact." },
            ],
          },
          {
            heading: "Phase 2 Required Task: Amazon Ads Academy",
            type: "text",
            body: "Before moving to Phase 3, you must complete the Amazon Ads Academy certifications. This is a free, official Amazon training platform. Create a free account at ads.amazon.com/academy and complete these three modules:\n\n1. 'Sponsored Ads Fundamentals' — covers the basics of all ad types.\n2. Sponsored Products training and certification — deep dive into SP campaigns.\n3. Sponsored Brands basics — understanding SB and SB Video.\n\nSend your certificates or screenshots to your instructor by the end of Week 4. This is a required task — you cannot proceed to Phase 3 without completing it. The certifications reinforce what you've learned in this phase and give you an official Amazon credential to add to your resume.",
          },
        ],
        exercises: [
          {
            id: "2.3A",
            title: "Voice-Friendly Copy",
            prompt: 'Rewrite this bullet in a more natural, customer-friendly way: "PREMIUM STAINLESS STEEL CONSTRUCTION – Durable 18/8 food-grade material, double-wall vacuum insulation." Make it sound like how a person would describe it out loud.',
            type: "open",
            placeholder: "Your natural rewrite...",
          },
        ],
      },
    ],
    checkpoint: phase2Checkpoint,
    submissionChecklist: [
      "Exercise 2.1A (headlines) completed.",
      "Exercise 2.2A and 2.2B (match types / ASIN targeting) completed.",
      "Exercise 2.3A (voice-friendly bullet) completed.",
      "Amazon Ads Academy basic certifications completed:",
      '  • "Sponsored Ads Fundamentals"',
      "  • Sponsored Products training and certification",
      "  • Sponsored Brands basics",
    ],
  },
  {
    id: "phase-3",
    number: 3,
    title: "Simulated Practice",
    subtitle: "Keyword research, campaign structure & optimization",
    weeks: "Weeks 5–8",
    duration: "4 weeks",
    color: "bg-emerald-500",
    goals: [
      "Do full keyword research for a product.",
      "Design a multi-layered campaign structure on paper/Sheets.",
      "Read dummy search term reports and make correct optimization decisions.",
    ],
    modules: [
      {
        id: "m3-1",
        code: "3.1",
        title: "Keyword Research",
        content: [
          {
            heading: "Keyword Research: The Foundation of Everything",
            type: "text",
            body: "Keyword research is the single most important skill in Amazon PPC. If you target the wrong keywords, no amount of bid optimization will save your campaigns. The goal is to build a comprehensive list of every search term a real customer might use to find your product, then organize them by priority. You'll use three free tools and one framework (tiering) to turn hundreds of raw keywords into a structured, actionable plan.",
          },
          {
            heading: "Tools You Can Use (Free or Free Tier)",
            type: "definition",
            items: [
              { term: "Helium 10 Magnet (free tier)", description: "Enter a seed keyword (e.g. 'water bottle'). Get a list of related keywords with estimated monthly search volumes. The free tier gives you a limited number of searches per day — use them wisely." },
              { term: "Amazon Autocomplete", description: "Go to Amazon.com and type a seed term slowly (e.g. 'bamboo cutting b...'). Capture the dropdown suggestions — these are real searches Amazon is suggesting to shoppers. Try different letter endings to find more variations." },
              { term: "Competitor Listings", description: "Open the top 5 competitor listings for your product. Read their titles, bullet points, and A+ content. Extract repeated phrases and important words. These are the keywords your competitors are targeting." },
            ],
          },
          {
            heading: "Step-by-Step Keyword Research Walkthrough",
            type: "flow",
            steps: [
              { title: "1. Start with 5-10 seed keywords", description: "Brainstorm the most obvious terms. For a water bottle: 'water bottle', 'insulated water bottle', 'stainless steel water bottle', 'gym water bottle', 'water bottle 32oz'." },
              { title: "2. Expand with Helium 10 Magnet", description: "Enter each seed keyword. Export all related keywords with search volumes. You'll typically get 200-500 keywords per seed." },
              { title: "3. Expand with Amazon Autocomplete", description: "Type each seed keyword letter-by-letter on Amazon. Capture every suggestion. You'll find long-tail variations like 'water bottle for office desk' or 'water bottle with time marker'." },
              { title: "4. Mine competitor listings", description: "Read the top 5 competitor titles and bullets. Extract phrases they use that you haven't found yet. E.g. 'vacuum insulated', 'BPA free', 'sweat-proof'." },
              { title: "5. Deduplicate and clean", description: "Remove exact duplicates. Group similar keywords (e.g. 'water bottle 32 oz' and '32oz water bottle' are the same intent). You should end up with 100-300 unique keywords." },
              { title: "6. Tier your keywords", description: "Sort into Tier 1 (hero), Tier 2 (discovery/long-tail), and Tier 3 (competitor). See the tiering table below." },
            ],
          },
          {
            heading: "Tiering Keywords",
            type: "definition",
            items: [
              { term: "Tier 1 — Hero keywords", description: "High volume, high intent, very relevant. These go in your Exact campaigns with the highest bids. Example: 'insulated water bottle 32oz'." },
              { term: "Tier 2 — Discovery / Long-tail", description: "More specific, lower volume, experimental. These go in Broad and Phrase campaigns. Example: 'water bottle for office desk' or 'water bottle for hiking with straw'." },
              { term: "Tier 3 — Competitor / ASIN-based", description: "Competitor brand names, product names, ASINs. These go in ASIN targeting campaigns. Example: 'hydroflask alternative', specific competitor ASINs." },
            ],
          },
          {
            heading: "Keyword Tiering with Volume Estimates",
            type: "table",
            columns: ["Tier", "Search Volume", "Intent", "Competition", "Example Keywords (water bottle product)"],
            rows: [
              ["Tier 1 — Hero", "High (5,000+/mo)", "Very high — ready to buy", "High (expensive CPC)", "'insulated water bottle', 'stainless steel water bottle', 'water bottle 32oz'"],
              ["Tier 2 — Long-tail", "Medium (500-5,000/mo)", "High — specific need", "Medium (manageable CPC)", "'water bottle for hiking', 'gym water bottle 32oz', 'water bottle with straw'"],
              ["Tier 3 — Niche", "Low (100-500/mo)", "Very high — exact match", "Low (cheap CPC)", "'water bottle for office desk 32oz', 'insulated water bottle for hot yoga'"],
              ["Tier 4 — Competitor", "Varies", "Mixed — comparison shopping", "Varies", "'hydroflask alternative', 'yeti water bottle dupe', 'B08XXX (competitor ASIN)'"],
              ["Tier 5 — Negative", "N/A", "Wrong intent", "N/A", "'free water bottle', 'water bottle parts', 'how to clean water bottle'"],
            ],
          },
          {
            heading: "Sample Keyword List: Stainless Steel Water Bottle (32oz, $29.99)",
            type: "table",
            columns: ["#", "Keyword", "Tier", "Est. Monthly Volume", "Match Type"],
            rows: [
              ["1", "insulated water bottle", "T1", "12,000", "Exact → Heroes"],
              ["2", "stainless steel water bottle", "T1", "9,500", "Exact → Heroes"],
              ["3", "water bottle 32oz", "T1", "7,200", "Exact → Heroes"],
              ["4", "water bottle", "T1", "85,000", "Broad → Discovery"],
              ["5", "gym water bottle", "T2", "3,100", "Phrase → Expansion"],
              ["6", "water bottle for hiking", "T2", "2,400", "Phrase → Expansion"],
              ["7", "water bottle with straw", "T2", "1,800", "Phrase → Expansion"],
              ["8", "insulated water bottle 32 oz", "T1", "1,500", "Exact → Heroes"],
              ["9", "water bottle for office desk", "T2", "900", "Phrase → Expansion"],
              ["10", "stainless steel flask", "T2", "1,200", "Broad → Discovery"],
              ["11", "vacuum insulated water bottle", "T2", "800", "Phrase → Expansion"],
              ["12", "bpa free water bottle", "T2", "2,700", "Broad → Discovery"],
              ["13", "water bottle for kids", "T3", "4,500", "Broad → Discovery (test)"],
              ["14", "hydroflask alternative", "T3", "600", "ASIN → Defense"],
              ["15", "yeti water bottle dupe", "T3", "400", "ASIN → Defense"],
              ["16", "water bottle for hot yoga", "T3", "200", "Phrase → Expansion"],
              ["17", "sweat proof water bottle", "T2", "350", "Phrase → Expansion"],
              ["18", "water bottle keeps water cold", "T2", "1,100", "Broad → Discovery"],
              ["19", "water bottle for running", "T2", "1,600", "Phrase → Expansion"],
              ["20", "free water bottle", "T5 (NEGATIVE)", "—", "Negative keyword"],
            ],
          },
        ],
        exercises: [
          {
            id: "3.1A",
            title: "Build a Keyword List",
            prompt: "Choose ONE product category: Bamboo cutting board set, Wireless earbuds for running, or Organic dog treats. (1) Use Helium 10 + Amazon autocomplete + competitor listings to find at least 50 keywords. (2) Group them into Tier 1, Tier 2, Tier 3. (3) Add a short note why a keyword is Tier 1 vs Tier 2, etc.",
            type: "open",
            placeholder: "Paste your keyword list here with tier grouping and notes...",
          },
        ],
      },
      {
        id: "m3-2",
        code: "3.2",
        title: "Campaign Structure Design",
        content: [
          {
            heading: "Campaign Structure: Your PPC Architecture",
            type: "text",
            body: "Campaign structure is how you organize your keywords into campaigns. A good structure lets you control budgets precisely, see which keywords are performing, and make optimization decisions quickly. A bad structure mixes everything together, making it impossible to know what's working. The four-layer structure below is the industry standard for Amazon PPC in 2026 — it separates discovery from scaling, and profit from defense.",
          },
          {
            heading: "Four-Layer Structure",
            type: "definition",
            items: [
              { term: "1. Discovery (Auto + Broad)", description: "Goal: find new converting search terms you didn't think of. Budget: ~30% of total. Bid strategy: Dynamic Down Only. Run continuously, harvest winners weekly." },
              { term: "2. Expansion (Phrase)", description: "Goal: scale promising search terms with more control than Broad. Budget: ~20%. Bid strategy: Dynamic Down Only → Up and Down once proven." },
              { term: "3. Heroes (Exact)", description: "Goal: maximize profit on best keywords with tight control. Budget: ~40%. Bid strategy: Dynamic Up and Down. This is where most of your profit comes from." },
              { term: "4. Defense & Conquest (ASIN + SD)", description: "Goal: defend your own listings from competitors, attack competitors' product pages where you have an advantage. Budget: ~10%." },
            ],
          },
          {
            heading: "Sample Campaign Blueprint: Premium Yoga Mat ($45)",
            type: "table",
            columns: ["Campaign Name", "Ad Type", "Match Type", "Daily Budget", "Goal", "Example Keywords/Targets"],
            rows: [
              ["YogaMat – SP – Auto – Discovery", "Sponsored Products", "Auto", "$15", "Find new search terms", "(Amazon decides)"],
              ["YogaMat – SP – Broad – Discovery", "Sponsored Products", "Broad", "$10", "Explore variations", "'yoga mat', 'exercise mat', 'fitness mat'"],
              ["YogaMat – SP – Phrase – Expansion", "Sponsored Products", "Phrase", "$12", "Scale promising terms", "'yoga mat for beginners', 'extra thick yoga mat'"],
              ["YogaMat – SP – Exact – Heroes", "Sponsored Products", "Exact", "$25", "Maximize profit on heroes", "'yoga mat', 'thick yoga mat', 'yoga mat non slip'"],
              ["YogaMat – SP – Exact – Heroes 2", "Sponsored Products", "Exact", "$15", "Secondary heroes", "'exercise mat', 'fitness mat', 'yoga mat with strap'"],
              ["YogaMat – SD – ASIN – Conquest", "Sponsored Display", "ASIN", "$8", "Win competitor shoppers", "3 competitor ASINs with worse ratings"],
              ["YogaMat – SD – Retarget", "Sponsored Display", "Retargeting", "$5", "Reclaim interested shoppers", "(Viewers who didn't buy)"],
            ],
          },
          {
            heading: "Launch vs Scale: Budget Allocation Over Time",
            type: "table",
            columns: ["Layer", "Launch Phase (Days 1-30)", "Scale Phase (Day 30+)", "Why the Shift?"],
            rows: [
              ["Discovery (Auto/Broad)", "35%", "20%", "Less discovery needed — you've found your winners"],
              ["Expansion (Phrase)", "20%", "20%", "Stays similar — always expanding"],
              ["Heroes (Exact)", "25%", "45%", "Shift budget to proven, profitable keywords"],
              ["Defense (ASIN/SD)", "10%", "10%", "Consistent defense spend"],
              ["Buffer/Testing", "10%", "5%", "Less buffer needed as data stabilizes"],
              ["Target ACoS", "30-50%", "15-25%", "Launch tolerates high ACoS; scale demands efficiency"],
              ["Primary Focus", "Data collection + ranking", "Profit + TACoS compression"],
            ],
          },
          {
            heading: "Launch vs Scale",
            type: "definition",
            items: [
              { term: "Launch Phase (Days 1–30)", description: "Higher ACoS acceptable (e.g. 30–50%). More budget in Discovery (35%). Focus on collecting data, finding winning keywords, and building organic ranking via ad sales." },
              { term: "Scale Phase (After ~30 days)", description: "Shift budget toward Heroes (Exact) — up to 45%. Tighten negatives in Discovery. Focus more on stable profit, lowering TACoS, and defending market position." },
            ],
          },
          {
            heading: "Campaign Naming Convention",
            type: "text",
            body: "Use a consistent naming convention so you can identify any campaign at a glance: [Product] – [Ad Type] – [Match Type/Targeting] – [Purpose]. Examples: 'WaterBottle – SP – Auto – Discovery', 'WaterBottle – SP – Exact – Heroes', 'WaterBottle – SD – ASIN – Conquest'. This makes reporting and optimization 10x faster — you always know what a campaign does from its name alone.",
          },
        ],
        exercises: [
          {
            id: "3.2A",
            title: "Design a Structure",
            prompt: "Product: 'Premium Yoga Mat — $45, mid–high competition'. Create a simple table (in a doc or sheet): Columns: Campaign Name, Ad Type, Match Type, Daily Budget, Goal, Example Keywords/Targets. Include at least: 1–2 Discovery campaigns (Auto/Broad), 1–2 Phrase campaigns, 1–2 Exact campaigns, 1 ASIN-targeting or Sponsored Display campaign.",
            type: "open",
            placeholder: "Paste your campaign blueprint here...",
          },
        ],
      },
      {
        id: "m3-3",
        code: "3.3",
        title: "Optimization with Dummy Data",
        content: [
          {
            heading: "Optimization: The Weekly Ritual",
            type: "text",
            body: "Optimization is the ongoing process of reviewing your search term reports and making decisions: which terms to promote, which to negate, which bids to raise or lower. This is where PPC managers earn their keep. A good optimization session takes 30-60 minutes per product, done weekly. The rules below are your decision framework — follow them consistently and your campaigns will improve over time.",
          },
          {
            heading: "What You Practice",
            type: "list",
            items: [
              { term: "Identify negatives", description: "Spot search terms to add as negatives — terms wasting spend with no results." },
              { term: "Promote winners", description: "Spot search terms to promote from Auto/Broad into Exact campaigns for tighter control." },
              { term: "Adjust bids", description: "Recommend bid increases/decreases based on ACoS and conversion data." },
              { term: "Review budgets", description: "Check if campaigns are budget-capped (spending all budget before end of day) — if so, increase budget." },
            ],
          },
          {
            heading: "Key Optimization Rules",
            type: "table",
            columns: ["Situation", "Action", "Why", "How Often"],
            rows: [
              ["10-15+ clicks, 0 orders", "Add as negative keyword", "Wasted spend with no return", "Weekly"],
              ["Obviously irrelevant term", "Add as negative immediately", "Wrong product type or intent", "As soon as spotted"],
              ["3+ orders, ACoS ≤ target", "Promote to Exact campaign", "Proven winner — give it max control", "Weekly"],
              ["ACoS much lower than target", "Increase bid 10-20%", "Profitable — push for more volume", "Weekly"],
              ["ACoS higher than target, 10+ clicks", "Decrease bid 10-20%", "Improve efficiency", "Weekly"],
              ["Campaign budget-capped daily", "Increase daily budget", "Leaving sales on the table", "Bi-weekly"],
              ["Keyword hasn't spent in 7+ days", "Increase bid or check negatives", "Not getting impressions — may be blocked", "Bi-weekly"],
              ["Strong keyword + placement data", "Add placement multiplier", "Push to top of search where it converts best", "Monthly"],
            ],
          },
          {
            heading: "Sample Search Term Report (Expanded)",
            type: "table",
            columns: ["Search Term", "Clicks", "Spend", "Orders", "Sales", "ACoS", "Action"],
            rows: [
              ["insulated water bottle", "45", "$67.50", "8", "$240", "28%", "Promote to Exact +15%"],
              ["cheap water bottle", "32", "$28.80", "0", "$0", "∞", "Negative keyword"],
              ["water bottle 32oz", "28", "$42.00", "5", "$150", "28%", "Promote to Exact +15%"],
              ["glass water bottle", "18", "$27.00", "0", "$0", "∞", "Negative keyword"],
              ["hiking water bottle with filter", "12", "$18.00", "3", "$90", "20%", "Promote to Exact +20%"],
              ["water bottle for kids", "22", "$33.00", "1", "$30", "110%", "Negative keyword"],
              ["stainless steel water bottle", "38", "$57.00", "6", "$180", "32%", "Keep, -10% bid"],
              ["water bottle holder", "8", "$12.00", "0", "$0", "∞", "Negative keyword"],
              ["water bottle for gym", "25", "$37.50", "4", "$120", "31%", "Keep, monitor"],
              ["free water bottle", "15", "$15.00", "0", "$0", "∞", "Negative keyword"],
            ],
          },
          {
            heading: "Optimization Decision Flowchart",
            type: "flow",
            steps: [
              { title: "Start: Review search term", description: "Open the search term report for the last 7 days. Sort by spend descending." },
              { title: "Any orders?", description: "If 0 orders and 10+ clicks → add as negative. If 1-2 orders and ACoS > target → decrease bid 15%. If 3+ orders and ACoS ≤ target → promote to Exact." },
              { title: "If promoting to Exact", description: "Add the search term as an Exact keyword in your Heroes campaign. Set bid 10-20% higher than the current Broad/Auto bid. Add it as a negative in the original campaign to avoid double-serving." },
              { title: "If negating", description: "Add as negative Phrase in the campaign that's showing for it. If it appears across multiple campaigns, add as negative at the account level (negative keyword list)." },
              { title: "If adjusting bid", description: "Raise bid 10-20% if ACoS is well below target and you want more volume. Lower bid 10-20% if ACoS is above target but the keyword still converts. Never change bids by more than 20% at once — too volatile." },
              { title: "Document & repeat", description: "Log your changes in a spreadsheet: date, search term, action, reason. Do this every week. Over 4-8 weeks your campaigns will be dramatically more efficient." },
            ],
          },
        ],
        exercises: [
          {
            id: "3.3A",
            title: "Analyze Search Terms",
            prompt: "For each search term, decide: (1) Keep, Negative, or Promote to Exact. (2) Bid change: +X% or -X% (or no change). (3) One-sentence reason. Use the in-app Search Term Analyzer tool to practice.",
            type: "decision",
            decisions: [
              {
                id: "st-insulated",
                scenario: "insulated water bottle — 45 clicks, $67.50 spend, 8 orders, $240 sales, 28% ACoS (target ~30%)",
                options: [
                  { id: "a", label: "Promote to Exact, +10–20% bid", correct: true, explanation: "8 orders at 28% ACoS (below target) → promote to Exact Hero campaign and push bid up 10–20% to capture more volume." },
                  { id: "b", label: "Add as negative", explanation: "Wrong — this term is profitable, not wasted spend." },
                  { id: "c", label: "Keep as is, no change", explanation: "Missed opportunity — proven winner should be promoted and scaled." },
                  { id: "d", label: "Pause the keyword", explanation: "Wrong — this is exactly the kind of term you want to keep." },
                ],
              },
              {
                id: "st-cheap",
                scenario: "cheap water bottle — 32 clicks, $28.80 spend, 0 orders, $0 sales",
                options: [
                  { id: "a", label: "Promote to Exact", explanation: "Wrong — 0 orders means it's a wasted spend, not a winner." },
                  { id: "b", label: "Add as negative keyword", correct: true, explanation: "32 clicks with 0 orders + 'cheap' implies low-intent shoppers → add as negative." },
                  { id: "c", label: "Increase bid 20%", explanation: "Wrong — would burn more budget on a non-converting term." },
                  { id: "d", label: "Keep as is", explanation: "Wrong — 32 clicks with 0 orders is a clear negative candidate." },
                ],
              },
              {
                id: "st-32oz",
                scenario: "water bottle 32oz — 28 clicks, $42 spend, 5 orders, $150 sales, 28% ACoS",
                options: [
                  { id: "a", label: "Promote to Exact, +10–20% bid", correct: true, explanation: "5 orders at 28% ACoS (at/below target) → promote to Exact and scale bid up." },
                  { id: "b", label: "Add as negative", explanation: "Wrong — this is a profitable term." },
                  { id: "c", label: "Decrease bid 20%", explanation: "Wrong — would reduce volume on a profitable term." },
                  { id: "d", label: "Pause", explanation: "Wrong — this is a winner, not a loser." },
                ],
              },
              {
                id: "st-glass",
                scenario: "glass water bottle — 18 clicks, $27 spend, 0 orders, $0 sales",
                options: [
                  { id: "a", label: "Add as negative keyword", correct: true, explanation: "18 clicks with 0 orders and wrong product type (glass vs insulated) → add as negative." },
                  { id: "b", label: "Promote to Exact", explanation: "Wrong — 0 orders means it doesn't convert." },
                  { id: "c", label: "Increase bid 20%", explanation: "Wrong — would burn more budget." },
                  { id: "d", label: "Keep as is", explanation: "Wrong — should be negated before more spend is wasted." },
                ],
              },
              {
                id: "st-hiking-filter",
                scenario: "hiking water bottle with filter — 12 clicks, $18 spend, 3 orders, $90 sales, 20% ACoS",
                options: [
                  { id: "a", label: "Promote to Exact, +10–20% bid", correct: true, explanation: "3+ orders at 20% ACoS (well below target) → promote to Exact and increase bid to capture more volume." },
                  { id: "b", label: "Add as negative", explanation: "Wrong — this is a profitable long-tail term." },
                  { id: "c", label: "Decrease bid 20%", explanation: "Wrong — would leave profitable volume on the table." },
                  { id: "d", label: "Keep as is", explanation: "Missed opportunity — proven winner should be scaled." },
                ],
              },
            ],
          },
        ],
      },
    ],
    checkpoint: phase3Checkpoint,
    submissionChecklist: [
      "Exercise 3.1A (keyword research file) completed.",
      "Exercise 3.2A (campaign structure) completed.",
      "Exercise 3.3A (dummy data decisions) completed.",
      "Week 5 (Phase 3 start): Keyword research methods practiced with Helium 10 + Amazon Autocomplete.",
      "Week 6: Campaign structure blueprint drafted and reviewed.",
      "Week 7: First dummy search term report analyzed; optimization decisions made.",
      "Week 8 (Phase 3 end): Weekly optimization cycle practiced — harvest, negate, adjust bids.",
      "Phase 3 Checkpoint quiz completed (score recorded).",
    ],
  },
  {
    id: "phase-4",
    number: 4,
    title: "Reporting & Capstone",
    subtitle: "Reporting, client comms & final project",
    weeks: "Weeks 9–12",
    duration: "4 weeks",
    color: "bg-violet-500",
    goals: [
      "Create a clear weekly report using data.",
      "Explain PPC results and strategy to a non-technical client.",
      "Complete a full PPC plan for a product (Capstone Project).",
    ],
    modules: [
      {
        id: "m4-1",
        code: "4.1",
        title: "Reporting",
        content: [
          {
            heading: "Why Weekly Reports Matter",
            type: "text",
            body: "As a PPC manager, your weekly report is the primary way you communicate value to your client or boss. A good report doesn't just list numbers — it tells a story: what happened, why it happened, what you did about it, and what's next. Clients who understand their PPC performance are happier, trust you more, and stay longer. Reports that confuse or overwhelm lead to churn. Keep it simple, clear, and actionable.",
          },
          {
            heading: "Weekly Report Structure",
            type: "definition",
            items: [
              { term: "1. Executive Summary (top 4–5 bullets)", description: "Total ad spend vs last week. Total ad-attributed sales vs last week. ACoS and target ACoS. TACoS and direction (up, down, stable). This is all some clients will read — make it count." },
              { term: "2. Wins (What went well)", description: '2-3 specific positive developments. Example: "Exact campaign for \'insulated water bottle 32oz\' improved ACoS from 40% to 25% and sales grew from $500 to $900."' },
              { term: "3. Issues (What needs fixing)", description: '2-3 problems you identified. Example: "Auto campaign spent $40 on broad term \'cheap water bottle\' with 0 orders; ACoS infinite; we added it as a negative keyword."' },
              { term: "4. Actions Taken", description: "Specific changes you made: bids increased/decreased and why. New campaigns or keywords added. Negatives added. Budget changes." },
              { term: "5. Next Steps & Requests", description: "What you plan to test next week. Any listings/creative changes needed from the client (images, price, copy). Questions for the client." },
            ],
          },
          {
            heading: "Sample Weekly Report: AquaPure Water Bottle (Week 4)",
            type: "table",
            columns: ["Metric", "This Week", "Last Week", "Change", "Notes"],
            rows: [
              ["Ad Spend", "$1,240", "$1,148", "+8.0%", "Slightly increased Discovery budget"],
              ["Ad Sales", "$4,180", "$3,430", "+21.9%", "Hero keywords performing well"],
              ["ACoS", "29.7%", "33.5%", "-3.8pp", "At target (30%) — improving"],
              ["ROAS", "3.37", "2.99", "+0.38", "Healthier return per dollar"],
              ["TACoS", "11.2%", "13.4%", "-2.2pp", "Organic share growing — excellent"],
              ["Total Revenue", "$11,071", "$8,567", "+29.2%", "Ads driving organic growth"],
              ["Orders", "148", "121", "+22.3%", "Strong week overall"],
              ["CPC", "$1.85", "$1.72", "+7.6%", "Competition increasing on hero terms"],
              ["CTR", "0.62%", "0.58%", "+0.04pp", "Listing changes paying off"],
              ["CVR", "7.8%", "6.1%", "+1.7pp", "New main image converting better"],
            ],
          },
          {
            heading: "Sample Weekly Report Email",
            type: "text",
            body: 'Subject: Weekly PPC Report — AquaPure Water Bottle — Week of Mar 18\n\nHi [Client],\n\nHere\'s your weekly PPC summary. Overall a strong week — ad sales grew 22% while ACoS dropped to 29.7% (at target). TACoS fell to 11.2%, which means organic sales are growing faster than ad spend.\n\nEXECUTIVE SUMMARY:\n• Ad spend: $1,240 (+8% vs last week)\n• Ad sales: $4,181 (+22% vs last week)\n• ACoS: 29.7% (target: 30%)\n• TACoS: 11.2% (down from 13.4% — organic share is growing)\n\nWINS:\n• "insulated water bottle 32oz" (Exact) improved ACoS from 40% to 25%, sales grew from $500 to $900 after bid optimization\n• Newly promoted "hiking water bottle with filter" generated 3 orders at 20% ACoS in its first week\n• New main image lifted CTR from 0.58% to 0.62%\n\nISSUES:\n• Auto campaign spent $40 on "cheap water bottle" with 0 orders — added as negative keyword\n• SD retargeting CTR dropped 30% — creative may be fatiguing, recommend testing new image\n• CPC on hero keywords rose 8% due to a new competitor entering the space\n\nACTIONS TAKEN:\n• Increased bid on "insulated water bottle 32oz" from $1.20 to $1.40 (+17%)\n• Added "cheap", "glass water bottle", "free" as negative keywords in Auto campaign\n• Promoted "hiking water bottle with filter" from Broad to Exact Hero campaign\n\nNEXT STEPS & REQUESTS:\n• Plan to launch SB Video for branded search term "AquaPure water bottle" in week 6\n• Need updated price/promo if possible — competitor dropped price to $27.99 last Friday\n• Recommend adding a 10% coupon to improve conversion rate\n\nLet me know if you have any questions!\n\nBest,\n[Your Name]',
          },
          {
            heading: "Reporting Best Practices",
            type: "list",
            items: [
              { term: "Lead with the headline", description: "The very first line should answer: 'Did we have a good week or a bad week?' Clients shouldn't have to read 3 paragraphs to find out." },
              { term: "Use numbers, not adjectives", description: "'Sales grew 22%' is better than 'Sales improved significantly'. Numbers are unambiguous; adjectives are subjective." },
              { term: "Always include the 'why'", description: "Don't just say 'ACoS dropped'. Say 'ACoS dropped because we negated 3 wasteful search terms and promoted 2 high-converting terms to Exact.'" },
              { term: "Compare to last week", description: "Every metric should show week-over-week change. This gives context — a 25% ACoS means nothing without knowing it was 30% last week." },
              { term: "Keep it under 1 page", description: "If your report is longer than 1 page, clients won't read it. Be concise. Move detail to an appendix or a dashboard." },
              { term: "End with clear asks", description: "If you need the client to do something (approve a budget increase, update a price, provide new images), state it clearly at the end." },
            ],
          },
        ],
        exercises: [
          {
            id: "4.1A",
            title: "Write a Report",
            prompt: "Using your decisions from Exercise 3.3A: write a short weekly report email (5–10 short paragraphs or bullet points). Make it clear enough for a non-PPC person to understand.",
            type: "open",
            placeholder: "Subject: Weekly PPC Report — Week of [date]\n\nExecutive Summary:\n...\n\nWins:\n...\n\nIssues:\n...\n\nActions Taken:\n...\n\nNext Steps:\n...",
          },
        ],
      },
      {
        id: "m4-2",
        code: "4.2",
        title: "Client Communication",
        content: [
          {
            heading: "The Art of Explaining PPC to Non-PPC People",
            type: "text",
            body: "Your client or boss probably doesn't know what ACoS means. They don't care about match types or negative keywords. They care about: 'Am I making money?' and 'Is my ad spend working?' Your job as a PPC manager is to translate complex advertising data into simple business language. If you can explain PPC in terms of profit, growth, and risk — in language a 12-year-old could understand — you'll be invaluable to any client.",
          },
          {
            heading: "What You Practice Explaining",
            type: "list",
            items: [
              { term: "Why ACoS is high or low", description: "Tie back to product phase (launch vs scale), competition, and bid landscape. Never just say 'ACoS is high' — explain the WHY." },
              { term: "How ads grow organic sales", description: "Ad sales lift BSR (Best Sellers Rank), which lifts organic ranking, which lifts organic sales. This is why TACoS matters more than ACoS long-term." },
              { term: "When the problem is the listing, not the ads", description: "Low conversion despite high CTR points to listing/price/reviews, not targeting. Don't take blame for a bad listing — point it out constructively." },
              { term: "Why we need to spend more to make more", description: "During launch, higher spend + higher ACoS is intentional — it's an investment in ranking. The payoff comes later as TACoS falls." },
            ],
          },
          {
            heading: "Common Client Objections & How to Handle Them",
            type: "table",
            columns: ["Client Says", "What They Mean", "Your Response Strategy", "Key Points to Make"],
            rows: [
              ["'ACoS is 45%, that's way too high!'", "'I'm losing money on ads'", "Acknowledge, ask about margin, explain launch phase", "Margin determines acceptable ACoS; launch phase tolerates higher ACoS; TACoS tells the real story"],
              ["'Turn off the ads, they're not working'", "'I don't see ROI'", "Show TACoS trend, explain organic lift, propose optimization instead", "Pausing ads kills organic ranking; optimization is cheaper than restarting"],
              ["'Why am I not on page 1 organically?'", "'I want free traffic'", "Explain that ads feed organic via BSR; show TACoS trend", "Ads lift BSR → BSR lifts organic → organic lifts total revenue"],
              ["'My competitor is spending less than me'", "'Am I overpaying?'", "Explain that spend should match goals, not competitors", "Different goals = different spend; focus on YOUR TACoS and ROAS"],
              ["'Why did spend go up 20% this week?'", "'Are you wasting my money?'", "Explain the specific reason (budget increase, new campaign, etc.)", "Always tie spend increases to expected outcomes"],
              ["'Can you just get me to #1 on Amazon?'", "'I want instant results'", "Set realistic expectations about timeline and ranking factors", "Ranking takes 60-90 days of consistent ad sales; listing quality matters as much as ads"],
            ],
          },
          {
            heading: "Example: Handling 'ACoS is 45%, turn off the ads!'",
            type: "flow",
            steps: [
              { title: "1. Acknowledge concern", description: "'I understand — 45% feels high. Let me walk you through what's happening and what we can do about it.' Don't be defensive. Validate their concern." },
              { title: "2. Ask margin & target ACoS", description: "'What's your profit margin on this product? That determines what ACoS we can afford.' You can't judge 45% without knowing the margin — 45% ACoS on a 60% margin product is fine." },
              { title: "3. Explain product phase", description: "'We're in the launch phase (first 30 days). During launch, a higher ACoS is expected because we're investing in data collection and organic ranking. After day 30, we'll shift to profit mode.'" },
              { title: "4. Bring in TACoS & organic", description: "'Your TACoS is only 12%, which means ads are driving 88% of your total revenue organically. If we pause ads now, we lose that organic ranking — and it's much harder to get back.'" },
              { title: "5. Propose a plan", description: "'Instead of pausing, I recommend: (1) negating 5 wasteful search terms I found, (2) decreasing bids on 3 underperforming keywords, and (3) shifting $100/day from Discovery to Heroes. This should bring ACoS down to 30% within 2 weeks without losing organic momentum.'" },
            ],
          },
          {
            heading: "Communication Golden Rules",
            type: "list",
            items: [
              { term: "Never use jargon without explaining it", description: "First time you say 'ACoS', explain: 'ACoS is the percentage of ad revenue spent on ads — lower means more efficient.' After that, you can use the abbreviation." },
              { term: "Always have a recommendation", description: "Clients hire you for your expertise. Never just present data — always follow up with 'Here's what I recommend we do about it.'" },
              { term: "Be proactive, not reactive", description: "Don't wait for the client to ask 'why is spend up?' — address it in your weekly report before they notice. Proactive communication builds trust." },
              { term: "Use analogies", description: "'Think of PPC like watering a plant — during launch, you water heavily to help roots grow. Once the plant is established, you water less. That's what TACoS shows us.'" },
            ],
          },
        ],
        exercises: [
          {
            id: "4.2A",
            title: "Client Objection Role-Play",
            prompt: "Your client just sent this message: 'ACoS hit 45% this week. I can't afford this. Pause everything until we figure out what to do.' Write your response email (3-5 paragraphs). Include: (1) Acknowledge their concern. (2) Explain what's causing the high ACoS (choose: launch phase, new competitor, or aggressive Discovery campaign). (3) Propose a specific plan — don't just respond, recommend. (4) Use at least one analogy or non-jargon explanation.",
            type: "open",
            placeholder: "Subject: Re: ACoS concern — here's what's happening\n\nHi [Client],\n\nI understand your concern about the 45% ACoS...\n\nWIN strategy (choose one):\n• Launch phase explanation\n• Competitor response\n• Discovery campaign optimization\n\nSpecific actions I recommend:\n1. ...\n2. ...\n3. ...\n\nBest,\n[Your Name]",
          },
        ],
      },
      {
        id: "m4-3",
        code: "4.3",
        title: "Capstone Project",
        content: [
          {
            heading: "The Capstone: Your PPC Manager Debut",
            type: "text",
            body: "The capstone project is your final exam. You'll build a complete PPC strategy for a real product as if your instructor is your first client. This is the moment where everything you've learned comes together: keyword research, campaign structure, optimization rules, reporting, and client communication. Treat it like a real client engagement — because the skills you demonstrate here are the same skills you'll use on day one of your first PPC job.",
          },
          {
            heading: "Example Product Brief",
            type: "text",
            body: '"Stainless Steel Insulated Water Bottle, 32oz, $29.99, mid-high competition, target ACoS 30–35%, long-term TACoS under 15%." This is the product you\'ll build a complete strategy for. The competition level means CPCs will be moderate-to-high ($1.50-$3.00), and you\'ll need strong negatives to stay efficient.',
          },
          {
            heading: "5 Deliverables",
            type: "definition",
            items: [
              { term: "1. Keyword Research File", description: "50–100 keywords organized into Tier 1, Tier 2, Tier 3. Brief explanation of your choices. Use the sample keyword list from Module 3.1 as a starting point." },
              { term: "2. Campaign Blueprint", description: "Discovery, Expansion, Heroes, Defense campaigns with budgets, match types, and example targets. Use the four-layer structure from Module 3.2. Include a naming convention." },
              { term: "3. 30-Day Launch Plan", description: "Week-by-week tasks: Week 1 (launch structure, initial bids), Week 2-3 (basic optimization and harvesting), Week 4 (shift budget toward heroes, refine negatives)." },
              { term: "4. Optimization Report", description: "Using the dummy data from Module 3.3: what worked, what didn't, what changes you recommend. Format as a weekly report email (Module 4.1)." },
              { term: "5. 5–10 Minute Presentation", description: "Present your whole strategy and results as if your instructor is the client. Lead with the executive summary, show the blueprint, highlight wins and issues, and end with next steps." },
            ],
          },
          {
            heading: "Capstone Grading Rubric",
            type: "table",
            columns: ["Deliverable", "Weight", "Excellent (A)", "Good (B)", "Needs Work (C)"],
            rows: [
              ["1. Keyword Research", "20%", "50-100 well-tiered keywords with clear reasoning", "30-50 keywords, mostly well-tiered", "Fewer than 30 keywords or poorly tiered"],
              ["2. Campaign Blueprint", "25%", "All 4 layers with budgets, naming, examples", "3-4 layers, missing some detail", "Missing layers or unrealistic budgets"],
              ["3. 30-Day Plan", "20%", "Week-by-week with specific tasks & milestones", "Has phases but lacks specificity", "Vague timeline, no specific tasks"],
              ["4. Optimization Report", "20%", "Clear 5-section report with data & reasoning", "Has all sections but less depth", "Missing sections or no data analysis"],
              ["5. Presentation", "15%", "Confident, clear, client-ready, within time", "Mostly clear, slightly over/under time", "Disorganized or doesn't use data"],
            ],
          },
          {
            heading: "Presentation Tips",
            type: "list",
            items: [
              { term: "Lead with the headline", description: "Start with: 'I built a complete PPC strategy that targets $X in monthly ad sales at Y% ACoS.' Don't bury the lede." },
              { term: "Show, don't tell", description: "Display your campaign blueprint as a visual (table or diagram). Show the keyword tiering as a chart. Visuals > walls of text." },
              { term: "Highlight 2 wins and 1 issue", description: "Pick your best optimization decision and explain the reasoning. Then show one issue you found and how you'd fix it. This demonstrates analytical thinking." },
              { term: "End with the next 30-day plan", description: "Close with: 'Here's what I'd do in month 2.' This shows you're thinking long-term, not just about the launch." },
              { term: "Practice with a timer", description: "5-10 minutes goes fast. Practice your presentation 3 times with a timer. Cut slides/content until you comfortably fit the time." },
            ],
          },
          {
            heading: "Sample 30-Day Launch Plan",
            type: "table",
            columns: ["Week", "Phase", "Key Tasks", "Budget Split", "Target ACoS"],
            rows: [
              ["Week 1", "Launch", "Launch Auto + Broad + 3 Exact campaigns. Set initial bids at $1.00-$1.50. Dynamic Down Only strategy. Add 10 negative keywords from day 1.", "Discovery 40% / Heroes 40% / Defense 10% / Buffer 10%", "40-50%"],
              ["Week 2", "Launch", "First search term review. Promote 3-5 winning terms to Exact. Negate 5-10 wasteful terms. Start adjusting bids on hero keywords.", "Discovery 35% / Heroes 40% / Expansion 15% / Defense 10%", "35-40%"],
              ["Week 3", "Launch → Scale", "Second search term review. Promote 3-5 more terms. Tighten negatives. Consider switching hero keywords to Up & Down strategy.", "Discovery 30% / Heroes 40% / Expansion 20% / Defense 10%", "30-35%"],
              ["Week 4", "Scale", "Shift budget from Discovery to Heroes. Launch SB for branded search (if Brand Registry). Review placement data for multipliers.", "Discovery 20% / Heroes 45% / Expansion 20% / Defense 10% / Buffer 5%", "25-30%"],
            ],
          },
        ],
      },
    ],
    checkpoint: phase4Checkpoint,
    submissionChecklist: [
      "Exercise 4.1A (weekly report email) completed.",
      "Exercise 4.2A (client objection role-play response) completed.",
      "Role-play scenarios practiced (at least 3 objection types).",
      "Capstone project: all 5 deliverables submitted.",
      "Capstone presentation recorded or delivered (5-10 min).",
      "Week 9 (Phase 4 start): Weekly report format learned; first draft written.",
      "Week 10: Client communication role-plays completed.",
      "Week 11: Capstone project: keyword research + campaign blueprint drafted.",
      "Week 12 (Phase 4 end): Capstone presentation delivered; Phase 4 Checkpoint quiz completed.",
    ],
  },
];

// =============================================================
// GLOSSARY
// =============================================================

export const glossary: GlossaryTerm[] = [
  // Fundamentals
  { term: "ASIN", category: "fundamental", definition: "Amazon Standard Identification Number; unique ID for each product. Ads always point to an ASIN." },
  { term: "SKU", category: "fundamental", definition: "Internal stock ID used by the seller; visible in reports but ads still connect to ASINs." },
  { term: "Buy Box", category: "fundamental", definition: 'The main "Add to Cart" / "Buy Now" area on a product page. Required for Sponsored Products to show and convert well.' },
  { term: "FBA", category: "fundamental", definition: "Fulfilled by Amazon — Amazon stores and ships the product. Usually better delivery and higher conversion." },
  { term: "FBM", category: "fundamental", definition: "Fulfilled by Merchant — the seller ships themselves. Can be slower and convert worse." },
  { term: "Brand Registry", category: "fundamental", definition: "Amazon's program that gives brand owners enhanced tools. Required for Sponsored Brands and SB Video." },
  { term: "Organic Listing", category: "fundamental", definition: "A product listing that appears on Amazon without paid advertising. Ads do not pay per impression on organic placements." },
  { term: "BSR", category: "fundamental", definition: "Best Sellers Rank — Amazon's hourly ranking of how well a product sells in its category. Higher ad sales lift BSR." },

  // Ad Types
  { term: "Sponsored Products (SP)", category: "ad-type", definition: "Single-product ads that show in search results and on product pages. Main performance driver for most brands." },
  { term: "Sponsored Brands (SB)", category: "ad-type", definition: "Banner ads at the top of search results showing logo, headline, and multiple products. Requires Brand Registry." },
  { term: "Sponsored Brands Video (SBV)", category: "ad-type", definition: "15–30 second video placements. Product shown in first 1–3 seconds. Requires Brand Registry." },
  { term: "Sponsored Display (SD)", category: "ad-type", definition: "Ads for retargeting viewers and showing on competitor product pages. Good for conquesting and following up with interested shoppers." },
  { term: "Sponsored TV", category: "ad-type", definition: "Upper-funnel video ads on Fire TV / Prime Video. Mostly for larger brands with bigger budgets." },

  // Metrics
  { term: "Impressions", category: "metric", definition: "How many times your ad was shown." },
  { term: "Clicks", category: "metric", definition: "How many times people clicked your ad." },
  { term: "CTR", category: "metric", definition: "Click-Through Rate = Clicks ÷ Impressions × 100. Measures how attractive/relevant your ad is." },
  { term: "CPC", category: "metric", definition: "Cost Per Click = Ad Spend ÷ Clicks. Average cost of each click." },
  { term: "CVR", category: "metric", definition: "Conversion Rate = Orders ÷ Clicks × 100. How good the listing/offer is at turning clicks into orders." },
  { term: "ACoS", category: "metric", definition: "Advertising Cost of Sales = Ad Spend ÷ Ad-Attributed Sales × 100. Lower is more efficient, but context matters." },
  { term: "ROAS", category: "metric", definition: "Return on Ad Spend = Ad-Attributed Sales ÷ Ad Spend. Higher is better." },
  { term: "TACoS", category: "metric", definition: "Total ACoS = Ad Spend ÷ Total Revenue (ad + organic) × 100. Shows ad impact on the entire business." },

  // Strategy
  { term: "Auto Match", category: "strategy", definition: "Amazon decides where to show your ads based on your listing. Great for discovery; needs negatives to control waste." },
  { term: "Broad Match", category: "strategy", definition: "Shows for variations, synonyms, and related searches. Good for exploring new keyword ideas. Easy to waste spend without negatives." },
  { term: "Phrase Match", category: "strategy", definition: "Search must include your keyword phrase in the same order, but can have words before or after." },
  { term: "Exact Match", category: "strategy", definition: "Only triggers for that exact keyword or very close variations. Best for proven 'hero' keywords." },
  { term: "Negative Keyword", category: "strategy", definition: "A keyword you tell Amazon NOT to trigger your ad for. Used to stop wasted spend on irrelevant terms." },
  { term: "ASIN Targeting", category: "strategy", definition: "Targeting specific competitor or complementary ASINs. Use when your offer is stronger or for cross-sell." },
  { term: "Dynamic Down Only", category: "strategy", definition: "Bid strategy where Amazon can only lower bids. Best for untested keywords and new launches." },
  { term: "Dynamic Up & Down", category: "strategy", definition: "Bid strategy where Amazon can raise and lower bids. Use once you know which keywords convert well." },
  { term: "Placement Multiplier", category: "strategy", definition: "Adjusts bids for specific placements (e.g. more aggressive at top of search)." },
  { term: "Harvesting", category: "strategy", definition: "The process of finding converting search terms in Auto/Broad reports and moving them into Phrase/Exact campaigns." },
  { term: "Conquesting", category: "strategy", definition: "Placing your ads on competitor product pages to win their shoppers." },
  { term: "Hero Keyword", category: "strategy", definition: "A proven, profitable keyword that gets placed in Exact match Hero campaigns for maximum control." },
];

// =============================================================
// FORMULAS
// =============================================================

export const formulas: Formula[] = [
  {
    name: "CTR (Click-Through Rate)",
    formula: "(Clicks ÷ Impressions) × 100",
    example: "(150 ÷ 10,000) × 100 = 1.5%",
    interpretation: "How attractive and relevant your ad is to shoppers seeing it.",
  },
  {
    name: "CPC (Cost Per Click)",
    formula: "Spend ÷ Clicks",
    example: "$500 ÷ 400 = $1.25",
    interpretation: "Average cost of each click. Higher in 2026 — wasted spend hurts more.",
  },
  {
    name: "Conversion Rate (CVR)",
    formula: "(Orders ÷ Clicks) × 100",
    example: "(20 ÷ 400) × 100 = 5%",
    interpretation: "How good the listing, price, and offer are at turning clicks into orders.",
  },
  {
    name: "ACoS",
    formula: "(Ad Spend ÷ Ad Sales) × 100",
    example: "($500 ÷ $2,000) × 100 = 25%",
    interpretation: "Ad efficiency against ad-attributed sales. Lower = more efficient, but context (launch vs scale) matters.",
  },
  {
    name: "ROAS",
    formula: "Ad Sales ÷ Ad Spend",
    example: "$2,000 ÷ $500 = 4.0",
    interpretation: "Return on each ad dollar. Higher is better. ROAS of 4 = $4 in ad sales per $1 spent.",
  },
  {
    name: "TACoS",
    formula: "(Ad Spend ÷ Total Revenue) × 100",
    example: "($500 ÷ $5,000) × 100 = 10%",
    interpretation: "Ad impact on the entire business (ad + organic). The best long-term health metric.",
  },
];

// =============================================================
// WEEKLY OPTIMIZATION CHECKLIST
// =============================================================

export const weeklyChecklist: { category: string; items: string[] }[] = [
  {
    category: "Reports",
    items: [
      "Download the last 7 days' search term report.",
      "Update your weekly report (5 sections).",
    ],
  },
  {
    category: "Negatives",
    items: [
      "Add search terms with 10–15+ clicks and 0 orders as negatives.",
      "Add obviously irrelevant themes as negatives.",
    ],
  },
  {
    category: "Promote Winners",
    items: [
      "Move 3+ order, on-target ACoS terms to Exact or Phrase Hero campaign.",
    ],
  },
  {
    category: "Bids",
    items: [
      "Increase bids for strong, profitable keywords (+10–20%).",
      "Decrease bid for weak or high-ACoS keywords with 10+ clicks (-10–20%).",
      "Pause or negate any keyword with 10+ clicks and 0 orders.",
    ],
  },
  {
    category: "Structure & Placements",
    items: [
      "Review placements and budget distribution.",
      "Check listing quality (images, reviews, price, content).",
    ],
  },
];

// =============================================================
// CAMPAIGN NAMING FORMAT
// =============================================================

export const namingFormat = {
  format: "[Product] – [Ad Type] – [Match Type/Targeting] – [Purpose]",
  examples: [
    "WaterBottle – SP – Auto – Discovery",
    "WaterBottle – SP – Exact – Heroes",
    "WaterBottle – SB – Video – Brand",
    "WaterBottle – SD – ASIN – Conquest",
  ],
};

// =============================================================
// CAPSTONE TRACKER
// =============================================================

export const capstoneDeliverables: { id: string; title: string; description: string; tips: string[] }[] = [
  {
    id: "cap-1",
    title: "Keyword Research File",
    description: "50–100 keywords organized into Tier 1, Tier 2, Tier 3 with brief explanation of choices.",
    tips: [
      "Use Helium 10 Magnet, Amazon Autocomplete, and competitor listings.",
      "Tier 1 = hero keywords (high volume, high intent, very relevant).",
      "Tier 2 = long-tail discovery (specific, lower volume, experimental).",
      "Tier 3 = competitor/ASIN-based (brand names, product names, ASINs).",
    ],
  },
  {
    id: "cap-2",
    title: "Campaign Blueprint",
    description: "Discovery, Expansion, Heroes, Defense campaigns with budgets, match types, and example targets.",
    tips: [
      "Discovery ~30% (Auto + Broad)",
      "Expansion ~20% (Phrase)",
      "Heroes ~40% (Exact)",
      "Defense ~10% (ASIN + SD)",
      "Use naming format: [Product] – [Ad Type] – [Match Type] – [Purpose]",
    ],
  },
  {
    id: "cap-3",
    title: "30-Day Launch Plan",
    description: "Week-by-week tasks for the first 30 days after launch.",
    tips: [
      "Week 1: Launch structure, initial bids (Dynamic Down Only).",
      "Week 2–3: Basic optimization and harvesting from Auto/Broad reports.",
      "Week 4: Shift budget toward Heroes, refine negatives.",
      "Launch ACoS 30–50% is acceptable; aim to compress after day 30.",
    ],
  },
  {
    id: "cap-4",
    title: "Optimization Report",
    description: "Analyze a month of dummy performance data: what worked, what didn't, recommended changes.",
    tips: [
      "Use the 5-section weekly report structure.",
      "Cite specific keywords and metrics.",
      "Tie every recommendation back to ACoS / TACoS targets.",
    ],
  },
  {
    id: "cap-5",
    title: "5–10 Minute Presentation",
    description: "Present your whole strategy and results as if your instructor is the client.",
    tips: [
      "Lead with the executive summary (1 slide).",
      "Show the campaign blueprint visually.",
      "Highlight 2 wins and 1 issue you fixed.",
      "End with the next 30-day plan and any asks from the 'client'.",
    ],
  },
];

// =============================================================
// EXAMPLE WEEKLY REPORT (for Reference section)
// =============================================================

export const exampleReport = {
  subject: "Weekly PPC Report — Week of [Date]",
  sections: [
    {
      title: "Executive Summary",
      bullets: [
        "Ad spend: $1,240 (up 8% vs last week's $1,148).",
        "Ad-attributed sales: $4,180 (up 22% vs last week's $3,430).",
        "ACoS: 29.7% — at target (30%).",
        "TACoS: 11.2% — down from 13.4% last week (organic share is growing).",
      ],
    },
    {
      title: "Wins",
      bullets: [
        "Exact campaign for 'insulated water bottle 32oz' improved ACoS from 40% to 25% and sales grew from $500 to $900.",
        "Newly promoted 'hiking water bottle with filter' (from Broad) generated 3 orders at 20% ACoS.",
      ],
    },
    {
      title: "Issues",
      bullets: [
        "Auto campaign spent $40 on 'cheap water bottle' with 0 orders; ACoS infinite; we added it as a negative keyword.",
        "Sponsored Display retargeting CTR dropped 30% — creative may be fatiguing.",
      ],
    },
    {
      title: "Actions Taken",
      bullets: [
        "Increased bid on 'insulated water bottle 32oz' from $1.20 to $1.40 (+17%).",
        "Added 'cheap', 'glass water bottle', 'free' as negative keywords in Auto campaign.",
        "Promoted 'hiking water bottle with filter' from Broad to Exact Hero campaign.",
      ],
    },
    {
      title: "Next Steps & Requests",
      bullets: [
        "Test new SD creative next week (please approve 2 image variants from the brand team).",
        "Plan to launch SB Video for branded search term 'AquaPure water bottle' in week 4.",
        "Need updated price/promo if possible — competitor dropped price to $27.99 last Friday.",
      ],
    },
  ],
};

// =============================================================
// SUBMISSION CHECKLIST (by phase)
// =============================================================

export const submissionChecklist: { phase: string; deadline: string; items: string[] }[] = [
  {
    phase: "Phase 1",
    deadline: "End of Week 2",
    items: [
      "Exercise 1.1A and 1.1B completed.",
      "Exercise 1.2A calculations completed.",
      "Phase 1 checkpoint questions answered.",
    ],
  },
  {
    phase: "Phase 2",
    deadline: "End of Week 4",
    items: [
      "Exercise 2.1A (headlines).",
      "Exercise 2.2A and 2.2B (match types / ASIN targeting).",
      "Exercise 2.3A (voice-friendly bullet).",
      "Amazon Ads Academy basic certifications completed.",
    ],
  },
  {
    phase: "Phase 3",
    deadline: "End of Week 8",
    items: [
      "Exercise 3.1A (keyword research file).",
      "Exercise 3.2A (campaign structure).",
      "Exercise 3.3A (dummy data decisions).",
    ],
  },
  {
    phase: "Phase 4",
    deadline: "End of Week 12",
    items: [
      "Exercise 4.1A (weekly report email).",
      "Role-play scenarios practiced.",
      "Capstone project: all 5 deliverables submitted.",
    ],
  },
];
