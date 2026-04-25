'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  Shield,
  AlertTriangle,
  Clock,
  Package,
  Download,
  Share2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CVSSChart, SeverityChart } from './cvss-chart';
import { CVECard } from './cve-card';
import { CVEDetailModal } from './cve-detail-modal';
import { VulnerabilityTable } from './vulnerability-table';
import { AIChatPanel } from './ai-chat-panel';
import type { ScanResult, EnrichedVulnerability } from '@/lib/osv-schemas';
import { formatDistanceToNow, format, differenceInSeconds } from 'date-fns';
import { toast } from 'sonner';

interface ScanResultsProps {
  packageName: string;
  ecosystem: string;
  version?: string;
  onRescan?: () => void;
}

export function ScanResults({ packageName, ecosystem, version, onRescan }: ScanResultsProps) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVuln, setSelectedVuln] = useState<EnrichedVulnerability | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cacheCountdown, setCacheCountdown] = useState<number | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/osv/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: packageName, ecosystem, version }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan package');
      }

      const data: ScanResult = await response.json();
      setResult(data);

      // Calculate cache countdown
      if (data.cachedUntil) {
        const seconds = differenceInSeconds(new Date(data.cachedUntil), new Date());
        if (seconds > 0) {
          setCacheCountdown(seconds);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to scan package', {
        description: 'Please try again.',
        action: {
          label: 'Retry',
          onClick: fetchResults,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [packageName, ecosystem, version]);

  // Cache countdown timer
  useEffect(() => {
    if (cacheCountdown === null || cacheCountdown <= 0) return;

    const timer = setInterval(() => {
      setCacheCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cacheCountdown]);

  const handleViewDetails = (vuln: EnrichedVulnerability) => {
    setSelectedVuln(vuln);
    setModalOpen(true);
  };

  const handleExplain = (vuln: EnrichedVulnerability) => {
    // This would open the AI chat with a specific prompt
    toast.info('Opening AI assistant...', {
      description: `Ask about ${vuln.id}`,
    });
  };

  const handleExportAll = (format: 'json' | 'csv') => {
    if (!result) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(result, null, 2);
      filename = `${packageName}-${ecosystem}-scan.json`;
      mimeType = 'application/json';
    } else {
      const headers = ['ID', 'Severity', 'CVSS', 'Summary', 'Fixed Version', 'Published'];
      const rows = result.vulnerabilities.map(v => [
        v.id,
        v.severity,
        v.cvssScore?.toString() || '',
        `"${v.summary.replace(/"/g, '""')}"`,
        v.fixedVersion || '',
        v.published || '',
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `${packageName}-${ecosystem}-scan.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  const formatCacheTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <ScanResultsSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="font-medium text-lg mb-2">Scan Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchResults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const top3Vulns = result.vulnerabilities.slice(0, 3);
  const hasVulnerabilities = result.vulnerabilityCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">{packageName}</h2>
            <p className="text-sm text-muted-foreground">
              {ecosystem} {version && `v${version}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cacheCountdown && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Cached: {formatCacheTime(cacheCountdown)}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => handleExportAll('json')}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onRescan || fetchResults}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Rescan
          </Button>
          <AIChatPanel
            packageContext={{ name: packageName, ecosystem, version }}
          />
        </div>
      </div>

      {!hasVulnerabilities ? (
        /* No Vulnerabilities State */
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h3 className="font-medium text-xl mb-2 text-green-600 dark:text-green-400">
              No Vulnerabilities Found
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This package version appears to be safe. No known vulnerabilities were found in the OSV database.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Scanned at {format(new Date(result.scannedAt), 'PPp')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Severity Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <SeverityChart data={result.severityDistribution} />
              </CardContent>
            </Card>

            {/* CVSS Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CVSS Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <CVSSChart data={result.cvssDistribution} />
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Vulnerabilities</span>
                  <Badge variant="secondary">{result.vulnerabilityCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Critical</span>
                  <Badge variant="destructive">{result.severityDistribution.critical}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">High</span>
                  <Badge className="bg-orange-500">{result.severityDistribution.high}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Medium</span>
                  <Badge className="bg-yellow-500 text-yellow-950">{result.severityDistribution.medium}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Low</span>
                  <Badge className="bg-green-500">{result.severityDistribution.low}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top CVEs */}
          {top3Vulns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Top Vulnerabilities</h3>
                <Badge variant="outline">{result.vulnerabilityCount} total</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {top3Vulns.map(vuln => (
                  <CVECard
                    key={vuln.id}
                    vulnerability={vuln}
                    onViewDetails={handleViewDetails}
                    onExplain={handleExplain}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Detailed View */}
          <Tabs defaultValue="table" className="w-full">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-4">
              <VulnerabilityTable
                vulnerabilities={result.vulnerabilities}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>

            <TabsContent value="cards" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {result.vulnerabilities.map(vuln => (
                  <CVECard
                    key={vuln.id}
                    vulnerability={vuln}
                    onViewDetails={handleViewDetails}
                    onExplain={handleExplain}
                    compact
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* CVE Detail Modal */}
      <CVEDetailModal
        vulnerability={selectedVuln}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}

function ScanResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[180px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
