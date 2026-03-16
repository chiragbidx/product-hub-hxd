// ─── Hero ───────────────────────────────────────────────────────────────────
export type HeroContent = {
  badgeInner: string;
  badgeOuter: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  heroImageLight: string;
  heroImageDark: string;
  heroImageAlt: string;
};

// ─── Sponsors ───────────────────────────────────────────────────────────────
export type SponsorItem = { icon: string; name: string };
export type SponsorsContent = {
  heading: string;
  items: SponsorItem[];
};

// ─── Benefits ───────────────────────────────────────────────────────────────
export type BenefitItem = { icon: string; title: string; description: string };
export type BenefitsContent = {
  eyebrow: string;
  heading: string;
  description: string;
  items: BenefitItem[];
};

// ─── Feature Grid ───────────────────────────────────────────────────────────
export type FeatureItem = { icon: string; title: string; description: string };
export type FeaturesContent = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  items: FeatureItem[];
};

// ─── Services ───────────────────────────────────────────────────────────────
export type ServiceItem = { title: string; description: string; pro: boolean };
export type ServicesContent = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  items: ServiceItem[];
};

// ─── Testimonials ───────────────────────────────────────────────────────────
export type TestimonialItem = {
  image: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
};
export type TestimonialsContent = {
  eyebrow: string;
  heading: string;
  reviews: TestimonialItem[];
};

// ─── Team ───────────────────────────────────────────────────────────────────
export type SocialLink = { name: string; url: string };
export type TeamMember = {
  imageUrl: string;
  firstName: string;
  lastName: string;
  positions: string[];
  socialNetworks: SocialLink[];
};
export type TeamContent = {
  eyebrow: string;
  heading: string;
  members: TeamMember[];
};

// ─── Pricing ────────────────────────────────────────────────────────────────
export type PricingPlan = {
  title: string;
  popular: boolean;
  price: number;
  description: string;
  buttonText: string;
  benefits: string[];
};
export type PricingContent = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  priceSuffix: string;
  plans: PricingPlan[];
};

// ─── Contact ────────────────────────────────────────────────────────────────
export type ContactInfoBlock = { label: string; value: string | string[] };
export type ContactContent = {
  eyebrow: string;
  heading: string;
  description: string;
  mailtoAddress: string;
  info: {
    address: ContactInfoBlock;
    phone: ContactInfoBlock;
    email: ContactInfoBlock;
    hours: ContactInfoBlock;
  };
  formSubjects: string[];
  formSubmitLabel: string;
};

// ─── FAQ ────────────────────────────────────────────────────────────────────
export type FaqItem = { question: string; answer: string };
export type FaqContent = {
  eyebrow: string;
  heading: string;
  items: FaqItem[];
};

// ─── Footer ─────────────────────────────────────────────────────────────────
export type FooterLink = { label: string; href: string };
export type FooterColumn = { heading: string; links: FooterLink[] };
export type FooterContent = {
  brandName: string;
  columns: FooterColumn[];
  copyright: string;
  attribution: { label: string; href: string };
};

// ─── Navbar ─────────────────────────────────────────────────────────────────
export type NavRoute = { href: string; label: string };
export type NavFeature = { title: string; description: string };
export type NavbarContent = {
  brandName: string;
  routes: NavRoute[];
  featureDropdownLabel: string;
  featureImage: { src: string; alt: string };
  features: NavFeature[];
  signInLabel: string;
  signUpLabel: string;
  dashboardLabel: string;
  githubLink: { href: string; ariaLabel: string };
};

// ─── Root ───────────────────────────────────────────────────────────────────
export type HomeContent = {
  hero: HeroContent;
  sponsors: SponsorsContent;
  benefits: BenefitsContent;
  features: FeaturesContent;
  services: ServicesContent;
  testimonials: TestimonialsContent;
  team: TeamContent;
  pricing: PricingContent;
  contact: ContactContent;
  faq: FaqContent;
  footer: FooterContent;
  navbar: NavbarContent;
};

// ─── Defaults ───────────────────────────────────────────────────────────────

export const defaultHomeContent: HomeContent = {
  // ── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    badgeInner: "Launch",
    badgeOuter: "DocuBuild is live",
    titleBefore: "Generate legal",
    titleHighlight: "contracts",
    titleAfter: "in minutes",
    subtitle:
      "DocuBuild empowers your business with fast, reliable, and secure contract workflows—draft, customize, and manage all your agreements in one place.",
    primaryCta: { label: "Get Started", href: "#pricing" },
    secondaryCta: { label: "See How It Works", href: "#features" },
    heroImageLight: "/hero-image-light.jpeg",
    heroImageDark: "/hero-image-dark.jpeg",
    heroImageAlt: "DocuBuild contract dashboard preview",
  },

  // ── Sponsors ─────────────────────────────────────────────────────────────
  sponsors: {
    heading: "Trusted by teams for legal peace of mind",
    items: [
      { icon: "Crown", name: "Vercel" },
      { icon: "Vegan", name: "Stripe" },
      { icon: "Ghost", name: "OpenAI" },
      { icon: "Puzzle", name: "Supabase" },
      { icon: "Squirrel", name: "Clerk" },
      { icon: "Cookie", name: "Resend" },
      { icon: "Drama", name: "Sentry" },
    ],
  },

  // ── Benefits ─────────────────────────────────────────────────────────────
  benefits: {
    eyebrow: "Why DocuBuild",
    heading: "Modern contract workflows, no legal headaches",
    description:
      "DocuBuild is built for teams and professionals seeking a compliant, modern, and streamlined contract management solution—save time, stay secure, and keep every important agreement organized.",
    items: [
      {
        icon: "Blocks",
        title: "Compliant & Secure",
        description: "Your data is protected and contracts are tenant-scoped, with robust access controls.",
      },
      {
        icon: "LineChart",
        title: "Generate, Edit, Manage",
        description: "Draft from templates, customize with dynamic fields, then manage lifecycle from draft to signature.",
      },
      {
        icon: "Wallet",
        title: "Easy Collaboration",
        description: "Assign contract parties, invite team reviews, and track every action in the activity log.",
      },
      {
        icon: "Sparkle",
        title: "All Your Docs, One Dashboard",
        description: "Every contract, template, and contact accessible instantly—never lose track of an agreement again.",
      },
    ],
  },

  // ── Features ─────────────────────────────────────────────────────────────
  features: {
    eyebrow: "Product Features",
    heading: "A better way to build, store, and manage contracts",
    subtitle:
      "DocuBuild gives you everything you need for contract creation, template management, party tracking, and secure team workflows.",
    items: [
      {
        icon: "TabletSmartphone",
        title: "Responsive Anywhere",
        description: "Manage contracts from any device—desktop, tablet, or mobile—with a modern, accessible UI.",
      },
      {
        icon: "BadgeCheck",
        title: "Reusable Templates",
        description: "Save time with dynamic contract templates and fast population of client and project info.",
      },
      {
        icon: "Goal",
        title: "Status & Activity Log",
        description: "Track the complete lifecycle—drafts, review, signed status, and detailed audit actions per contract.",
      },
      {
        icon: "PictureInPicture",
        title: "Party/Contact Management",
        description: "Store reusable parties, assign roles, and link contacts to every contract without retyping.",
      },
      {
        icon: "MousePointerClick",
        title: "Role-Based Permissions",
        description: "Admins, editors, and viewers each see the right actions and data—including contract add/edit/archive gating.",
      },
      {
        icon: "ShieldCheck",
        title: "Multi-Tenant Security",
        description: "Strict tenant boundaries—each team's contracts, templates, and contacts are siloed and protected.",
      },
    ],
  },

  // ── Services ─────────────────────────────────────────────────────────────
  services: {
    eyebrow: "Contract Generation",
    heading: "End-to-end legal document workflows",
    subtitle:
      "Everything you need to move from draft to done—fast creation, error-resistant editing, status tracking, and historical visibility.",
    items: [
      {
        title: "Templated Contracts",
        description: "Build reusable templates and fill dynamic fields in seconds.",
        pro: false,
      },
      {
        title: "Party Management",
        description: "Organize contacts and assign them to key agreements.",
        pro: false,
      },
      {
        title: "Lifecycle Status",
        description: "Track every stage—draft, pending, signed, archived—with clear labels and filtering.",
        pro: false,
      },
      {
        title: "Read-Only & Role Gating",
        description: "Permission every action—admins edit, viewers browse, no accidental overwrites.",
        pro: true,
      },
    ],
  },

  // ── Testimonials ─────────────────────────────────────────────────────────
  testimonials: {
    eyebrow: "Testimonials",
    heading: "How DocuBuild changes the legal workflow",
    reviews: [
      {
        image: "/demo-img.jpg",
        name: "Aarav Shah",
        role: "Founder, FinchFlow",
        comment: "We generate professional contracts in minutes with DocuBuild—no need for endless Word edits or email rounds.",
        rating: 5.0,
      },
      {
        image: "/demo-img.jpg",
        name: "Maya Patel",
        role: "Startup COO",
        comment: "The templating system is a game changer for our sales and hiring agreements. Massive timesaver!",
        rating: 4.9,
      },
      {
        image: "/demo-img.jpg",
        name: "Daniel Kim",
        role: "Legal Counsel, Nimbus",
        comment: "Clear contract status and party management features allow me to track every deal accurately.",
        rating: 5.0,
      },
      {
        image: "/demo-img.jpg",
        name: "Sofia Green",
        role: "SMB Owner",
        comment: "DocuBuild makes it easy to keep my contract records sorted and secure. Onboarding was a breeze.",
        rating: 5.0,
      },
      {
        image: "/demo-img.jpg",
        name: "Emma Brooks",
        role: "Recruitment Manager",
        comment: "All our hiring templates now live in DocuBuild, ready to customize for every candidate. Love the status tracking and activity log.",
        rating: 4.9,
      },
      {
        image: "/demo-img.jpg",
        name: "Nikhil Rao",
        role: "CTO, TeamForge",
        comment: "The best SaaS decision we made for legal ops. Fast, organized, and everyone sees only the data they need.",
        rating: 5.0,
      },
    ],
  },

  // ── Team ─────────────────────────────────────────────────────────────────
  team: {
    eyebrow: "Our Team",
    heading: "Meet the DocuBuild team",
    members: [
      {
        imageUrl: "/team1.jpg",
        firstName: "Chirag",
        lastName: "Dodiya",
        positions: ["Founder", "Product & Engineering"],
        socialNetworks: [
          { name: "LinkedIn", url: "https://linkedin.com/in/chiragdodiya" },
          { name: "Github", url: "https://github.com/chiragdodiya" },
        ],
      },
    ],
  },

  // ── Pricing ──────────────────────────────────────────────────────────────
  pricing: {
    eyebrow: "Pricing",
    heading: "Fair pricing, clear value—no surprises",
    subtitle:
      "Choose the best plan for your contract workflow. Start for free, upgrade when you need tailored controls and audit logs.",
    priceSuffix: "/month",
    plans: [
      {
        title: "Starter",
        popular: false,
        price: 0,
        description: "Perfect for freelancers and very small teams. Unlimited contracts, up to 2 parties per contract.",
        buttonText: "Start for free",
        benefits: [
          "Unlimited contracts (up to 2 parties)",
          "All template features",
          "Activity log (last 30 days)",
          "Role-based access",
          "Email support",
        ],
      },
      {
        title: "Team",
        popular: true,
        price: 39,
        description: "Best for growing teams, agencies, or legal departments.",
        buttonText: "Start 14-day trial",
        benefits: [
          "Unlimited parties per contract",
          "Priority email support",
          "Activity log (full)",
          "Multi-tenant team model",
          "Bulk contract import/export",
        ],
      },
      {
        title: "Enterprise",
        popular: false,
        price: 129,
        description: "Custom SLAs, onboarding, and integrations. For legal, HR, or ops at scale.",
        buttonText: "Contact sales",
        benefits: [
          "Custom integrations",
          "Dedicated onboarding",
          "SSO/SAML option",
          "Full audit logging",
          "Security review",
        ],
      },
    ],
  },

  // ── Contact ──────────────────────────────────────────────────────────────
  contact: {
    eyebrow: "Contact",
    heading: "Talk to the DocuBuild team",
    description:
      "Need help setting up contract workflows, importing legacy documents, or rolling out multi-tenant teams? Let us know how we can help.",
    mailtoAddress: "hi@chirag.co",
    info: {
      address: { label: "Find us", value: "Remote-first • Worldwide" },
      phone: { label: "Call us", value: "+1 (415) 555-0199" },
      email: { label: "Email us", value: "hi@chirag.co" },
      hours: { label: "Support hours", value: ["Monday - Friday", "8AM - 8PM (global)"] },
    },
    formSubjects: [
      "Product Inquiry",
      "Contract Import",
      "Team Onboarding",
      "Template Customization",
      "Enterprise Plan",
    ],
    formSubmitLabel: "Send message",
  },

  // ── FAQ ──────────────────────────────────────────────────────────────────
  faq: {
    eyebrow: "FAQ",
    heading: "DocuBuild: Common Questions",
    items: [
      { question: "Can I generate contracts without legal expertise?", answer: "Yes! DocuBuild’s templates and dynamic fields make it easy for any business or team to create, customize, and manage contracts." },
      { question: "Is my data and contracts secure?", answer: "Absolutely. DocuBuild is multi-tenant, role-gated, with contract access scoped by team. All data stored securely in enterprise-grade infrastructure." },
      { question: "Can I customize contract templates for my business?", answer: "Yes—edit templates, add dynamic fields, and use your own language for each agreement." },
      { question: "How does party/contact management work?", answer: "Parties are reusable contacts—add once, assign roles, and link to contracts as needed. Edit or archive anytime." },
      { question: "How is collaboration handled?", answer: "Admin and editor roles allow contract creation and approval; viewers can read only. All actions appear in the contract’s activity log." },
      { question: "What if I need a custom contract feature?", answer: "Reach out to the DocuBuild team. We're committed to flexible workflows and will work with you to extend the platform for your needs." },
    ],
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    brandName: "DocuBuild",
    columns: [
      {
        heading: "Contact",
        links: [
          { label: "hi@chirag.co", href: "mailto:hi@chirag.co" },
          { label: "Chirag Dodiya", href: "mailto:hi@chirag.co" },
          { label: "Twitter", href: "https://x.com/chiragdodiya" },
        ],
      },
      {
        heading: "Product",
        links: [
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "Contact", href: "#contact" },
        ],
      },
      {
        heading: "Help",
        links: [
          { label: "Contact Support", href: "#contact" },
          { label: "FAQ", href: "#faq" },
        ],
      },
      {
        heading: "Company",
        links: [
          { label: "Terms of Service", href: "#" },
          { label: "Privacy Policy", href: "#" },
        ],
      },
    ],
    copyright: "© 2026 DocuBuild. All rights reserved.",
    attribution: { label: "Built on Next.js", href: "https://nextjs.org" },
  },

  // ── Navbar ───────────────────────────────────────────────────────────────
  navbar: {
    brandName: "DocuBuild",
    routes: [
      { href: "/#features", label: "Features" },
      { href: "/#testimonials", label: "Testimonials" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#faq", label: "FAQ" },
      { href: "/#contact", label: "Contact" },
    ],
    featureDropdownLabel: "Contract Solutions",
    featureImage: { src: "/demo-img.jpg", alt: "DocuBuild feature preview" },
    features: [
      { title: "Contract Builder", description: "Flexible, compliant, and fast contracts for business, HR, and legal." },
      { title: "Template Management", description: "Dynamic field support and one-click contract generation." },
      { title: "Audit Logs & Search", description: "All changes tracked, all contracts searchable, nothing lost." },
    ],
    signInLabel: "Sign in",
    signUpLabel: "Sign up",
    dashboardLabel: "Dashboard",
    githubLink: { href: "https://github.com/chiragdodiya", ariaLabel: "View on GitHub" },
  },
};

export function getHomeContent(): HomeContent {
  return defaultHomeContent;
}