import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Spinner from './Spinner';

const Layout = ({ children }) => {
    useEffect(() => {
        // Re-initialize WOW on every route change
        if (window.WOW) {
            new window.WOW().init();
        }
        
        // Sticky Navbar logic
        const handleScroll = () => {
            const stickyTop = document.querySelector('.sticky-top');
            if (stickyTop) {
                if (window.scrollY > 300) {
                    stickyTop.classList.add('bg-white', 'shadow-sm');
                    stickyTop.style.top = '0px';
                } else {
                    stickyTop.classList.remove('bg-white', 'shadow-sm');
                    stickyTop.style.top = '-150px';
                }
            }
            
            // Back to top button logic
            const backToTop = document.querySelector('.back-to-top');
            if (backToTop) {
                if (window.scrollY > 100) {
                    backToTop.style.display = 'flex';
                    backToTop.style.opacity = '1';
                } else {
                    backToTop.style.opacity = '0';
                    setTimeout(() => {
                        if (window.scrollY <= 100) backToTop.style.display = 'none';
                    }, 500);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        
        // Initial call
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="bg-white">
            <Spinner />
            <Navbar />
            {children}
            <Footer />
        </div>
    );
};

export default Layout;
