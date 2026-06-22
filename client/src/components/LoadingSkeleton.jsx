import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = (key) => {
    switch (type) {
      case 'dashboard':
        return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            <div className="skeleton" style={{ height: '180px', width: '100%', borderRadius: '16px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />
              <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />
              <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
              <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
            </div>
          </div>
        );
      case 'editor':
        return (
          <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '80vh', width: '100%' }}>
            <div className="skeleton" style={{ borderRadius: '16px', height: '100%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              <div className="skeleton" style={{ flexGrow: 1, borderRadius: '16px' }} />
              <div className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />
            </div>
          </div>
        );
      case 'list':
        return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton" style={{ height: '40px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ height: '40px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ height: '40px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ height: '40px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ height: '40px', borderRadius: '8px' }} />
          </div>
        );
      case 'card':
      default:
        return (
          <div
            key={key}
            style={{
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div className="skeleton" style={{ height: '24px', width: '60%', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '14px', width: '90%', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '14px', width: '80%', borderRadius: '4px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <div className="skeleton" style={{ height: '32px', width: '80px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '32px', width: '32px', borderRadius: '50%' }} />
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
    </div>
  );
};

export default LoadingSkeleton;
