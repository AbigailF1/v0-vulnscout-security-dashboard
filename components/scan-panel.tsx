'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import type { Tool, ScanResult, RiskLevel } from '@/lib/types';
import { ECOSYSTEMS } from '@/lib/types';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Calendar,
  AlertCircle,
  XCircle,
  Scan,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScanPanelProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (toolId: string, riskLevel: RiskLevel) => void;
}

function getRiskIcon(riskLevel: RiskLevel) {
  switch (riskLevel) {
    case 'Safe':
      return <CheckCircle2 className="h-6 w-6 risk-safe" />;
    case 'Low':
      return <AlertCircle className="h-6 w-6 risk-low" />;
    case 'Medium':
      return <AlertTriangle className="h-6 w-6 risk-medium" />;
    case 'High':
      return <AlertTriangle className="h-6 w-6 risk-high" />;
    case 'Critical':
      return <XCircle className="h-6 w-6 risk-critical" />;
    default:
      return <Shield className="h-6 w-6 text-muted-foreground" />;
  }
}

function getRiskColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
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

function getProgressColor(riskScore: number): string {
  if (riskScore === 0) return '[&>div]:bg-[oklch(0.7_0.18_160)]';
  if (riskScore <= 30) return '[&>div]:bg-[oklch(0.75_0.15_140)]';
  if (riskScore <= 60) return '[&>div]:bg-[oklch(0.75_0.18_80)]';
  if (riskScore <= 80) return '[&>div]:bg-[oklch(0.65_0.2_40)]';
  return '[&>div]:bg-[oklch(0.55_0.22_25)]';
}

function getSeverityBadgeStyles(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-risk-critical risk-critical';
    case 'high':
      return 'bg-risk-high risk-high';
    case 'medium':
      return 'bg-risk-medium risk-medium';
    case 'low':
      return 'bg-risk-low risk-low';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function ScanPanel({ tool, isOpen, onClose, onScanComplete }: ScanPanelProps) {
  const [packageName, setPackageName] = useState('');
  const [ecosystem, setEcosystem] = useState('');
  const [version, setVersion] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset form when tool changes
  const resetForm = () => {
    if (tool) {
      setPackageName(tool.name.toLowerCase());
      setEcosystem(tool.ecosystem);
      setVersion(tool.defaultVersion || '');
    }
    setResult(null);
    setError(null);
  };

  // Initialize form when panel opens with a tool
  useState(() => {
    if (tool && isOpen) {
      resetForm();
    }
  });

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/osv/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: packageName,
          ecosystem,
          version,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scan failed');
      }

      const data: ScanResult = await response.json();
      setResult(data);
      
      if (tool) {
        onScanComplete(tool.id, data.riskLevel);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during scanning');
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset state after close animation
      setTimeout(() => {
        setResult(null);
        setError(null);
      }, 200);
    }
  };

  // Update form when tool changes
  if (tool && isOpen && packageName !== tool.name.toLowerCase()) {
    resetForm();
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Vulnerability Scanner
          </SheetTitle>
          <SheetDescription>
            Scan packages for known security vulnerabilities using the OSV database.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Scan Form */}
          <div className="rounded-xl border border-border bg-card p-4">
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="packageName">Package Name</FieldLabel>
                <Input
                  id="packageName"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g., lodash"
                  className="bg-input border-border"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="ecosystem">Ecosystem</FieldLabel>
                <Select value={ecosystem} onValueChange={setEcosystem}>
                  <SelectTrigger id="ecosystem" className="bg-input border-border">
                    <SelectValue placeholder="Select ecosystem" />
                  </SelectTrigger>
                  <SelectContent>
                    {ECOSYSTEMS.map((eco) => (
                      <SelectItem key={eco} value={eco}>
                        {eco}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="version">Version</FieldLabel>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g., 4.17.20"
                  className="bg-input border-border"
                />
              </Field>
            </FieldGroup>

            <Button 
              onClick={handleScan}
              disabled={isScanning || !packageName || !ecosystem || !version}
              className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isScanning ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  Scan Package
                </>
              )}
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-xl p-4 border border-destructive/50 bg-destructive/10">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <ScrollArea className="h-[calc(100vh-450px)]">
              <div className="space-y-4 pr-4">
                {/* Risk Overview */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getRiskIcon(result.riskLevel)}
                      <div>
                        <p className={cn('text-2xl font-bold', getRiskColor(result.riskLevel))}>
                          {result.riskLevel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Risk Level
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-3xl font-bold', getRiskColor(result.riskLevel))}>
                        {result.riskScore}
                      </p>
                      <p className="text-sm text-muted-foreground">Score</p>
                    </div>
                  </div>

                  <Progress 
                    value={result.riskScore} 
                    className={cn('h-2 bg-muted', getProgressColor(result.riskScore))}
                  />

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {result.package}@{result.version}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {result.vulnerabilityCount} {result.vulnerabilityCount === 1 ? 'vulnerability' : 'vulnerabilities'}
                    </Badge>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="rounded-xl bg-secondary/50 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Recommendation</h4>
                  <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                </div>

                {/* Vulnerabilities List */}
                {result.vulnerabilities.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">
                      Vulnerabilities ({result.vulnerabilities.length})
                    </h4>
                    {result.vulnerabilities.map((vuln) => (
                      <div key={vuln.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between mb-2">
                          <code className="text-sm font-mono text-primary">{vuln.id}</code>
                          <Badge className={cn('text-xs', getSeverityBadgeStyles(vuln.severity))}>
                            {vuln.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-2">{vuln.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Published: {new Date(vuln.published).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Modified: {new Date(vuln.modified).toLocaleDateString()}
                          </span>
                        </div>
                        {vuln.references.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-2">References:</p>
                            <div className="flex flex-wrap gap-2">
                              {vuln.references.slice(0, 3).map((ref, idx) => (
                                <a
                                  key={idx}
                                  href={ref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {new URL(ref).hostname}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {result.vulnerabilities.length === 0 && (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-foreground mb-1">All Clear!</h4>
                    <p className="text-sm text-muted-foreground">
                      No known vulnerabilities found for this package version.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
