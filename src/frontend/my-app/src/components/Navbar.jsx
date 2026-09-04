import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import gsap from "gsap-trial";

const links = [
  ["Home", "/"],
  ["Overview", "/overview"],
  ["Network", "/network"],
  ["System Health", "/system-health"],
];

function Navbar({ apiStatus }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  const indicatorRef = useRef(null);

  const statusLabel =
    apiStatus === "connected"
      ? "API Connected"
      : apiStatus === "connecting"
        ? "Connecting"
        : "API Disconnected";

  const statusStyles = {
    connected: "bg-[#effaf8] text-teal-dark border-teal/20",
    connecting: "bg-amber/10 text-amber border-amber/20",
    disconnected: "bg-red/10 text-red border-red/20"
  };

  const statusColor = apiStatus === "connected" ? "bg-teal" : apiStatus === "connecting" ? "bg-amber" : "bg-red";

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP Smooth Navigation Indicator
  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;
    
    const activeLink = navRef.current.querySelector("a.active");
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      
      const left = linkRect.left - navRect.left;
      const width = linkRect.width;

      gsap.to(indicatorRef.current, {
        x: left,
        width: width,
        duration: 0.4,
        ease: "power3.out",
      });
    }
  }, [location.pathname]);

  return (
    <header className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${scrolled ? 'top-3 w-[95%] max-w-7xl bg-nav/95 backdrop-blur-md rounded-2xl shadow-custom text-white' : 'top-0 w-full bg-white text-ink shadow-sm'}`}>
      <div className="flex justify-between items-center px-8 h-16 max-w-7xl mx-auto gap-4">
        
        {/* Brand — fixed width so nav links stay perfectly centered */}
        <NavLink to="/" className={`nav-brand flex items-center gap-3 whitespace-nowrap transition-opacity hover:opacity-80 ${scrolled ? 'text-white' : 'text-ink'}`} onClick={() => setOpen(false)}>
          <span className="flex justify-center items-center w-8 h-8 rounded-md bg-gradient-to-br from-teal to-teal-dark text-white font-bold text-lg shadow-teal">A</span>
          <span className="nav-brand-text">
            <strong className="block text-[15px] font-bold tracking-wider leading-tight font-nunito">AEGIS AI</strong>
            <small className={`block text-[10px] uppercase tracking-[0.06em] font-nunito ${scrolled ? 'text-slate-300' : 'text-muted'}`}>Behavioral Security</small>
          </span>
        </NavLink>
        
        {/* Hamburger — only on mobile */}
        <button
          className={`nav-hamburger z-[1000] text-2xl focus:outline-none ${scrolled ? 'text-white' : 'text-ink'}`}
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? "✕" : "≡"}
        </button>
        
        {/* Nav Links — centered on desktop */}
        <nav
          className={`nav-links-container ${open ? 'mobile-open' : ''} ${scrolled ? 'scrolled' : ''}`}
          ref={navRef}
        >
          {/* GSAP Animated Indicator — desktop only */}
          <div 
            ref={indicatorRef} 
            className="nav-indicator"
          />
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link font-nunito ${isActive ? 'active' : ''} ${isActive ? (scrolled ? 'text-teal' : 'text-ink') : (scrolled ? 'text-slate-300 hover:text-white' : 'text-muted hover:text-teal')}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        
        {/* Meta / Status — fixed width so nav links stay centered */}
        <div className="nav-status-wrap">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider font-nunito border ${statusStyles[apiStatus] || statusStyles.disconnected}`}>
            <i className={`w-1.5 h-1.5 rounded-full ${statusColor} ${apiStatus === 'connecting' ? 'animate-pulse' : ''}`} />
            {statusLabel}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
