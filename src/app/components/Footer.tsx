import { Link } from 'react-router';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { MISModal } from './MISModal';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { getSetting } = useSettings();
  const { t, dt } = useLanguage();
  const [isMISModalOpen, setIsMISModalOpen] = useState(false);

  return (
    <div className="container-fluid bg-dark text-white-50 footer pt-5 wow fadeIn" data-wow-delay="0.1s">
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-md-6 col-lg-3">
            <Link to="/" className="d-inline-block mb-3">
              <h1 className="text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{t('bsngCompany')}</h1>
            </Link>
            <p className="mb-0">
              {dt(getSetting('footer_company_description', 'Building Strong For The Next Generations. Your trusted partner in construction and property development.'))}
            </p>
          </div>
          <div className="col-md-6 col-lg-4 pe-lg-5">
            <h5 className="text-white mb-4">{t('contact')}</h5>
            <p className="d-flex align-items-center mb-3">
              <MapPin className="text-primary me-3 w-5 h-5 flex-shrink-0" />
              <span>{dt(getSetting('contact_address', 'Rwanda/Kigali/Gasabo/Kibagabaga'))}</span>
            </p>
            <p className="d-flex align-items-center mb-3">
              <Phone className="text-primary me-3 w-5 h-5 flex-shrink-0" />
              <span>{dt(getSetting('contact_phone_1', '+250 737 213 060'))}</span>
            </p>
            <p className="d-flex align-items-center mb-3">
              <Mail className="text-primary me-3 w-5 h-5 flex-shrink-0" />
              <span>{dt(getSetting('contact_email_1', 'info@bsng.rw'))}</span>
            </p>
            <div className="d-flex pt-2">
              <a className="btn btn-outline-primary btn-square border-2 me-2" href={getSetting('social_twitter', '#')} target={getSetting('social_twitter', '#') === '#' ? undefined : '_blank'} rel="noopener noreferrer"><Twitter className="w-4 h-4" /></a>
              <a className="btn btn-outline-primary btn-square border-2 me-2" href={getSetting('social_facebook', '#')} target={getSetting('social_facebook', '#') === '#' ? undefined : '_blank'} rel="noopener noreferrer"><Facebook className="w-4 h-4" /></a>
              <a className="btn btn-outline-primary btn-square border-2 me-2" href={getSetting('social_instagram', '#')} target={getSetting('social_instagram', '#') === '#' ? undefined : '_blank'} rel="noopener noreferrer"><Instagram className="w-4 h-4" /></a>
              <a className="btn btn-outline-primary btn-square border-2 me-2" href={getSetting('social_linkedin', '#')} target={getSetting('social_linkedin', '#') === '#' ? undefined : '_blank'} rel="noopener noreferrer"><Linkedin className="w-4 h-4" /></a>
              <a className="btn btn-outline-primary btn-square border-2" href={getSetting('social_youtube', '#')} target={getSetting('social_youtube', '#') === '#' ? undefined : '_blank'} rel="noopener noreferrer"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
          <div className="col-md-6 col-lg-2 ps-lg-4">
            <h5 className="text-white mb-4">{t('quickLinks')}</h5>
            <Link className="btn btn-link" to="/about">{t('about')}</Link>
            <Link className="btn btn-link" to="/contact">{t('contact')}</Link>
            <Link className="btn btn-link" to="/services">{t('services')}</Link>
            <Link className="btn btn-link" to="/properties">{t('properties')}</Link>
            <Link className="btn btn-link" to="/login">{t('staffLogin')}</Link>
          </div>
          <div className="col-md-6 col-lg-3">
            <h5 className="text-white mb-4">{t('services')}</h5>
            <a className="btn btn-link" href="#!">{t('residentialConstruction')}</a>
            <a className="btn btn-link" href="#!">{t('commercialConstruction')}</a>
            <a className="btn btn-link" href="#!">{t('propertyDevelopment')}</a>
            <a className="btn btn-link" href="#!">{t('realEstateSales')}</a>
            <a className="btn btn-link" href="#!">{t('projectManagement')}</a>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="copyright">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; {currentYear} <Link className="border-bottom" to="/">{dt(getSetting('footer_company_name', 'BSNG CONSTRUCTION COMPANY'))}</Link>, {t('rightsReserved')}.
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-menu">
                <Link to="/">{t('home')}</Link>
                <a href="#!">{t('privacyPolicy')}</a>
                <a href="#!">{t('termsOfService')}</a>
                <a href="#!">{t('cookiePolicy')}</a>
              </div>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-12 d-flex justify-content-center">
              <button
                onClick={() => setIsMISModalOpen(true)}
                className="text-white-50 p-0 bg-transparent border-0 hover:text-primary transition-colors text-xs d-flex align-items-center gap-1"
              >
                This website powered by <span className="text-secondary fw-bold ms-1">MIS</span>
                <ExternalLink size={10} className="ms-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <MISModal isOpen={isMISModalOpen} onClose={() => setIsMISModalOpen(false)} />
    </div>
  );
}
