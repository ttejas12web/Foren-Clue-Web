/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { motion, AnimatePresence } from 'motion/react';
import BookPopup from './components/ui/BookPopup';
import { GoogleOneTap } from './components/ui/GoogleOneTap';

import { Loader2, WifiOff } from 'lucide-react';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Courses = lazy(() => import('./pages/Courses'));
const Cases = lazy(() => import('./pages/Cases'));
const Careers = lazy(() => import('./pages/Careers'));
const Community = lazy(() => import('./pages/Community'));
const Services = lazy(() => import('./pages/Services'));
const EBooks = lazy(() => import('./pages/EBooks'));
const Contact = lazy(() => import('./pages/Contact'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer'));
const MyDoubts = lazy(() => import('./pages/MyDoubts'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 size={40} className="animate-spin text-warning" />
    </div>
  );
}

function RootShareResolver() {
  const { id } = useParams();
  const reserved = [
    'about', 'courses', 'cases', 'careers', 'community', 'services', 
    'ebooks', 'contact', 'privacy', 'terms', 'profile', 'dashboard', 'login', 'admin'
  ];
  if (id && reserved.includes(id.toLowerCase())) {
    return <Navigate to={`/${id}`} replace />;
  }
  return <Navigate to={`/ebooks?id=${id}`} replace />;
}

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 border-b border-red-500/50 flex items-center justify-center py-2 px-4 gap-3 shadow-lg"
          >
            <WifiOff size={16} className="text-text-main" />
            <span className="text-xs font-black uppercase tracking-widest text-text-main">Connection Lost. Operating in offline mode.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <ScrollToTop />
      <BookPopup />
      <GoogleOneTap />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/player/:courseId" element={<CoursePlayer />} />
          <Route path="*" element={
            <>
              <Navbar />
              <main className="flex-grow pt-20">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/cases" element={<Cases />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/community/my-doubts" element={<MyDoubts />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/ebooks" element={<EBooks />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/:id" element={<RootShareResolver />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </Suspense>
    </div>
  );
}
