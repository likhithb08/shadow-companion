import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Companion } from './pages/Companion';
import { Feed } from './pages/Feed';
import { Updates } from './pages/Updates';
import { Productivity } from './pages/Productivity';
import { Automation } from './pages/Automation';
import { AppProvider } from './context/AppContext';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Companion />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/productivity" element={<Productivity />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
