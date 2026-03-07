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

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          {/* Brand - Strictly Left */}
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 me-auto">
            <div className="bg-black rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0 overflow-hidden" style={{ width: '40px', height: '40px' }}>
              <img src={logo} alt="BSNG Logo" className="img-fluid" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transform: 'scale(1.35)', transformOrigin: 'center', marginTop: '4px' }} />
            </div>
            <span className="m-0 text-primary fw-bold fs-6 fs-sm-5 fs-lg-4 text-nowrap">
              {t('bsngCompany')}
            </span>
          </Link>

          {/* Hamburger Toggler */}
          <button
            type="button"
            className="navbar-toggler border-0 shadow-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu Drawer */}
          <div
            className={`collapse navbar-collapse ${isMenuOpen ? 'show d-block' : ''}`}
            id="navbarCollapse"
            style={{
              maxHeight: isMenuOpen ? '90vh' : '0',
              overflowY: 'auto',
              transition: 'max-height 0.4s ease-in-out',
              opacity: isMenuOpen ? 1 : 0,
              visibility: isMenuOpen ? 'visible' : 'hidden'
            }}
          >
            <div className="navbar-nav ms-auto py-2 py-lg-0 align-items-start align-items-lg-center px-2">

              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-item nav-link px-3 fw-medium w-100 ${isActive(link.path) ? 'active text-primary font-bold' : 'text-dark'}`}
                  style={{
                    fontSize: '17px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    color: isActive(link.path) ? '#16a085' : '#333333'
                  }}
                >
                  {link.name}
                </Link>
              ))}

              {/* MOBILE ONLY ACTIONS: Join Us followed by Language (Visible after clicking hamburger) */}
              <div className="d-flex d-md-none flex-column align-items-start gap-4 px-3 py-4 w-100 border-top mt-2">
                <Link
                  to="/login"
                  className="text-primary fw-bold d-flex align-items-center gap-2 p-0 w-100"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ fontSize: '18px', color: '#16a085', textDecoration: 'none' }}
                >
                  <LogIn style={{ width: '22px', height: '22px' }} />
                  {t('joinUs')}
                </Link>

                <div className="dropdown position-relative w-100">
                  <button
                    className="dropdown-toggle d-flex align-items-center gap-2 fw-bold text-dark border-0 bg-transparent p-0 w-100 justify-content-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLangOpen(!isLangOpen);
                    }}
                    style={{ fontSize: '18px' }}
                  >
                    <Globe style={{ width: '22px', height: '22px' }} className="text-primary" />
                    {languages.find((l) => l.code === language)?.flag}
                    <ChevronDown size={14} className={`transition-transform duration-300 ms-auto ${isLangOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`dropdown-menu bg-white border-0 shadow-lg border-top border-primary border-3 transition-all ${isLangOpen ? 'show d-block' : 'd-none'}`}
                    style={{
                      position: 'relative',
                      minWidth: '200px',
                      width: '100%',
                      boxShadow: 'none',
                      marginTop: '15px',
                      zIndex: 2500
                    }}>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className={`dropdown-item py-3 px-4 d-flex align-items-center gap-3 ${lang.code === language ? 'active bg-primary text-white font-bold' : ''}`}
                        style={{ border: 'none' }}
                      >
                        <span className="fs-4">{lang.flag}</span>
                        <span className="fw-bold">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DESKTOP ONLY: Join Us Button */}
              <Link
                to="/login"
                className="nav-item nav-link text-primary fw-bold d-none d-md-flex align-items-center gap-2 px-3 py-3"
                style={{ fontSize: '17px', color: '#16a085' }}
              >
                <LogIn style={{ width: '18px', height: '18px' }} />
                {t('joinUs')}
              </Link>

              {/* DESKTOP ONLY: Language Dropdown */}
              <div className="nav-item dropdown px-lg-3 position-relative d-none d-md-block">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2 fw-medium text-dark border-0 bg-transparent h-100"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  style={{ fontSize: '17px' }}
                >
                  <Globe style={{ width: '18px', height: '18px' }} className="text-primary" />
                  {languages.find((l) => l.code === language)?.flag}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`dropdown-menu dropdown-menu-end bg-white border-0 shadow-lg border-top border-primary border-3 transition-all ${isLangOpen ? 'show d-block' : 'd-none'}`}
                  style={{ position: 'absolute', top: '100%', right: 0, minWidth: '180px' }}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`dropdown-item py-2 px-4 d-flex align-items-center gap-3 ${lang.code === language ? 'active bg-primary text-white' : ''}`}
                    >
                      <span className="fs-5">{lang.flag}</span>
                      <span className="fw-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}