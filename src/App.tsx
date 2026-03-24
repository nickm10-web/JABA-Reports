import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SchoolReportsPage } from './components/SchoolReportsPage';
import { AuburnReportHub } from './components/AuburnReportHub';
import { BaylorBrandDeals } from './components/BaylorBrandDeals';
import { TyceArmstrongEarnedMediaImpactReport } from './components/TyceArmstrongEarnedMediaImpactReport';
import { OhioStateIPImpact } from './components/OhioStateIPImpact';
import { KentuckyIPImpact } from './components/KentuckyIPImpact';
import { GeorgiaIPImpact } from './components/GeorgiaIPImpact';
import { ClemsonIPImpact } from './components/ClemsonIPImpact';
import { ClemsonReportHub } from './components/ClemsonReportHub';
import { ClemsonHardeesCampaignReport } from './components/ClemsonHardeesCampaignReport';
import { RutgersIPImpact } from './components/RutgersIPImpact';
import { VirginiaIPImpact } from './components/VirginiaIPImpact';
import { ArizonaIPImpact } from './components/ArizonaIPImpact';
import { PlayflyReportHub } from './components/PlayflyReportHub';
import { UCLABrandDeals } from './components/UCLABrandDeals';
import { SchoolAthleteReport } from './components/SchoolAthleteReport';
import { QCollarReport } from './components/QCollarReport';
import { PostgameReport } from './components/PostgameReport';
import { AuburnDudewipesCampaign } from './components/AuburnDudewipesCampaign';
import { AuburnAmsterdamCafeReport } from './components/AuburnAmsterdamCafeReport';
import { ReligionOfSportReport } from './components/ReligionOfSportReport';
import {
  michiganConfig,
  alabamaConfig,
  arkansasConfig,
  oklahomaConfig,
  wisconsinConfig,
  notredameConfig,
  boiseStateConfig,
  lsuConfig,
  missouriConfig,
  iowaConfig,
  mississippiStateConfig,
  minnesotaConfig,
  oldDominionConfig,
  michiganStateConfig,
  uscConfig,
  ncStateConfig,
  pennStateConfig,
  washingtonConfig,
  washingtonStateConfig,
  uncConfig,
  texasConfig,
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

function AuburnDDnDRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <AuburnAmsterdamCafeReport onBack={canGoBack ? () => navigate('/auburn') : undefined} />;
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
  return <ClemsonReportHub />;
}

function ClemsonIPRoute() {
  const navigate = useNavigate();
  return <ClemsonIPImpact onBack={() => navigate('/clemson')} />;
}

function ClemsonHardeesRoute() {
  const navigate = useNavigate();
  return <ClemsonHardeesCampaignReport onBack={() => navigate('/clemson')} />;
}

function RutgersRoute() {
  return <RutgersIPImpact />;
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

function MizzouRoute() {
  return <SchoolAthleteReport config={missouriConfig} />;
}

function IowaRoute() {
  return <SchoolAthleteReport config={iowaConfig} />;
}

function MississippiStateRoute() {
  return <SchoolAthleteReport config={mississippiStateConfig} />;
}

function MinnesotaRoute() {
  return <SchoolAthleteReport config={minnesotaConfig} />;
}

function VirginiaRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <VirginiaIPImpact onBack={canGoBack ? () => navigate('/') : undefined} />;
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

function WashingtonStateRoute() {
  return <SchoolAthleteReport config={washingtonStateConfig} />;
}

function WashingtonRoute() {
  return <SchoolAthleteReport config={washingtonConfig} />;
}

function UNCRoute() {
  return <SchoolAthleteReport config={uncConfig} />;
}

function TexasRoute() {
  return <SchoolAthleteReport config={texasConfig} />;
}

function ArizonaRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <ArizonaIPImpact onBack={canGoBack ? () => navigate('/') : undefined} />;
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

function ReligionOfSportRoute() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 2;
  return <ReligionOfSportReport onBack={canGoBack ? () => navigate('/') : undefined} />;
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
        <Route path="/auburn/ddnd" element={<AuburnDDnDRoute />} />
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
        <Route path="/clemson/hardees" element={<ClemsonHardeesRoute />} />
        <Route path="/clemson/ip" element={<ClemsonIPRoute />} />
        <Route path="/clemson-athlete" element={<Navigate to="/clemson/ip" replace />} />
        <Route path="/clemson-ip" element={<Navigate to="/clemson/ip" replace />} />
        <Route path="/rutgers" element={<RutgersRoute />} />
        <Route path="/rutgers-ip" element={<RutgersRoute />} />
        <Route path="/notre-dame" element={<NotreDameRoute />} />
        <Route path="/notredame" element={<NotreDameRoute />} />
        <Route path="/boise-state" element={<BoiseStateRoute />} />
        <Route path="/boisest" element={<BoiseStateRoute />} />
        <Route path="/lsu" element={<LSURoute />} />
        <Route path="/LSU" element={<LSURoute />} />
        <Route path="/mizzou" element={<MizzouRoute />} />
        <Route path="/Mizzou" element={<MizzouRoute />} />
        <Route path="/iowa" element={<IowaRoute />} />
        <Route path="/Iowa" element={<IowaRoute />} />
        <Route path="/mississippi-state" element={<MississippiStateRoute />} />
        <Route path="/mississippistate" element={<MississippiStateRoute />} />
        <Route path="/MississippiState" element={<MississippiStateRoute />} />
        <Route path="/hailstate" element={<MississippiStateRoute />} />
        <Route path="/HailState" element={<MississippiStateRoute />} />
        <Route path="/minnesota" element={<MinnesotaRoute />} />
        <Route path="/Minnesota" element={<MinnesotaRoute />} />
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
        <Route path="/washington" element={<WashingtonRoute />} />
        <Route path="/Washington" element={<WashingtonRoute />} />
        <Route path="/washington-state" element={<WashingtonStateRoute />} />
        <Route path="/washingtonstate" element={<WashingtonStateRoute />} />
        <Route path="/unc" element={<UNCRoute />} />
        <Route path="/UNC" element={<UNCRoute />} />
        <Route path="/texas" element={<TexasRoute />} />
        <Route path="/Texas" element={<TexasRoute />} />
        <Route path="/arizona" element={<ArizonaRoute />} />
        <Route path="/Arizona" element={<ArizonaRoute />} />
        <Route path="/q-collar" element={<QCollarRoute />} />
        <Route path="/qcollar" element={<QCollarRoute />} />
        <Route path="/postgame" element={<PostgameRoute />} />
        <Route path="/religion-of-sport" element={<ReligionOfSportRoute />} />
        <Route path="/religion-of-sports" element={<ReligionOfSportRoute />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
