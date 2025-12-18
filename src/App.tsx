import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import Exam from './pages/Exam'
import Results from './pages/Results'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Import from './pages/Import'

// Import exam components
import Biology12 from './pages/exams/Biology12'
import Chemistry10 from './pages/exams/Chemistry10'
import Chemistry11 from './pages/exams/Chemistry11'
import Physics10 from './pages/exams/Physics10'
import Physics11 from './pages/exams/Physics11'
import { logger } from './utils/logger'

// Main app content wrapped in error boundary
function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white font-arabic">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="exam/:id" element={<Exam />} />
            <Route path="results/:examId" element={<Results />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/import" element={<Import />} />
          </Route>
          
          {/* Direct exam routes */}
          <Route path="/exams/biology-12" element={<Biology12 />} />
          <Route path="/exams/chemistry-10" element={<Chemistry10 />} />
          <Route path="/exams/chemistry-11" element={<Chemistry11 />} />
          <Route path="/exams/physics-10" element={<Physics10 />} />
          <Route path="/exams/physics-11" element={<Physics11 />} />
        </Routes>
      </div>
    </Router>
  )
}

function App() {
  React.useEffect(() => {
    // Log app initialization
    logger.info('Application starting', 'APP_INIT', {
      version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0',
      environment: import.meta.env.DEV ? 'development' : 'production',
      userAgent: navigator.userAgent,
    })
  }, [])

  return (
    <ErrorBoundary context="APP_ROOT">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}

// Authentication removed: all routes are accessible without login

export default App
