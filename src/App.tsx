import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SchoolReportsPage } from './components/SchoolReportsPage';
import { AuburnCampaignOverview } from './components/AuburnCampaignOverview';
import { BaylorBrandDeals } from './components/BaylorBrandDeals';
import { OhioStateReportHub } from './components/OhioStateReportHub';
import { KentuckyReportHub } from './components/KentuckyReportHub';
import { PlayflyReportHub } from './components/PlayflyReportHub';

// Wrapper components that provide navigation
// Only show back button if user navigated from within the app
function AuburnRoute() {
  return <AuburnCampaignOverview />;
}

function BaylorRoute() {
  return <BaylorBrandDeals />;
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
  return <PlayflyReportHub />;
}

// Handle ?playfly query param - show Playfly hub without back button
function HomeRoute() {
  const [searchParams] = useSearchParams();
  if (searchParams.has('playfly')) {
    return <PlayflyReportHub />;
  }
  return <SchoolReportsPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
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
