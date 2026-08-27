// Shown automatically by Next.js App Router during page transitions/loading

export default function Loading() {
  return (
    <div style={{ paddingTop: 8 }}>
      {/* Government / Politician banner — shown during page load (typical of Indian gov sites) */}
      <div style={{
        background: 'linear-gradient(135deg, #003580 0%, #002060 60%, #001240 100%)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,53,128,0.15)',
      }}>
        {/* Saffron top accent */}
        <div style={{ height: 3, background: '#FF9933' }} />

        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Left portrait placeholder — Prime Minister */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{
              width: 72, height: 90,
              borderRadius: 4,
              border: '2px solid rgba(255,153,51,0.6)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                marginBottom: 4,
              }} />
              <div style={{
                width: 44, height: 32, borderRadius: '3px 3px 0 0',
                background: 'rgba(255,255,255,0.12)',
              }} />
              <div style={{
                position: 'absolute', bottom: 4,
                fontSize: 9, color: 'rgba(255,255,255,0.5)',
                fontWeight: 600, letterSpacing: '0.05em',
              }}>HON. PM</div>
            </div>
          </div>

          {/* Center content */}
          <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: '0.15em', marginBottom: 4 }}>
              GOVERNMENT OF INDIA · MINISTRY OF ROAD TRANSPORT &amp; HIGHWAYS
            </div>
            <div style={{ color: '#FF9933', fontWeight: 700, fontSize: 15, marginBottom: 3, letterSpacing: '-0.01em' }}>
              Parivahan Sewa
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 8 }}>
              परिवहन सेवा — Digital Services for All Citizens
            </div>

            {/* Loading indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#FF9933',
                    opacity: 0.9,
                    animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Loading services…</span>
            </div>
          </div>

          {/* Right portrait placeholder — Chief Minister */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{
              width: 72, height: 90,
              borderRadius: 4,
              border: '2px solid rgba(4,106,56,0.6)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                marginBottom: 4,
              }} />
              <div style={{
                width: 44, height: 32, borderRadius: '3px 3px 0 0',
                background: 'rgba(255,255,255,0.12)',
              }} />
              <div style={{
                position: 'absolute', bottom: 4,
                fontSize: 9, color: 'rgba(255,255,255,0.5)',
                fontWeight: 600, letterSpacing: '0.05em',
              }}>HON. CM</div>
            </div>
          </div>
        </div>

        {/* Green bottom accent */}
        <div style={{ height: 3, background: '#046A38' }} />
      </div>

      {/* Skeleton content for the page body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Skeleton notice bar */}
        <div className="skeleton" style={{ height: 36, borderRadius: 4 }} />

        {/* Skeleton hero */}
        <div className="skeleton" style={{ height: 88, borderRadius: 6 }} />

        {/* Skeleton service cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 6 }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
