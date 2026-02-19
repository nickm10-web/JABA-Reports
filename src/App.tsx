import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SchoolReportsPage } from './components/SchoolReportsPage';
import { AuburnCampaignOverview } from './components/AuburnCampaignOverview';
import { BaylorBrandDeals } from './components/BaylorBrandDeals';
import { OhioStateIPImpact } from './components/OhioStateIPImpact';
import { KentuckyIPImpact } from './components/KentuckyIPImpact';
import { GeorgiaIPImpact } from './components/GeorgiaIPImpact';
import { MichiganIPImpact } from './components/MichiganIPImpact';
import { PlayflyReportHub } from './components/PlayflyReportHub';
import { UCLABrandDeals } from './components/UCLABrandDeals';
import { NilReport } from './components/NilReport';
import {
  michiganConfig,
  alabamaConfig,
  arkansasConfig,
  oklahomaConfig,
  notredameConfig,
  boiseStateConfig,
} from './config/schoolConfigs';

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
  return <OhioStateIPImpact onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function KentuckyRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <KentuckyIPImpact onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function GeorgiaRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <GeorgiaIPImpact onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function MichiganRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <MichiganIPImpact onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function PlayflyRoute() {
  return <PlayflyReportHub />;
}

function UCLARoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <UCLABrandDeals onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function MichiganNilRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <NilReport config={michiganConfig} onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function AlabamaRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <NilReport config={alabamaConfig} onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function ArkansasRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <NilReport config={arkansasConfig} onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function OklahomaRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <NilReport config={oklahomaConfig} onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function NotreDameRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <NilReport config={notredameConfig} onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function BoiseStateRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <NilReport config={boiseStateConfig} onBack={canGoBack ? () => navigate('/') : undefined} />;
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
        <Route path="/ohiostate" element={<OhioStateRoute />} />
        <Route path="/kentucky" element={<KentuckyRoute />} />
        <Route path="/georgia" element={<GeorgiaRoute />} />
        <Route path="/michigan" element={<MichiganRoute />} />
        <Route path="/playfly" element={<PlayflyRoute />} />
        <Route path="/ucla" element={<UCLARoute />} />
        <Route path="/michigan-nil" element={<MichiganNilRoute />} />
        <Route path="/alabama-nil" element={<AlabamaRoute />} />
        <Route path="/arkansas-nil" element={<ArkansasRoute />} />
        <Route path="/oklahoma" element={<OklahomaRoute />} />
        <Route path="/notre-dame" element={<NotreDameRoute />} />
        <Route path="/boise-state" element={<BoiseStateRoute />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
