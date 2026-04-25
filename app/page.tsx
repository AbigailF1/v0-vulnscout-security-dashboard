import Link from 'next/link';
import {
  Shield,
  Search,
  BarChart3,
  Code2,
  ArrowRight,
  Package,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Package,
    title: 'Open-Source Discovery',
    description:
      'Browse and explore packages across npm, PyPI, Go, Maven, Rust, Ruby, and more ecosystems.',
  },
  {
    icon: AlertTriangle,
    title: 'OSV Vulnerability Intelligence',
    description:
      'Real-time vulnerability scanning powered by OSV.dev, the open-source vulnerability database.',
  },
  {
    icon: BarChart3,
    title: 'Risk Scoring',
    description:
      'Get instant risk assessments with clear scoring from Safe to Critical based on known vulnerabilities.',
  },
  {
    icon: Code2,
    title: 'Developer-Friendly',
    description:
      'Simple, actionable recommendations to help you make informed decisions before adopting dependencies.',
  },
];

const stats = [
  { value: '13+', label: 'Ecosystems' },
  { value: '1M+', label: 'Packages' },
  { value: 'Real-time', label: 'Scanning' },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 hero-gradient-light dark:hero-gradient-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />

        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Powered by OSV.dev
            </Badge>

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Discover{' '}
              <span className="gradient-text">safer</span>{' '}
              open-source tools
            </h1>

            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              Scan packages for known vulnerabilities before you adopt them. Filter by ecosystem,
              category, and use case — then make informed decisions with real-time OSV intelligence.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/scanner">
                  <Search className="mr-2 h-4 w-4" />
                  Start Scanning
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/explore">
                  Explore Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-secondary/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for dependency security
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              VulnScout gives you the tools to evaluate open-source packages before they become part
              of your supply chain.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Three simple steps to safer dependencies
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold">
                1
              </div>
              <h3 className="text-lg font-semibold">Find a Package</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse the explorer or enter a package name directly in the scanner.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold">
                2
              </div>
              <h3 className="text-lg font-semibold">Scan with OSV</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We query the OSV database for known vulnerabilities in your specified version.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold">
                3
              </div>
              <h3 className="text-lg font-semibold">Review Results</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get a risk score, vulnerability details, and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to secure your dependencies?
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Start scanning packages now — no sign-up required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/scanner">
                  <Shield className="mr-2 h-4 w-4" />
                  Open Scanner
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-12 px-8 text-base">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">VulnScout</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with OSV.dev — Open Source Vulnerability database
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
