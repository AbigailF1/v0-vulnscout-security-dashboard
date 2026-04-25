import { NextRequest, NextResponse } from 'next/server';
import { 
  OSVQueryResponseSchema, 
  enrichVulnerability, 
  type ScanResult,
  type EnrichedVulnerability 
} from '@/lib/osv-schemas';
import { getCacheKey, getCachedResult, setCachedResult, getCacheExpiry, isCacheAvailable } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, ecosystem, version } = body;

    if (!name || !ecosystem) {
      return NextResponse.json(
        { error: 'Missing required fields: name, ecosystem' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(name, ecosystem, version);
    const cached = await getCachedResult(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    // Build OSV query - version is optional
    const osvQuery: Record<string, unknown> = {
      package: {
        name,
        ecosystem,
      },
    };

    if (version) {
      osvQuery.version = version;
    }

    const osvResponse = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(osvQuery),
    });

    if (!osvResponse.ok) {
      throw new Error(`OSV API error: ${osvResponse.status}`);
    }

    const rawData = await osvResponse.json();
    
    // Parse with Zod schema
    const parseResult = OSVQueryResponseSchema.safeParse(rawData);
    
    if (!parseResult.success) {
      console.error('OSV schema parse error:', parseResult.error);
      // Continue with raw data, but log the issue
    }
    
    const data = parseResult.success ? parseResult.data : rawData;
    const vulns = data.vulns || [];

    // Enrich vulnerabilities for UI
    const enrichedVulns: EnrichedVulnerability[] = vulns.map(vuln => 
      enrichVulnerability(vuln, name, ecosystem)
    );

    // Calculate severity distribution
    const severityDistribution = {
      critical: enrichedVulns.filter(v => v.severity === 'CRITICAL').length,
      high: enrichedVulns.filter(v => v.severity === 'HIGH').length,
      medium: enrichedVulns.filter(v => v.severity === 'MEDIUM').length,
      low: enrichedVulns.filter(v => v.severity === 'LOW').length,
      unknown: enrichedVulns.filter(v => v.severity === 'UNKNOWN').length,
    };

    // Calculate CVSS distribution (ranges)
    const cvssRanges = [
      { range: '9.0-10.0', min: 9.0, max: 10.1, count: 0 },
      { range: '7.0-8.9', min: 7.0, max: 9.0, count: 0 },
      { range: '4.0-6.9', min: 4.0, max: 7.0, count: 0 },
      { range: '0.1-3.9', min: 0.1, max: 4.0, count: 0 },
      { range: 'Unknown', min: -1, max: 0.1, count: 0 },
    ];

    for (const vuln of enrichedVulns) {
      const score = vuln.cvssScore;
      if (score === null) {
        cvssRanges[4].count++;
      } else {
        for (const range of cvssRanges) {
          if (score >= range.min && score < range.max) {
            range.count++;
            break;
          }
        }
      }
    }

    const cvssDistribution = cvssRanges.map(r => ({
      range: r.range,
      count: r.count,
    }));

    // Sort vulnerabilities by severity
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
    enrichedVulns.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const scannedAt = new Date().toISOString();
    const cachedUntil = isCacheAvailable() ? getCacheExpiry() : null;

    const result: ScanResult = {
      package: name,
      ecosystem,
      version: version || 'all versions',
      scannedAt,
      cachedUntil,
      vulnerabilityCount: enrichedVulns.length,
      severityDistribution,
      cvssDistribution,
      vulnerabilities: enrichedVulns,
    };

    // Cache the result
    await setCachedResult(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('OSV scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan package. Please try again.' },
      { status: 500 }
    );
  }
}
