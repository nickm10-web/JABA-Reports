import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SchoolReportsPage } from './components/SchoolReportsPage';
import { AuburnReportHub } from './components/AuburnReportHub';
import { BaylorBrandDeals } from './components/BaylorBrandDeals';
import { TyceArmstrongEarnedMediaImpactReport } from './components/TyceArmstrongEarnedMediaImpactReport';
import { OhioStateIPImpact } from './components/OhioStateIPImpact';
import { KentuckyIPImpact } from './components/KentuckyIPImpact';
import { GeorgiaIPImpact } from './components/GeorgiaIPImpact';
import { PlayflyReportHub } from './components/PlayflyReportHub';
import { UCLABrandDeals } from './components/UCLABrandDeals';
import { NotreDameBrandDeals } from './components/NotreDameBrandDeals';
import { NilReport } from './components/NilReport';
import { SchoolAthleteReport } from './components/SchoolAthleteReport';
import { QCollarReport } from './components/QCollarReport';
import { PostgameReport } from './components/PostgameReport';
import { AuburnDudewipesCampaign } from './components/AuburnDudewipesCampaign';
import {
  michiganConfig,
  alabamaConfig,
  arkansasConfig,
  oklahomaConfig,
  wisconsinConfig,
  boiseStateConfig,
} from './config/schoolConfigs';

// Wrapper components that provide navigation
// Only show back button if user navigated from within the app
function AuburnRoute() {
  return <AuburnReportHub />;
}

function AuburnHeyDudeRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <AuburnDudewipesCampaign onBack={canGoBack ? () => navigate('/auburn') : undefined} />;
}

function BaylorRoute() {
  return <BaylorBrandDeals />;
}

function BaylorEarnedMediaImpactRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <TyceArmstrongEarnedMediaImpactReport onBack={canGoBack ? () => navigate('/') : undefined} />;
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

function PlayflyRoute() {
  return <PlayflyReportHub />;
}

function UCLARoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <UCLABrandDeals onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function MichiganRoute() {
  return <SchoolAthleteReport config={michiganConfig} />;
}

function AlabamaRoute() {
  return <SchoolAthleteReport config={alabamaConfig} />;
}

function ArkansasRoute() {
  return <SchoolAthleteReport config={arkansasConfig} />;
}

function OklahomaRoute() {
  return <SchoolAthleteReport config={oklahomaConfig} />;
}

function WisconsinRoute() {
  return <SchoolAthleteReport config={wisconsinConfig} />;
}

function NotreDameRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <NotreDameBrandDeals onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function BoiseStateRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <NilReport config={boiseStateConfig} onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function QCollarRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <QCollarReport onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function PostgameRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <PostgameReport onBack={canGoBack ? () => navigate('/') : undefined} />;
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
        <Route path="/auburn/dudewipes" element={<AuburnHeyDudeRoute />} />
        <Route path="/auburn/heydude" element={<Navigate to="/auburn/dudewipes" replace />} />
        <Route path="/baylor" element={<BaylorRoute />} />
        <Route path="/baylor/tyce" element={<BaylorEarnedMediaImpactRoute />} />
        <Route path="/baylor-earned-media-impact" element={<BaylorEarnedMediaImpactRoute />} />
        <Route path="/tyce-armstrong-earned-media-impact" element={<BaylorEarnedMediaImpactRoute />} />
        <Route path="/ohiostate" element={<OhioStateRoute />} />
        <Route path="/kentucky" element={<KentuckyRoute />} />
        <Route path="/georgia" element={<GeorgiaRoute />} />
        <Route path="/michigan" element={<MichiganRoute />} />
        <Route path="/playfly" element={<PlayflyRoute />} />
        <Route path="/ucla" element={<UCLARoute />} />
        <Route path="/alabama" element={<AlabamaRoute />} />
        <Route path="/alabama-nil" element={<AlabamaRoute />} />
        <Route path="/arkansas" element={<ArkansasRoute />} />
        <Route path="/arkansas-nil" element={<ArkansasRoute />} />
        <Route path="/oklahoma" element={<OklahomaRoute />} />
        <Route path="/wisconsin" element={<WisconsinRoute />} />
        <Route path="/notre-dame" element={<NotreDameRoute />} />
        <Route path="/notredame" element={<NotreDameRoute />} />
        <Route path="/boise-state" element={<BoiseStateRoute />} />
        <Route path="/q-collar" element={<QCollarRoute />} />
        <Route path="/qcollar" element={<QCollarRoute />} />
        <Route path="/postgame" element={<PostgameRoute />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
