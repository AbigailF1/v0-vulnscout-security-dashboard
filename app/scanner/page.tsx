'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Clock,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { ECOSYSTEMS } from '@/lib/types';
import type { ScanResult, Ecosystem } from '@/lib/types';

const recentExamples = [
  { name: 'lodash', ecosystem: 'npm', version: '4.17.21' },
  { name: 'requests', ecosystem: 'PyPI', version: '2.31.0' },
  { name: 'log4j-core', ecosystem: 'Maven', version: '2.14.1' },
  { name: 'express', ecosystem: 'npm', version: '4.17.1' },
  { name: 'django', ecosystem: 'PyPI', version: '3.2.0' },
];

function getRiskColor(level: string): string {
  switch (level) {
    case 'Safe':
      return 'risk-safe';
    case 'Low':
      return 'risk-low';
    case 'Medium':
      return 'risk-medium';
    case 'High':
      return 'risk-high';
    case 'Critical':
      return 'risk-critical';
    default:
      return 'text-muted-foreground';
  }
}

function getRiskBgColor(level: string): string {
  switch (level) {
    case 'Safe':
      return 'bg-risk-safe';
    case 'Low':
      return 'bg-risk-low';
    case 'Medium':
      return 'bg-risk-medium';
    case 'High':
      return 'bg-risk-high';
    case 'Critical':
      return 'bg-risk-critical';
    default:
      return 'bg-muted';
  }
}

export default function ScannerPage() {
  const [packageName, setPackageName] = useState('');
  const [ecosystem, setEcosystem] = useState<Ecosystem>('npm');
  const [version, setVersion] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!packageName.trim()) {
      setError('Please enter a package name');
      return;
    }

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/osv/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: packageName.trim(),
          ecosystem,
          version: version.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan package');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const handleExampleClick = (example: (typeof recentExamples)[0]) => {
    setPackageName(example.name);
    setEcosystem(example.ecosystem as Ecosystem);
    setVersion(example.version);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">OSV Scanner</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Enter a package name, ecosystem, and version to scan for known vulnerabilities using the
            OSV database.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Scanner Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan a Package</CardTitle>
                <CardDescription>
                  Query the OSV database for vulnerability information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="package">Package Name</Label>
                  <Input
                    id="package"
                    placeholder="e.g., lodash, requests, express"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ecosystem">Ecosystem</Label>
                    <Select value={ecosystem} onValueChange={(v) => setEcosystem(v as Ecosystem)}>
                      <SelectTrigger id="ecosystem">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ECOSYSTEMS.map((eco) => (
                          <SelectItem key={eco} value={eco}>
                            {eco}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version">Version (optional)</Label>
                    <Input
                      id="version"
                      placeholder="e.g., 4.17.21"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    />
                  </div>
                </div>

                <Button onClick={handleScan} disabled={isScanning} className="w-full h-11">
                  {isScanning ? (
                    <>
                      <Spinner className="mr-2" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Scan Package
                    </>
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {result.package}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {result.ecosystem} • {result.version || 'latest'}
                      </CardDescription>
                    </div>
                    <Badge className={`${getRiskBgColor(result.riskLevel)} ${getRiskColor(result.riskLevel)} border-0`}>
                      {result.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Risk Score */}
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground">Risk Score</div>
                      <div className={`text-3xl font-bold ${getRiskColor(result.riskLevel)}`}>
                        {result.riskScore}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Vulnerabilities</div>
                      <div className="text-3xl font-bold">{result.vulnerabilityCount}</div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-start gap-3">
                      {result.riskLevel === 'Safe' ? (
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      ) : (
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${getRiskColor(result.riskLevel)}`} />
                      )}
                      <div>
                        <div className="font-medium">Recommendation</div>
                        <p className="text-sm text-muted-foreground mt-1">{result.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vulnerabilities List */}
                  {result.vulnerabilities.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Vulnerabilities Found</h4>
                      <div className="space-y-3">
                        {result.vulnerabilities.map((vuln) => (
                          <div
                            key={vuln.id}
                            className="rounded-lg border border-border bg-card p-4 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-mono text-sm font-medium">{vuln.id}</div>
                                <p className="text-sm text-muted-foreground mt-1">{vuln.summary}</p>
                              </div>
                              <Badge variant="outline" className="shrink-0">
                                {vuln.severity || 'Unknown'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Published: {new Date(vuln.published).toLocaleDateString()}
                              </span>
                              {vuln.references.length > 0 && (
                                <a
                                  href={vuln.references[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  View Details
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Try These Examples</CardTitle>
                <CardDescription>Click to populate the scanner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentExamples.map((example) => (
                  <button
                    key={`${example.ecosystem}-${example.name}`}
                    onClick={() => handleExampleClick(example)}
                    className="flex items-center justify-between w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary/50"
                  >
                    <div>
                      <div className="font-medium">{example.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {example.ecosystem} • {example.version}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About OSV</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  OSV (Open Source Vulnerabilities) is a distributed, open-source vulnerability
                  database for open source software.
                </p>
                <p>
                  It aggregates vulnerability data from multiple sources and provides a unified
                  interface for querying vulnerabilities across ecosystems.
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href="https://osv.dev" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Learn more at osv.dev
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
