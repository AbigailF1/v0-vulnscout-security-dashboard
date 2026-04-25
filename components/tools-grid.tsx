'use client';

import { ToolCard, ToolCardSkeleton } from './tool-card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import type { Tool } from '@/lib/types';
import { Search } from 'lucide-react';

interface ToolsGridProps {
  tools: Tool[];
  isLoading?: boolean;
  onScan: (tool: Tool) => void;
}

export function ToolsGrid({ tools, isLoading, onScan }: ToolsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <Empty className="py-16 border-border">
        <EmptyHeader>
          <EmptyMedia>
            <Search className="h-12 w-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No tools found</EmptyTitle>
          <EmptyDescription>
            Try adjusting your filters or search query to find what you&apos;re looking for.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onScan={onScan} />
      ))}
    </div>
  );
}
