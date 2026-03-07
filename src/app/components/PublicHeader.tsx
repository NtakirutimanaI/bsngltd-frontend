import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Globe, LogIn, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, ChevronDown } from 'lucide-react';
import { useLanguage, type Language } from '@/app/context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import logo from '@/assets/logo.png';

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const location = useLocation();
  const { language, setLanguage, t, dt } = useLanguage();
  const { getSetting } = useSettings();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('about'), path: '/about' },
    { name: t('services'), path: '/services' },
    { name: t('properties'), path: '/properties' },
    { name: t('updates'), path: '/updates' },
    { name: t('contact'), path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`container-fluid fixed-top p-0 transition-all duration-500`}
      style={{
        top: 0,
        zIndex: 2000,
        backgroundColor: (isScrolled || isMenuOpen) ? 'white' : 'transparent',
        boxShadow: (isScrolled || isMenuOpen) ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
      }}
    >
      {/* Top Bar */}
      <div
        className={`container-fluid ${isScrolled ? 'd-none' : 'd-none d-lg-flex'} py-2 px-5 border-bottom`}
        style={{ borderColor: 'rgba(0,0,0,0.05)', backgroundColor: 'transparent' }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-4">
            <small className="d-flex align-items-center gap-2 text-dark opacity-75">
              <Phone size={14} className="text-primary" />
              {dt(getSetting('contact_phone_1', '+250 737 213 060'))}
            </small>
            <small className="d-flex align-items-center gap-2 text-dark opacity-75">
              <Mail size={14} className="text-primary" />
              {dt(getSetting('contact_email_1', 'info@bsng.rw'))}
            </small>
          </div>
          <div className="d-flex align-items-center gap-3">
            <a href={getSetting('social_facebook', '#')} target={getSetting('social_facebook', '#') === '#' ? undefined : '_blank'} rel="noopener noreferrer" className="text-dark opacity-50 hover:opacity-100 hover:text-primary transition-all"><Facebook size={14} /></a>
            <a href={getSetting('social_twitter', '#')} target={getSetting('social_twitter', '#') === '#' ? undefined : '_blank'} rel="noopener noreferrer" className="text-dark opacity-50 hover:opacity-100 hover:text-primary transition-all"><Twitter size={14} /></a>
            <a href={getSetting('social_instagram', '#')} target={getSetting('social_instagram', '#') === '#' ? undefined : '_blank'} rel="noopener noreferrer" className="text-dark opacity-50 hover:opacity-100 hover:text-primary transition-all"><Instagram size={14} /></a>
            <a href={getSetting('social_linkedin', '#')} target={getSetting('social_linkedin', '#') === '#' ? undefined : '_blank'} rel="noopener noreferrer" className="text-dark opacity-50 hover:opacity-100 hover:text-primary transition-all"><Linkedin size={14} /></a>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <div className="container-fluid px-3 px-lg-5">
        <nav className="navbar navbar-expand-md navbar-light" style={{ padding: '20px 0' }}>
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 me-0">
            <div className="bg-black rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0 overflow-hidden" style={{ width: '40px', height: '40px' }}>
              <img src={logo} alt="BSNG Logo" className="img-fluid" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transform: 'scale(1.35)', transformOrigin: 'center', marginTop: '4px' }} />
            </div>
            <span className="m-0 text-primary fw-bold fs-6 fs-sm-5 fs-lg-4 text-nowrap">
              {t('bsngCompany')}
            </span>
          </Link>
          <button
            type="button"
            className="navbar-toggler ms-auto border-0 shadow-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`collapse navbar-collapse ${isMenuOpen ? 'show d-block' : ''}`}
            id="navbarCollapse"
            style={{
              maxHeight: isMenuOpen ? '80vh' : '0',
              overflowY: 'auto',
              transition: 'max-height 0.4s ease-in-out'
            }}
          >
            <div className="navbar-nav ms-auto py-3 py-lg-0 align-items-center bg-white rounded-bottom px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-item nav-link px-3 fw-medium ${isActive(link.path) ? 'active text-primary' : 'text-dark'}`}
                  style={{ fontSize: '17px' }}
                >
                  {link.name}
                </Link>
              ))}

              {/* Language Dropdown */}
              <div className="nav-item dropdown px-lg-3 position-relative">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2 fw-medium text-dark border-0 bg-transparent"
                  onClick={() => {
                    setIsLangOpen(!isLangOpen);
                  }}
                  style={{ fontSize: '17px' }}
                >
                  <Globe style={{ width: '18px', height: '18px' }} className="text-primary" />
                  {languages.find((l) => l.code === language)?.flag}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`dropdown-menu dropdown-menu-end bg-white border-0 shadow-lg border-top border-primary border-3 transition-all ${isLangOpen ? 'show d-block' : 'd-none'}`} style={{ position: 'absolute', top: '100%', right: 0, minWidth: '180px' }}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className={`dropdown-item py-2 px-4 ${lang.code === language ? 'active bg-primary text-white' : ''}`}
                    >
                      <span className="me-2">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Link
                to="/login"
                className="nav-item nav-link text-primary fw-bold d-flex align-items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
                style={{ fontSize: '17px' }}
              >
                <LogIn style={{ width: '18px', height: '18px' }} />
                {t('joinUs')}
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}