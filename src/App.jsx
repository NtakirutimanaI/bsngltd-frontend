import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import NotFound from './pages/NotFound';
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Project from './pages/Project';
import Service from './pages/Service';
import Team from './pages/Team';
import Testimonial from './pages/Testimonial';
import Updates from './pages/Updates';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UsersManagement from './pages/UsersManagement';
import ProjectsManagement from './pages/ProjectsManagement';

import AttendanceManagement from './pages/AttendanceManagement';
import MessagesManagement from './pages/MessagesManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SitesManagement from './pages/SitesManagement';
import HomeManagement from './pages/HomeManagement';

function RouteController() {
  const location = useLocation();
  useEffect(() => {
    if (window.initTemplate && window.jQuery) {
      setTimeout(() => window.initTemplate(window.jQuery), 100);
    }
  }, [location]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteController />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <Routes>
        <Route path="/404" element={<NotFound />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/" element={<Home />} />
        <Route path="/project" element={<Project />} />
        <Route path="/service" element={<Service />} />
        <Route path="/team" element={<Team />} />
        <Route path="/testimonial" element={<Testimonial />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersManagement />} />
        <Route path="/admin/sites" element={<SitesManagement />} />
        <Route path="/admin/projects" element={<ProjectsManagement />} />
        <Route path="/admin/attendance" element={<AttendanceManagement />} />
        <Route path="/admin/messages" element={<MessagesManagement />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        <Route path="/admin/financial" element={<AnalyticsDashboard />} />
        <Route path="/admin/permissions" element={<AnalyticsDashboard />} />
        <Route path="/admin/cms/home" element={<HomeManagement />} />
        <Route path="/admin/cms/about" element={<AnalyticsDashboard />} />
        <Route path="/admin/cms/services" element={<AnalyticsDashboard />} />
        <Route path="/admin/cms/projects" element={<AnalyticsDashboard />} />
        <Route path="/admin/cms/updates" element={<AnalyticsDashboard />} />
        <Route path="/admin/cms/contact" element={<AnalyticsDashboard />} />
        <Route path="/admin/settings" element={<AnalyticsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
