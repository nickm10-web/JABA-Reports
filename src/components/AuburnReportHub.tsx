import { AuburnCampaignOverview } from './AuburnCampaignOverview';

interface AuburnReportHubProps {
  onBack?: () => void;
}

export function AuburnReportHub({ onBack }: AuburnReportHubProps) {
  return <AuburnCampaignOverview onBack={onBack} />;
}
