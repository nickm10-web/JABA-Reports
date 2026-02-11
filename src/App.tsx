import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SchoolReportsPage } from './components/SchoolReportsPage';
import { AuburnCampaignOverview } from './components/AuburnCampaignOverview';
import { BaylorReportHub } from './components/BaylorReportHub';
import { OhioStateReportHub } from './components/OhioStateReportHub';
import { KentuckyReportHub } from './components/KentuckyReportHub';
import { PlayflyReportHub } from './components/PlayflyReportHub';

// Wrapper components that provide navigation
// Only show back button if user navigated from within the app
function AuburnRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <AuburnCampaignOverview onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function BaylorRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <BaylorReportHub onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function OhioStateRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <OhioStateReportHub onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function KentuckyRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <KentuckyReportHub onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function PlayflyRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <PlayflyReportHub onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SchoolReportsPage />} />
        <Route path="/auburn" element={<AuburnRoute />} />
        <Route path="/baylor" element={<BaylorRoute />} />
        <Route path="/ohio-state" element={<OhioStateRoute />} />
        <Route path="/kentucky" element={<KentuckyRoute />} />
        <Route path="/playfly" element={<PlayflyRoute />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
