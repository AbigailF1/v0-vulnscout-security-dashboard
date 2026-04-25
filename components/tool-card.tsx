'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Tool, RiskLevel } from '@/lib/types';
import { Shield, Scan, Package, Layers, Briefcase } from 'lucide-react';
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

export function ToolCard({ tool, onScan }: ToolCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 group">
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
        <Badge 
          variant="outline" 
          className={cn('text-xs font-medium border', getRiskBadgeStyles(tool.riskLevel))}
        >
          <Shield className="h-3 w-3 mr-1" />
          {tool.riskLevel}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {tool.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="text-xs bg-secondary/50">
          <Layers className="h-3 w-3 mr-1" />
          {tool.category}
        </Badge>
        <Badge variant="secondary" className="text-xs bg-secondary/50">
          <Briefcase className="h-3 w-3 mr-1" />
          {tool.useCase}
        </Badge>
      </div>

      <Button 
        onClick={() => onScan(tool)}
        className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all duration-300"
        variant="outline"
      >
        <Scan className="h-4 w-4 mr-2" />
        Scan with OSV
      </Button>
    </div>
  );
}

export function ToolCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div>
            <div className="h-5 w-24 bg-muted rounded mb-1" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        </div>
        <div className="h-5 w-20 bg-muted rounded" />
      </div>
      <div className="h-4 w-full bg-muted rounded mb-2" />
      <div className="h-4 w-3/4 bg-muted rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 bg-muted rounded" />
        <div className="h-5 w-20 bg-muted rounded" />
      </div>
      <div className="h-9 w-full bg-muted rounded" />
    </div>
  );
}
