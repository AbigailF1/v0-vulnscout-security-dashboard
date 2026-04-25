import Link from 'next/link';
import {
  Shield,
  Database,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Code2,
  Users,
  Lock,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ecosystems = [
  'npm',
  'PyPI',
  'Go',
  'Maven',
  'crates.io',
  'RubyGems',
  'NuGet',
  'Packagist',
  'Debian',
  'Alpine',
  'Ubuntu',
  'GitHub Actions',
  'Docker',
];

const limitations = [
  {
    icon: AlertTriangle,
    title: 'Known Vulnerabilities Only',
    description:
      'OSV only reports vulnerabilities that have been discovered and reported. New or unreported vulnerabilities will not appear in scans.',
  },
  {
    icon: CheckCircle2,
    title: 'No Guarantee of Safety',
    description:
      'The absence of known vulnerabilities does not guarantee a package is safe. Always review code quality, maintainer activity, and licensing.',
  },
  {
    icon: Users,
    title: 'Supply Chain Considerations',
    description:
      'Dependencies have their own dependencies. A clean scan on a top-level package does not mean its transitive dependencies are vulnerability-free.',
  },
  {
    icon: Lock,
    title: 'Version Specificity',
    description:
      'Vulnerability data is version-specific. Always scan the exact version you plan to use in production.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              About VulnScout
            </h1>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              VulnScout helps developers discover safer open-source tools by providing real-time
              vulnerability intelligence powered by OSV.dev.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-16">
          {/* What is VulnScout */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What is VulnScout?</h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                VulnScout is an open-source security intelligence platform designed to help
                developers make informed decisions about the dependencies they adopt. Before adding
                a new package to your project, you can use VulnScout to check for known
                vulnerabilities.
              </p>
              <p>
                The platform aggregates package information across multiple ecosystems and provides
                real-time vulnerability scanning using the OSV (Open Source Vulnerabilities)
                database — a distributed, open-source vulnerability database maintained by Google
                and the open-source community.
              </p>
            </div>
          </section>

          {/* How OSV is Used */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How OSV is Used</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                When you scan a package with VulnScout, we query the OSV API with your package name,
                ecosystem, and version. OSV returns any known vulnerabilities that affect your
                specified version.
              </p>
              <p>For each vulnerability found, we provide:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>A unique vulnerability ID (e.g., CVE, GHSA, or OSV ID)</li>
                <li>A summary of the vulnerability</li>
                <li>Severity information when available</li>
                <li>Publication and modification dates</li>
                <li>Links to detailed advisories and patches</li>
              </ul>
              <p>
                Based on the number and severity of vulnerabilities found, we calculate a risk score
                (0-100) and provide a risk level (Safe, Low, Medium, High, or Critical) along with
                actionable recommendations.
              </p>
            </div>

            {/* Supported Ecosystems */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Supported Ecosystems</h3>
              <div className="flex flex-wrap gap-2">
                {ecosystems.map((eco) => (
                  <span
                    key={eco}
                    className="inline-flex items-center rounded-md bg-secondary px-3 py-1.5 text-sm font-medium"
                  >
                    {eco}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Why Scan Before Adoption */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Why Scan Before Adoption?
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Supply chain attacks targeting open-source dependencies have increased dramatically.
                High-profile incidents like the Log4j vulnerability (Log4Shell) demonstrated how a
                single vulnerable dependency can impact millions of applications worldwide.
              </p>
              <p>By scanning packages before adoption, you can:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Identify packages with known security issues before they enter your codebase</li>
                <li>Compare alternative packages and choose the more secure option</li>
                <li>Make informed decisions about version selection</li>
                <li>Reduce the risk of introducing vulnerabilities into production</li>
              </ul>
            </div>
          </section>

          {/* Limitations */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Limitations & Considerations
              </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              While VulnScout provides valuable vulnerability intelligence, it&apos;s important to
              understand its limitations:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {limitations.map((item) => (
                <Card key={item.title} className="border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-6">
              Best Practices for Dependency Security
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>In addition to scanning for vulnerabilities, consider these best practices:</p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  <strong className="text-foreground">Review maintainer activity:</strong> Check if
                  the package is actively maintained and how quickly security issues are addressed.
                </li>
                <li>
                  <strong className="text-foreground">Check the license:</strong> Ensure the package
                  license is compatible with your project&apos;s requirements.
                </li>
                <li>
                  <strong className="text-foreground">Minimize dependencies:</strong> Only add
                  dependencies that are truly necessary.
                </li>
                <li>
                  <strong className="text-foreground">Keep dependencies updated:</strong> Regularly
                  update your dependencies to receive security patches.
                </li>
                <li>
                  <strong className="text-foreground">Use lockfiles:</strong> Ensure reproducible
                  builds and prevent unexpected updates.
                </li>
                <li>
                  <strong className="text-foreground">Enable automated scanning:</strong> Integrate
                  vulnerability scanning into your CI/CD pipeline.
                </li>
              </ol>
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl bg-secondary/50 border border-border p-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Ready to get started?</h2>
            <p className="mt-2 text-muted-foreground">
              Start scanning packages now or explore our package directory.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/scanner">
                  <Search className="mr-2 h-4 w-4" />
                  Open Scanner
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://osv.dev" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit OSV.dev
                </a>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
