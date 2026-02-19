// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report
// Wraps the generic NilReport with UCLA-specific config.
// ═══════════════════════════════════════════════════════════════
import { NilReport } from './NilReport';
import { uclaConfig } from '../config/schoolConfigs';

interface UCLAReportProps {
  onBack?: () => void;
}

export function UCLAReport({ onBack }: UCLAReportProps) {
  return <NilReport config={uclaConfig} onBack={onBack} />;
}
