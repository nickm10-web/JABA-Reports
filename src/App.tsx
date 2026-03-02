import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SchoolReportsPage } from './components/SchoolReportsPage';
import { AuburnReportHub } from './components/AuburnReportHub';
import { BaylorBrandDeals } from './components/BaylorBrandDeals';
import { TyceArmstrongEarnedMediaImpactReport } from './components/TyceArmstrongEarnedMediaImpactReport';
import { OhioStateIPImpact } from './components/OhioStateIPImpact';
import { KentuckyIPImpact } from './components/KentuckyIPImpact';
import { GeorgiaIPImpact } from './components/GeorgiaIPImpact';
import { ClemsonIPImpact } from './components/ClemsonIPImpact';
import { PlayflyReportHub } from './components/PlayflyReportHub';
import { UCLABrandDeals } from './components/UCLABrandDeals';
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
  notredameConfig,
  boiseStateConfig,
  lsuConfig,
  virginiaConfig,
  oldDominionConfig,
  michiganStateConfig,
  uscConfig,
  ncStateConfig,
  pennStateConfig,
  uncConfig,
  texasConfig,
  arizonaConfig,
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

function ClemsonRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <ClemsonIPImpact onBack={canGoBack ? () => navigate('/') : undefined} />;
}

function NotreDameRoute() {
  return <SchoolAthleteReport config={notredameConfig} />;
}

function BoiseStateRoute() {
  return <SchoolAthleteReport config={boiseStateConfig} />;
}

function LSURoute() {
  return <SchoolAthleteReport config={lsuConfig} />;
}

function VirginiaRoute() {
  return <SchoolAthleteReport config={virginiaConfig} />;
}

function OldDominionRoute() {
  return <SchoolAthleteReport config={oldDominionConfig} />;
}

function MichiganStateRoute() {
  return <SchoolAthleteReport config={michiganStateConfig} />;
}

function USCRoute() {
  return <SchoolAthleteReport config={uscConfig} />;
}

function NCStateRoute() {
  return <SchoolAthleteReport config={ncStateConfig} />;
}

function PennStateRoute() {
  return <SchoolAthleteReport config={pennStateConfig} />;
}

function UNCRoute() {
  return <SchoolAthleteReport config={uncConfig} />;
}

function TexasRoute() {
  return <SchoolAthleteReport config={texasConfig} />;
}

function ArizonaRoute() {
  return <SchoolAthleteReport config={arizonaConfig} />;
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
        <Route path="/clemson" element={<ClemsonRoute />} />
        <Route path="/clemson-athlete" element={<Navigate to="/clemson" replace />} />
        <Route path="/clemson-ip" element={<ClemsonRoute />} />
        <Route path="/notre-dame" element={<NotreDameRoute />} />
        <Route path="/notredame" element={<NotreDameRoute />} />
        <Route path="/boise-state" element={<BoiseStateRoute />} />
        <Route path="/boisest" element={<BoiseStateRoute />} />
        <Route path="/lsu" element={<LSURoute />} />
        <Route path="/LSU" element={<LSURoute />} />
        <Route path="/virginia" element={<VirginiaRoute />} />
        <Route path="/Virginia" element={<VirginiaRoute />} />
        <Route path="/old-dominion" element={<OldDominionRoute />} />
        <Route path="/odu" element={<OldDominionRoute />} />
        <Route path="/michigan-state" element={<MichiganStateRoute />} />
        <Route path="/michiganstate" element={<MichiganStateRoute />} />
        <Route path="/MichiganState" element={<MichiganStateRoute />} />
        <Route path="/usc" element={<USCRoute />} />
        <Route path="/USC" element={<USCRoute />} />
        <Route path="/nc-state" element={<NCStateRoute />} />
        <Route path="/ncstate" element={<NCStateRoute />} />
        <Route path="/NCState" element={<NCStateRoute />} />
        <Route path="/penn-state" element={<PennStateRoute />} />
        <Route path="/pennstate" element={<PennStateRoute />} />
        <Route path="/PennState" element={<PennStateRoute />} />
        <Route path="/unc" element={<UNCRoute />} />
        <Route path="/UNC" element={<UNCRoute />} />
        <Route path="/texas" element={<TexasRoute />} />
        <Route path="/Texas" element={<TexasRoute />} />
        <Route path="/arizona" element={<ArizonaRoute />} />
        <Route path="/Arizona" element={<ArizonaRoute />} />
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
