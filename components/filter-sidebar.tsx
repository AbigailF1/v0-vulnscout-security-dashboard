'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { categories, ecosystems, useCases } from '@/lib/tools-data';
import type { Category, Ecosystem, UseCase, Filters } from '@/lib/types';
import { Filter, Layers, Package, Briefcase } from 'lucide-react';

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const toggleCategory = (category: Category) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: updated });
  };

  const toggleEcosystem = (ecosystem: Ecosystem) => {
    const updated = filters.ecosystems.includes(ecosystem)
      ? filters.ecosystems.filter((e) => e !== ecosystem)
      : [...filters.ecosystems, ecosystem];
    onFiltersChange({ ...filters, ecosystems: updated });
  };

  const toggleUseCase = (useCase: UseCase) => {
    const updated = filters.useCases.includes(useCase)
      ? filters.useCases.filter((u) => u !== useCase)
      : [...filters.useCases, useCase];
    onFiltersChange({ ...filters, useCases: updated });
  };

  return (
    <aside className="w-64 shrink-0 glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Filters</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-240px)]">
        <div className="space-y-6 pr-4">
          {/* Categories */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Categories
              </h3>
            </div>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Ecosystems */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Ecosystems
              </h3>
            </div>
            <div className="space-y-2">
              {ecosystems.map((ecosystem) => (
                <div key={ecosystem} className="flex items-center gap-2">
                  <Checkbox
                    id={`ecosystem-${ecosystem}`}
                    checked={filters.ecosystems.includes(ecosystem)}
                    onCheckedChange={() => toggleEcosystem(ecosystem)}
                  />
                  <Label
                    htmlFor={`ecosystem-${ecosystem}`}
                    className="text-sm cursor-pointer text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {ecosystem}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Use Cases
              </h3>
            </div>
            <div className="space-y-2">
              {useCases.map((useCase) => (
                <div key={useCase} className="flex items-center gap-2">
                  <Checkbox
                    id={`usecase-${useCase}`}
                    checked={filters.useCases.includes(useCase)}
                    onCheckedChange={() => toggleUseCase(useCase)}
                  />
                  <Label
                    htmlFor={`usecase-${useCase}`}
                    className="text-sm cursor-pointer text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {useCase}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
