'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Tool, RiskLevel } from '@/lib/types';
import { Shield, Scan, Package, Layers, Briefcase, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: Tool;
  onScan: (tool: Tool) => void;
}

function getRiskBadgeStyles(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'Safe':
      return 'bg-risk-safe risk-safe border-current/20';
    case 'Low':
      return 'bg-risk-low risk-low border-current/20';
    case 'Medium':
      return 'bg-risk-medium risk-medium border-current/20';
    case 'High':
      return 'bg-risk-high risk-high border-current/20';
    case 'Critical':
      return 'bg-risk-critical risk-critical border-current/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

function getBadgeStyles(badge: string): string {
  switch (badge) {
    case 'Popular':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'Trending':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'Essential':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'Security':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    case 'Infra':
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    case 'New':
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export function ToolCard({ tool, onScan }: ToolCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border/80 hover:shadow-sm group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <p className="text-xs text-muted-foreground">{tool.ecosystem}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {tool.badge && (
            <Badge 
              variant="outline" 
              className={cn('text-xs font-medium border', getBadgeStyles(tool.badge))}
            >
              {tool.badge}
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={cn('text-xs font-medium border', getRiskBadgeStyles(tool.riskLevel))}
          >
            <Shield className="h-3 w-3 mr-1" />
            {tool.riskLevel}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {tool.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="text-xs">
          <Layers className="h-3 w-3 mr-1" />
          {tool.category}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <Briefcase className="h-3 w-3 mr-1" />
          {tool.useCase}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => onScan(tool)}
          className="flex-1"
          variant="outline"
          size="sm"
        >
          <Scan className="h-4 w-4 mr-2" />
          Scan
        </Button>
        <Button 
          asChild
          variant="ghost"
          size="sm"
        >
          <Link href={`/packages/${encodeURIComponent(tool.ecosystem)}/${encodeURIComponent(tool.name)}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Details
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function ToolCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div>
            <div className="h-5 w-24 bg-muted rounded mb-1" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded" />
        </div>
      </div>
      <div className="h-4 w-full bg-muted rounded mb-2" />
      <div className="h-4 w-3/4 bg-muted rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 bg-muted rounded" />
        <div className="h-5 w-20 bg-muted rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 bg-muted rounded" />
        <div className="h-8 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}
