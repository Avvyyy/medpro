import React from 'react';
import { Shield, Bell, User, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  activeAlerts: number;
  doctorName: string;
}

const Header: React.FC<HeaderProps> = ({ activeAlerts, doctorName }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/patients', label: 'Patients' },
    { path: '/vitals', label: 'Vital Signs' },
    { path: '/monitoring', label: 'Monitoring' },
    { path: '/reports', label: 'Reports' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MedAlert Pro</h1>
              <p className="text-sm text-gray-600">Emergency Response System</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            {activeAlerts > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {activeAlerts}
              </span>
            )}
          </div>

          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Dr. {doctorName}</p>
              <p className="text-xs text-gray-600">Cardiologist</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;