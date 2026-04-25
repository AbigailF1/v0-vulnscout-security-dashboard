'use client';

import { Input } from '@/components/ui/input';
import { Shield, Search } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Hero({ searchQuery, onSearchChange }: HeroProps) {
  return (
    <header className="relative overflow-hidden py-16 px-6">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="gradient-text">VulnScout</span>
          </h1>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 text-balance">
          Discover safer open-source tools
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Filter tools by stack, ecosystem, and use case — then scan packages for known vulnerabilities using OSV.
        </p>

        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tools by name, category, or ecosystem..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-6 text-base bg-card/50 backdrop-blur-sm border-border rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
    </header>
  );
}
