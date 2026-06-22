import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as Icons from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { name: 'Theory Modules', path: '/subjects', icon: 'BookOpen' },
    { name: 'MCQ Practice', path: '/mcq-practice', icon: 'HelpCircle' },
    { name: 'SPQ Code Arena', path: '/spq-practice', icon: 'Terminal' },
    { name: 'Leaderboard', path: '/leaderboard', icon: 'Trophy' },
  ];

  if (user.role === 'admin') {
    navItems.push({ name: 'Admin Dashboard', path: '/admin', icon: 'Settings' });
  }

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={18} /> : <Icons.HelpCircle size={18} />;
  };

  return (
    <aside
      style={{
        position: 'sticky',
        top: '100px',
        width: '260px',
        padding: '20px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      {/* Profile Details */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #dee2e6',
          paddingBottom: '15px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#e9ecef',
            border: '2px solid #002f6c',
            color: '#002f6c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#212529', margin: 0 }}>{user.name}</h3>
          <p style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px', textTransform: 'uppercase' }}>
            {user.role === 'admin' ? 'FACULTY / MENTOR' : 'ILP TRAINEE'}
          </p>
        </div>

        {user.role !== 'admin' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#fff3cd',
              border: '1px solid #ffe69c',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#664d03',
            }}
          >
            <Icons.Flame size={14} fill="#664d03" />
            <span>{user.streak || 1} Days Active</span>
          </div>
        )}
      </div>

      {/* Navigation list */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '4px',
              color: isActive ? '#002f6c' : '#495057',
              background: isActive ? '#e9ecef' : 'transparent',
              borderLeft: isActive ? '4px solid #002f6c' : '4px solid transparent',
              textDecoration: 'none',
              fontSize: '13.5px',
              fontWeight: isActive ? 'bold' : 'normal',
            })}
          >
            {renderIcon(item.icon)}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <button
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '4px',
          border: '1px solid #dc3545',
          background: 'transparent',
          color: '#dc3545',
          cursor: 'pointer',
          fontSize: '13.5px',
          fontWeight: 'bold',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#fdf2f2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Icons.LogOut size={16} />
        <span>Logout Session</span>
      </button>
    </aside>
  );
};

export default Sidebar;
