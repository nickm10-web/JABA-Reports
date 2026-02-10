import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SchoolReportsPage } from './components/SchoolReportsPage';
import { AuburnReportHub } from './components/AuburnReportHub';
import { BaylorReportHub } from './components/BaylorReportHub';
import { OhioStateReportHub } from './components/OhioStateReportHub';
import { KentuckyReportHub } from './components/KentuckyReportHub';
import { PlayflyReportHub } from './components/PlayflyReportHub';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SchoolReportsPage />} />
        <Route path="/auburn" element={<AuburnReportHub />} />
        <Route path="/baylor" element={<BaylorReportHub />} />
        <Route path="/ohio-state" element={<OhioStateReportHub />} />
        <Route path="/kentucky" element={<KentuckyReportHub />} />
        <Route path="/playfly" element={<PlayflyReportHub />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
