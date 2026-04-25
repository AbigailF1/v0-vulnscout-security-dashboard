'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ToolCard } from '@/components/tool-card';
import { ScanPanel } from '@/components/scan-panel';
import { tools } from '@/lib/tools-data';
import { CATEGORIES, ECOSYSTEMS, USE_CASES } from '@/lib/types';
import type { Tool, Filters, RiskLevel, Category, Ecosystem, UseCase } from '@/lib/types';

export default function ExplorePage() {
  const [toolsState, setToolsState] = useState<Tool[]>(tools);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    ecosystems: [],
    useCases: [],
    search: '',
  });
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const filteredTools = useMemo(() => {
    return toolsState.filter((tool) => {
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

      if (filters.categories.length > 0 && !filters.categories.includes(tool.category)) {
        return false;
      }

      if (filters.ecosystems.length > 0 && !filters.ecosystems.includes(tool.ecosystem)) {
        return false;
      }

      if (filters.useCases.length > 0 && !filters.useCases.includes(tool.useCase)) {
        return false;
      }

      return true;
    });
  }, [toolsState, filters]);

  const activeFilterCount = useMemo(() => {
    return filters.categories.length + filters.ecosystems.length + filters.useCases.length;
  }, [filters]);

  const toggleCategory = useCallback((category: Category) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const toggleEcosystem = useCallback((ecosystem: Ecosystem) => {
    setFilters((prev) => ({
      ...prev,
      ecosystems: prev.ecosystems.includes(ecosystem)
        ? prev.ecosystems.filter((e) => e !== ecosystem)
        : [...prev.ecosystems, ecosystem],
    }));
  }, []);

  const toggleUseCase = useCallback((useCase: UseCase) => {
    setFilters((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(useCase)
        ? prev.useCases.filter((u) => u !== useCase)
        : [...prev.useCases, useCase],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      ecosystems: [],
      useCases: [],
      search: '',
    });
  }, []);

  const handleScan = useCallback((tool: Tool) => {
    setSelectedTool(tool);
    setIsPanelOpen(true);
  }, []);

  const handleScanComplete = useCallback((toolId: string, riskLevel: RiskLevel) => {
    setToolsState((prev) =>
      prev.map((tool) => (tool.id === toolId ? { ...tool, riskLevel } : tool))
    );
  }, []);

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const FilterContent = () => (
    <div className="space-y-6">
      <FilterSection title="Categories">
        {CATEGORIES.map((category) => (
          <div key={category} className="flex items-center gap-2">
            <Checkbox
              id={`category-${category}`}
              checked={filters.categories.includes(category)}
              onCheckedChange={() => toggleCategory(category)}
            />
            <Label
              htmlFor={`category-${category}`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {category}
            </Label>
          </div>
        ))}
      </FilterSection>

      <FilterSection title="Ecosystems">
        {ECOSYSTEMS.map((ecosystem) => (
          <div key={ecosystem} className="flex items-center gap-2">
            <Checkbox
              id={`ecosystem-${ecosystem}`}
              checked={filters.ecosystems.includes(ecosystem)}
              onCheckedChange={() => toggleEcosystem(ecosystem)}
            />
            <Label
              htmlFor={`ecosystem-${ecosystem}`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {ecosystem}
            </Label>
          </div>
        ))}
      </FilterSection>

      <FilterSection title="Use Cases">
        {USE_CASES.map((useCase) => (
          <div key={useCase} className="flex items-center gap-2">
            <Checkbox
              id={`usecase-${useCase}`}
              checked={filters.useCases.includes(useCase)}
              onCheckedChange={() => toggleUseCase(useCase)}
            />
            <Label
              htmlFor={`usecase-${useCase}`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {useCase}
            </Label>
          </div>
        ))}
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore Packages</h1>
          <p className="mt-2 text-muted-foreground">
            Browse {tools.length}+ open-source packages across multiple ecosystems
          </p>

          {/* Search */}
          <div className="mt-6 flex gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-10 h-11"
              />
            </div>

            {/* Mobile filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11 lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
                  <FilterContent />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <FilterContent />
              </ScrollArea>
            </div>
          </aside>

          {/* Tools Grid */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {filteredTools.length} {filteredTools.length === 1 ? 'package' : 'packages'}
                </Badge>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground lg:hidden"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear ({activeFilterCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Grid */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} onScan={handleScan} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No packages found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scan Panel */}
      <ScanPanel
        tool={selectedTool}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}
