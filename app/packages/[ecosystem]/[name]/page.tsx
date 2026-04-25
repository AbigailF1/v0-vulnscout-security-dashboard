'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Package,
  Shield,
  ArrowLeft,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { tools, getToolByEcosystemAndName } from '@/lib/tools-data';
import type { Tool } from '@/lib/types';
import { ScanResults } from '@/components/scan-results';
import { AIChatButton } from '@/components/ai-chat-panel';

export default function PackageDetailsPage({
  params,
}: {
  params: Promise<{ ecosystem: string; name: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tool, setTool] = useState<Tool | null>(null);
  const [version, setVersion] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedVersion, setScannedVersion] = useState<string | null>(null);

  const ecosystem = decodeURIComponent(resolvedParams.ecosystem);
  const name = decodeURIComponent(resolvedParams.name);
  const vulnFromUrl = searchParams.get('vuln');

  useEffect(() => {
    const foundTool = getToolByEcosystemAndName(ecosystem, name);
    if (foundTool) {
      setTool(foundTool);
      setVersion(foundTool.defaultVersion || '');
    }
  }, [ecosystem, name]);

  const handleScan = async () => {
    if (!tool) return;
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    setScannedVersion(version.trim() || undefined);
    setIsScanning(false);
  };

  // Get related packages (same ecosystem or category)
  const relatedPackages = tools
    .filter(
      (t) =>
        t.id !== tool?.id &&
        (t.ecosystem === tool?.ecosystem || t.category === tool?.category)
    )
    .slice(0, 5);

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Package Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The package &quot;{name}&quot; in ecosystem &quot;{ecosystem}&quot; was not found in our
            directory.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You can still scan it using the scanner.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button asChild>
              <Link href={`/scanner?name=${encodeURIComponent(name)}&ecosystem=${encodeURIComponent(ecosystem)}`}>
                <Search className="mr-2 h-4 w-4" />
                Try Scanner
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tool.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{tool.ecosystem}</Badge>
                    <Badge variant="secondary">{tool.category}</Badge>
                    {tool.badge && (
                      <Badge className="bg-primary/10 text-primary border-0">{tool.badge}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground max-w-2xl">{tool.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,350px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Scan Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Scan for Vulnerabilities
                </CardTitle>
                <CardDescription>
                  Enter a version to scan against the OSV database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      placeholder={tool.defaultVersion || 'e.g., 1.0.0 (optional)'}
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleScan} disabled={isScanning} className="h-10">
                      {isScanning ? (
                        <>
                          <Spinner className="mr-2" size="sm" />
                          Scanning
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Scan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results - Use new ScanResults component */}
            {scannedVersion !== null && (
              <ScanResults
                packageName={tool.name}
                ecosystem={tool.ecosystem}
                version={scannedVersion || undefined}
                onRescan={handleScan}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Package Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Package Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ecosystem</span>
                  <span className="font-medium">{tool.ecosystem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{tool.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Use Case</span>
                  <span className="font-medium">{tool.useCase}</span>
                </div>
                {tool.defaultVersion && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Default Version</span>
                    <span className="font-mono text-xs">{tool.defaultVersion}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Packages */}
            {relatedPackages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Packages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {relatedPackages.map((pkg) => (
                    <Link
                      key={pkg.id}
                      href={`/packages/${encodeURIComponent(pkg.ecosystem)}/${encodeURIComponent(pkg.name)}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50"
                    >
                      <div>
                        <div className="font-medium text-sm">{pkg.name}</div>
                        <div className="text-xs text-muted-foreground">{pkg.ecosystem}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <AIChatButton 
        packageContext={{ name: tool.name, ecosystem: tool.ecosystem }} 
      />
    </div>
  );
}
