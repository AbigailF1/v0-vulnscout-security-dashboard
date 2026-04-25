'use client';

import { useState, useMemo, useCallback } from 'react';
import { Hero } from '@/components/hero';
import { FilterSidebar } from '@/components/filter-sidebar';
import { ToolsGrid } from '@/components/tools-grid';
import { ScanPanel } from '@/components/scan-panel';
import { tools as initialTools } from '@/lib/tools-data';
import type { Tool, Filters, RiskLevel } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Github, Shield } from 'lucide-react';

export default function VulnScoutPage() {
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    ecosystems: [],
    useCases: [],
    search: '',
  });

  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Filter tools based on current filters
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower) ||
          tool.category.toLowerCase().includes(searchLower) ||
          tool.ecosystem.toLowerCase().includes(searchLower) ||
          tool.useCase.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(tool.category)) {
        return false;
      }

      // Ecosystem filter
      if (filters.ecosystems.length > 0 && !filters.ecosystems.includes(tool.ecosystem)) {
        return false;
      }

      // Use case filter
      if (filters.useCases.length > 0 && !filters.useCases.includes(tool.useCase)) {
        return false;
      }

      return true;
    });
  }, [tools, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return filters.categories.length + filters.ecosystems.length + filters.useCases.length;
  }, [filters]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  // Handle search changes
  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  // Handle scan button click
  const handleScan = useCallback((tool: Tool) => {
    setSelectedTool(tool);
    setIsPanelOpen(true);
  }, []);

  // Handle scan completion - update tool's risk level
  const handleScanComplete = useCallback((toolId: string, riskLevel: RiskLevel) => {
    setTools((prev) =>
      prev.map((tool) => (tool.id === toolId ? { ...tool, riskLevel } : tool))
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      ecosystems: [],
      useCases: [],
      search: '',
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">VulnScout</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex">
                Powered by OSV.dev
              </Badge>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <Hero searchQuery={filters.search} onSearchChange={handleSearchChange} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-6">
          {/* Sidebar */}
          <FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />

          {/* Tools Section */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Tools
                </h2>
                <Badge variant="secondary" className="bg-secondary/50">
                  {filteredTools.length} {filteredTools.length === 1 ? 'result' : 'results'}
                </Badge>
              </div>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters ({activeFilterCount})
                </Button>
              )}
            </div>

            {/* Tools Grid */}
            <ToolsGrid tools={filteredTools} onScan={handleScan} />
          </div>
        </div>
      </main>

      {/* Scan Panel */}
      <ScanPanel
        tool={selectedTool}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="text-sm">VulnScout — Security Intelligence Dashboard</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a
                href="https://osv.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                OSV Database
              </a>
              <span className="text-border">•</span>
              <span>Built with Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
