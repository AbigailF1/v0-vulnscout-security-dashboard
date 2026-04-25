import { z } from 'zod';

// OSV Event Schema
export const EventSchema = z.object({
  introduced: z.string().optional(),
  fixed: z.string().optional(),
  last_affected: z.string().optional(),
  limit: z.string().optional(),
});
export type Event = z.infer<typeof EventSchema>;

// OSV Range Schema
export const RangeSchema = z.object({
  type: z.enum(['SEMVER', 'ECOSYSTEM', 'GIT']),
  repo: z.string().optional(),
  events: z.array(EventSchema),
  database_specific: z.record(z.unknown()).optional(),
});
export type Range = z.infer<typeof RangeSchema>;

// OSV Severity Schema
export const SeveritySchema = z.object({
  type: z.enum(['CVSS_V2', 'CVSS_V3', 'CVSS_V4']),
  score: z.string(),
});
export type Severity = z.infer<typeof SeveritySchema>;

// OSV Reference Schema
export const ReferenceSchema = z.object({
  type: z.enum([
    'ADVISORY',
    'ARTICLE',
    'DETECTION',
    'DISCUSSION',
    'REPORT',
    'FIX',
    'GIT',
    'INTRODUCED',
    'PACKAGE',
    'EVIDENCE',
    'WEB',
  ]),
  url: z.string().url(),
});
export type Reference = z.infer<typeof ReferenceSchema>;

// OSV Credit Schema
export const CreditSchema = z.object({
  name: z.string(),
  contact: z.array(z.string()).optional(),
  type: z.enum([
    'FINDER',
    'REPORTER',
    'ANALYST',
    'COORDINATOR',
    'REMEDIATION_DEVELOPER',
    'REMEDIATION_REVIEWER',
    'REMEDIATION_VERIFIER',
    'TOOL',
    'SPONSOR',
    'OTHER',
  ]).optional(),
});
export type Credit = z.infer<typeof CreditSchema>;

// OSV Package Schema
export const PackageSchema = z.object({
  name: z.string(),
  ecosystem: z.string(),
  purl: z.string().optional(),
});
export type Package = z.infer<typeof PackageSchema>;

// OSV Affected Schema
export const AffectedSchema = z.object({
  package: PackageSchema,
  severity: z.array(SeveritySchema).optional(),
  ranges: z.array(RangeSchema).optional(),
  versions: z.array(z.string()).optional(),
  ecosystem_specific: z.record(z.unknown()).optional(),
  database_specific: z.record(z.unknown()).optional(),
});
export type Affected = z.infer<typeof AffectedSchema>;

// OSV Vulnerability Schema (full)
export const VulnerabilitySchema = z.object({
  schema_version: z.string().optional(),
  id: z.string(),
  modified: z.string(),
  published: z.string().optional(),
  withdrawn: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  summary: z.string().optional(),
  details: z.string().optional(),
  severity: z.array(SeveritySchema).optional(),
  affected: z.array(AffectedSchema).optional(),
  references: z.array(ReferenceSchema).optional(),
  credits: z.array(CreditSchema).optional(),
  database_specific: z.record(z.unknown()).optional(),
});
export type Vulnerability = z.infer<typeof VulnerabilitySchema>;

// OSV Query Response Schema
export const OSVQueryResponseSchema = z.object({
  vulns: z.array(VulnerabilitySchema).optional(),
});
export type OSVQueryResponse = z.infer<typeof OSVQueryResponseSchema>;

// Parsed/Enriched Vulnerability for UI
export const EnrichedVulnerabilitySchema = z.object({
  id: z.string(),
  aliases: z.array(z.string()),
  summary: z.string(),
  details: z.string().optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']),
  cvssScore: z.number().nullable(),
  cvssVector: z.string().nullable(),
  published: z.string().nullable(),
  modified: z.string(),
  fixedVersion: z.string().nullable(),
  affectedVersions: z.array(z.string()),
  affectedRanges: z.array(z.object({
    introduced: z.string().optional(),
    fixed: z.string().optional(),
  })),
  references: z.array(z.object({
    type: z.string(),
    url: z.string(),
  })),
  credits: z.array(z.object({
    name: z.string(),
    type: z.string().optional(),
  })),
  packageName: z.string(),
  ecosystem: z.string(),
  cweIds: z.array(z.string()),
  databaseSpecific: z.record(z.unknown()).optional(),
});
export type EnrichedVulnerability = z.infer<typeof EnrichedVulnerabilitySchema>;

// Scan Result Schema
export const ScanResultSchema = z.object({
  package: z.string(),
  ecosystem: z.string(),
  version: z.string(),
  scannedAt: z.string(),
  cachedUntil: z.string().nullable(),
  vulnerabilityCount: z.number(),
  severityDistribution: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    unknown: z.number(),
  }),
  cvssDistribution: z.array(z.object({
    range: z.string(),
    count: z.number(),
  })),
  vulnerabilities: z.array(EnrichedVulnerabilitySchema),
});
export type ScanResult = z.infer<typeof ScanResultSchema>;

// Helper to parse CVSS score from vector string
export function parseCVSSScore(severity: Severity[] | undefined): { score: number | null; vector: string | null; level: string } {
  if (!severity || severity.length === 0) {
    return { score: null, vector: null, level: 'UNKNOWN' };
  }

  // Prefer CVSS_V3, then V4, then V2
  const cvss = severity.find(s => s.type === 'CVSS_V3') 
    || severity.find(s => s.type === 'CVSS_V4')
    || severity.find(s => s.type === 'CVSS_V2');

  if (!cvss) {
    return { score: null, vector: null, level: 'UNKNOWN' };
  }

  const vector = cvss.score;
  
  // Extract numeric score from CVSS vector
  // CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = 9.8
  // Or it might just be a number
  let score: number | null = null;
  
  if (vector.includes('/')) {
    // It's a vector string, we need to calculate or it might have score at end
    const parts = vector.split('/');
    const lastPart = parts[parts.length - 1];
    if (!lastPart.includes(':') && !isNaN(parseFloat(lastPart))) {
      score = parseFloat(lastPart);
    }
  } else if (!isNaN(parseFloat(vector))) {
    score = parseFloat(vector);
  }

  // Determine severity level from score
  let level = 'UNKNOWN';
  if (score !== null) {
    if (score >= 9.0) level = 'CRITICAL';
    else if (score >= 7.0) level = 'HIGH';
    else if (score >= 4.0) level = 'MEDIUM';
    else if (score > 0) level = 'LOW';
  }

  return { score, vector, level };
}

// Helper to extract fixed version from ranges
export function extractFixedVersion(affected: Affected[] | undefined, packageName: string): string | null {
  if (!affected) return null;
  
  for (const aff of affected) {
    if (aff.package.name === packageName && aff.ranges) {
      for (const range of aff.ranges) {
        for (const event of range.events) {
          if (event.fixed) return event.fixed;
        }
      }
    }
  }
  
  return null;
}

// Helper to extract CWE IDs from database_specific
export function extractCWEIds(databaseSpecific: Record<string, unknown> | undefined): string[] {
  if (!databaseSpecific) return [];
  
  const cwes: string[] = [];
  
  // GitHub format
  if (databaseSpecific.cwe_ids && Array.isArray(databaseSpecific.cwe_ids)) {
    cwes.push(...databaseSpecific.cwe_ids);
  }
  
  // Generic format
  if (databaseSpecific.cwes && Array.isArray(databaseSpecific.cwes)) {
    for (const cwe of databaseSpecific.cwes) {
      if (typeof cwe === 'string') cwes.push(cwe);
      else if (typeof cwe === 'object' && cwe && 'cweId' in cwe) {
        cwes.push(String(cwe.cweId));
      }
    }
  }
  
  return cwes;
}

// Enrich raw OSV vulnerability for UI
export function enrichVulnerability(vuln: Vulnerability, packageName: string, ecosystem: string): EnrichedVulnerability {
  const { score, vector, level } = parseCVSSScore(vuln.severity);
  const fixedVersion = extractFixedVersion(vuln.affected, packageName);
  
  // Get affected versions
  const affectedVersions: string[] = [];
  const affectedRanges: { introduced?: string; fixed?: string }[] = [];
  
  for (const aff of vuln.affected || []) {
    if (aff.package.name === packageName) {
      if (aff.versions) {
        affectedVersions.push(...aff.versions);
      }
      if (aff.ranges) {
        for (const range of aff.ranges) {
          let introduced: string | undefined;
          let fixed: string | undefined;
          for (const event of range.events) {
            if (event.introduced) introduced = event.introduced;
            if (event.fixed) fixed = event.fixed;
          }
          if (introduced || fixed) {
            affectedRanges.push({ introduced, fixed });
          }
        }
      }
    }
  }
  
  return {
    id: vuln.id,
    aliases: vuln.aliases || [],
    summary: vuln.summary || 'No summary available',
    details: vuln.details,
    severity: level as EnrichedVulnerability['severity'],
    cvssScore: score,
    cvssVector: vector,
    published: vuln.published || null,
    modified: vuln.modified,
    fixedVersion,
    affectedVersions: affectedVersions.slice(0, 10), // Limit for UI
    affectedRanges,
    references: (vuln.references || []).map(ref => ({
      type: ref.type,
      url: ref.url,
    })),
    credits: (vuln.credits || []).map(credit => ({
      name: credit.name,
      type: credit.type,
    })),
    packageName,
    ecosystem,
    cweIds: extractCWEIds(vuln.database_specific),
    databaseSpecific: vuln.database_specific,
  };
}
