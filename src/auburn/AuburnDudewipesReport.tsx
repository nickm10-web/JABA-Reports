import { AuburnDudewipesCampaign } from '../components/AuburnDudewipesCampaign';

interface AuburnDudewipesReportProps {
  onBack?: () => void;
}

export function AuburnDudewipesReport({ onBack }: AuburnDudewipesReportProps) {
  return <AuburnDudewipesCampaign onBack={onBack} />;
}

export default AuburnDudewipesReport;
