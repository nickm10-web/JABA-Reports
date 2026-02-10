import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SchoolReportsPage } from './components/SchoolReportsPage';
import { AuburnReportHub } from './components/AuburnReportHub';
import { BaylorReportHub } from './components/BaylorReportHub';
import { OhioStateReportHub } from './components/OhioStateReportHub';
import { KentuckyReportHub } from './components/KentuckyReportHub';
import { PlayflyReportHub } from './components/PlayflyReportHub';

// Wrapper components that provide navigation
function AuburnRoute() {
  const navigate = useNavigate();
  return <AuburnReportHub onBack={() => navigate('/')} />;
}

function BaylorRoute() {
  const navigate = useNavigate();
  return <BaylorReportHub onBack={() => navigate('/')} />;
}

function OhioStateRoute() {
  const navigate = useNavigate();
  return <OhioStateReportHub onBack={() => navigate('/')} />;
}

function KentuckyRoute() {
  const navigate = useNavigate();
  return <KentuckyReportHub onBack={() => navigate('/')} />;
}

function PlayflyRoute() {
  const navigate = useNavigate();
  return <PlayflyReportHub onBack={() => navigate('/')} />;
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
