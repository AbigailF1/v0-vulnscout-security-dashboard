'use client';

import { useState } from 'react';
import {
  Search,
  Shield,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { ECOSYSTEMS, type Ecosystem } from '@/lib/types';
import { ScanResults } from '@/components/scan-results';
import { AIChatButton } from '@/components/ai-chat-panel';

const recentExamples = [
  { name: 'lodash', ecosystem: 'npm', version: '4.17.21' },
  { name: 'requests', ecosystem: 'PyPI', version: '2.31.0' },
  { name: 'log4j-core', ecosystem: 'Maven', version: '2.14.1' },
  { name: 'express', ecosystem: 'npm', version: '4.17.1' },
  { name: 'django', ecosystem: 'PyPI', version: '3.2.0' },
  { name: 'axios', ecosystem: 'npm', version: '0.21.1' },
];

export default function ScannerPage() {
  const [packageName, setPackageName] = useState('');
  const [ecosystem, setEcosystem] = useState<Ecosystem>('npm');
  const [version, setVersion] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPackage, setScannedPackage] = useState<{
    name: string;
    ecosystem: string;
    version?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!packageName.trim()) {
      setError('Please enter a package name');
      return;
    }

    setIsScanning(true);
    setError(null);

    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 100));

    setScannedPackage({
      name: packageName.trim(),
      ecosystem,
      version: version.trim() || undefined,
    });
    
    setIsScanning(false);
  };

  const handleExampleClick = (example: (typeof recentExamples)[0]) => {
    setPackageName(example.name);
    setEcosystem(example.ecosystem as Ecosystem);
    setVersion(example.version);
  };

  const handleRescan = () => {
    if (scannedPackage) {
      setScannedPackage({ ...scannedPackage });
    }
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
            OSV database. Get detailed CVE information, CVSS scores, and remediation guidance.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,350px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Scanner Form */}
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
                      <Spinner className="mr-2" size="sm" />
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
            {scannedPackage && (
              <ScanResults
                packageName={scannedPackage.name}
                ecosystem={scannedPackage.ecosystem}
                version={scannedPackage.version}
                onRescan={handleRescan}
              />
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
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Package className="h-4 w-4 mt-0.5 text-primary" />
                    <span>CVSS score distribution charts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Package className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Sortable and filterable vulnerability table</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Package className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Export results as JSON, Markdown, or CSV</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Package className="h-4 w-4 mt-0.5 text-primary" />
                    <span>AI-powered vulnerability explanations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Package className="h-4 w-4 mt-0.5 text-primary" />
                    <span>15-minute result caching</span>
                  </li>
                </ul>
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

      {/* Floating AI Chat Button */}
      <AIChatButton />
    </div>
  );
}
