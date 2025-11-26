
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Companion } from './pages/Companion';
import { Feed } from './pages/Feed';
import { Updates } from './pages/Updates';
import { Productivity } from './pages/Productivity';
import { Automation } from './pages/Automation';
import { Settings } from './pages/Settings';
import { FocusHub } from './pages/FocusHub';
import { Login } from './pages/Login';
import { AppProvider, useApp } from './context/AppContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (!user) {
    return <Login />;
  }
  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={
                <ProtectedRoute><Companion /></ProtectedRoute>
            } />
            <Route path="/intel" element={
                <ProtectedRoute><Updates /></ProtectedRoute>
            } />
            <Route path="/network" element={
                <ProtectedRoute><Feed /></ProtectedRoute>
            } />
            <Route path="/missions" element={
                <ProtectedRoute><Automation /></ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute><Settings /></ProtectedRoute>
            } />
            <Route path="/tasks" element={
                <ProtectedRoute><Productivity /></ProtectedRoute>
            } />
            <Route path="/updates" element={
                <ProtectedRoute><Updates /></ProtectedRoute>
            } />
            <Route path="/focus" element={
                <ProtectedRoute><FocusHub /></ProtectedRoute>
            } />
            <Route path="/behavior" element={
                <ProtectedRoute><FocusHub /></ProtectedRoute>
            } />
            <Route path="/voice" element={
                <ProtectedRoute><Companion /></ProtectedRoute>
            } />
            <Route path="/feed" element={
                <ProtectedRoute><Feed /></ProtectedRoute>
            } />
            <Route path="/productivity" element={
                <ProtectedRoute><Productivity /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
