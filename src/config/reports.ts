/**
 * Reports Configuration
 *
 * Controls which reports are available based on environment variables.
 * Set VITE_AVAILABLE_REPORTS to a comma-separated list of report IDs.
 */

export type ReportId = 'playfly-dashboard' | 'ip-page' | 'brand-partnerships';

export interface ReportConfig {
  id: ReportId;
  name: string;
  description: string;
  enabled: boolean;
}

/**
 * Get the list of enabled report IDs from environment variables
 */
function getEnabledReportIds(): ReportId[] | null {
  const envReports = import.meta.env.VITE_AVAILABLE_REPORTS;

  // If not set or empty, return null (show all reports)
  if (!envReports || envReports.trim() === '') {
    return null;
  }

  // Parse comma-separated list
  return envReports
    .split(',')
    .map((r: string) => r.trim())
    .filter((r: string) => r.length > 0) as ReportId[];
}

/**
 * Check if a specific report is enabled
 */
export function isReportEnabled(reportId: ReportId): boolean {
  const enabledReports = getEnabledReportIds();

  // If null (not configured), all reports are enabled
  if (enabledReports === null) {
    return true;
  }

  // Check if this specific report is in the enabled list
  return enabledReports.includes(reportId);
}

/**
 * Get all available report configurations
 */
export function getAvailableReports(): ReportConfig[] {
  const allReports: Omit<ReportConfig, 'enabled'>[] = [
    {
      id: 'playfly-dashboard',
      name: 'Playfly Dashboard',
      description: 'Real-time campaign management and athlete oversight'
    },
    {
      id: 'ip-page',
      name: 'IP Report',
      description: 'IP impact analysis across all schools'
    },
    {
      id: 'brand-partnerships',
      name: 'Brand Partnerships',
      description: 'Analyze brand performance and partnership gaps'
    }
  ];

  return allReports.map(report => ({
    ...report,
    enabled: isReportEnabled(report.id)
  }));
}

/**
 * Get only enabled reports
 */
export function getEnabledReports(): ReportConfig[] {
  return getAvailableReports().filter(report => report.enabled);
}
