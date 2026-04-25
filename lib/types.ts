export type Category = 'Backend' | 'Frontend' | 'DevOps' | 'Security' | 'Monitoring' | 'Database' | 'AI';

export type Ecosystem = 'npm' | 'PyPI' | 'Go' | 'Maven' | 'crates.io' | 'RubyGems';

export type UseCase = 
  | 'Auth' 
  | 'Logging' 
  | 'Observability' 
  | 'Vulnerability scanning' 
  | 'CI/CD' 
  | 'API security' 
  | 'Web framework' 
  | 'Database client'
  | 'Utility'
  | 'API client';

export type RiskLevel = 'Not scanned' | 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  ecosystem: Ecosystem;
  useCase: UseCase;
  riskLevel: RiskLevel;
  defaultVersion?: string;
}

export interface Vulnerability {
  id: string;
  summary: string;
  details: string;
  published: string;
  modified: string;
  severity: string;
  references: string[];
}

export interface ScanResult {
  package: string;
  ecosystem: string;
  version: string;
  vulnerabilityCount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  vulnerabilities: Vulnerability[];
  recommendation: string;
}

export interface ScanRequest {
  name: string;
  ecosystem: string;
  version: string;
}

export interface Filters {
  categories: Category[];
  ecosystems: Ecosystem[];
  useCases: UseCase[];
  search: string;
}
