export const runtime = 'edge';

import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageName, ecosystem, currentVersion } = body;

    if (!packageName || !ecosystem) {
      return Response.json(
        { error: 'Missing required fields: packageName, ecosystem' },
        { status: 400 }
      );
    }

    // Query OSV API for vulnerabilities
    const osvQuery: Record<string, unknown> = {
      package: {
        name: packageName,
        ecosystem,
      },
    };

    if (currentVersion) {
      osvQuery.version = currentVersion;
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

    const data = await osvResponse.json();
    const vulns = data.vulns || [];

    if (vulns.length === 0) {
      return Response.json({
        packageName,
        ecosystem,
        currentVersion: currentVersion || 'latest',
        vulnerabilityCount: 0,
        isSecure: true,
        message: 'No known vulnerabilities found for this package version.',
        patches: [],
      });
    }

    // Extract all fixed versions from all vulnerabilities
    const patchVersions = new Map<string, { version: string; fixes: string[] }>();

    for (const vuln of vulns) {
      const vulnId = vuln.id;
      
      for (const affected of vuln.affected || []) {
        if (affected.package.name !== packageName) continue;
        
        if (affected.ranges) {
          for (const range of affected.ranges) {
            for (const event of range.events || []) {
              if (event.fixed) {
                const version = event.fixed;
                if (!patchVersions.has(version)) {
                  patchVersions.set(version, { version, fixes: [] });
                }
                patchVersions.get(version)!.fixes.push(vulnId);
              }
            }
          }
        }
      }
    }

    // Convert to array and sort by number of fixes (most comprehensive first)
    const patches = Array.from(patchVersions.values())
      .sort((a, b) => b.fixes.length - a.fixes.length)
      .map(p => ({
        version: p.version,
        fixesCount: p.fixes.length,
        fixedVulnerabilities: p.fixes,
      }));

    // Find the recommended version (the one that fixes the most vulnerabilities)
    const recommendedVersion = patches.length > 0 ? patches[0].version : null;

    // Generate upgrade command based on ecosystem
    let upgradeCommand = '';
    if (recommendedVersion) {
      switch (ecosystem) {
        case 'npm':
          upgradeCommand = `npm install ${packageName}@${recommendedVersion}`;
          break;
        case 'PyPI':
          upgradeCommand = `pip install ${packageName}==${recommendedVersion}`;
          break;
        case 'Go':
          upgradeCommand = `go get ${packageName}@v${recommendedVersion}`;
          break;
        case 'Maven':
          upgradeCommand = `Update pom.xml: <version>${recommendedVersion}</version>`;
          break;
        case 'Packagist':
          upgradeCommand = `composer require ${packageName}:${recommendedVersion}`;
          break;
        case 'RubyGems':
          upgradeCommand = `gem install ${packageName} -v ${recommendedVersion}`;
          break;
        case 'crates.io':
          upgradeCommand = `cargo add ${packageName}@${recommendedVersion}`;
          break;
        case 'NuGet':
          upgradeCommand = `dotnet add package ${packageName} --version ${recommendedVersion}`;
          break;
        default:
          upgradeCommand = `Upgrade ${packageName} to version ${recommendedVersion}`;
      }
    }

    return Response.json({
      packageName,
      ecosystem,
      currentVersion: currentVersion || 'all versions',
      vulnerabilityCount: vulns.length,
      isSecure: false,
      recommendedVersion,
      upgradeCommand,
      patches,
      message: recommendedVersion 
        ? `Found ${vulns.length} vulnerabilities. Upgrade to ${recommendedVersion} to fix ${patches[0]?.fixesCount || 0} of them.`
        : `Found ${vulns.length} vulnerabilities but no automatic patch version available.`,
    });
  } catch (error) {
    console.error('MCP get_patch_version error:', error);
    return Response.json(
      { error: 'Failed to get patch version' },
      { status: 500 }
    );
  }
}
