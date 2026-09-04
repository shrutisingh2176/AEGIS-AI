import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      maxWidth: 1440,
      margin: '0 auto',
      borderTop: '1px solid #e8eef2',
      padding: '22px 48px',
      display: 'flex',
      gap: 20,
      color: '#8896a1',
      fontSize: 11,
      fontFamily: "'Inter', 'Barlow', sans-serif",
      flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 24, height: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 6,
          border: '1.5px solid #0e9f92',
          color: '#0e9f92',
          fontSize: 10, fontWeight: 800,
          fontFamily: "'Barlow', sans-serif",
        }}>A</span>
        <strong style={{ color: '#122331', fontWeight: 700 }}>AEGIS AI</strong>
        <span style={{ color: '#8896a1' }}>Behavioral Security Intelligence</span>
      </div>
      <div style={{ width: 1, height: 16, background: '#e8eef2' }} />
      <p style={{ margin: 0 }}>
        Built by <b style={{ color: '#122331', fontWeight: 600 }}>Team CodeBytes</b> <span>•</span> Engine v4.8.2-enterprise
      </p>
      <nav style={{
        marginLeft: 'auto',
        display: 'flex', gap: 16,
      }} aria-label="Footer navigation">
        {["SOC Runbooks", "Threat Matrix", "Compliance"].map(link => (
          <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} style={{
            color: '#8896a1', textDecoration: 'none', fontSize: 11,
            transition: 'color .2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0e9f92'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8896a1'; }}
          >{link}</a>
        ))}
      </nav>
    </footer>
  );
}
