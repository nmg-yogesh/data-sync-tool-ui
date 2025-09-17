import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';

interface AuthHeaderProps {
  className?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ className = '' }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
  };

  const getRoleIcon = () => {
    return user.role === 'admin' ? (
      <Shield className="h-4 w-4 text-yellow-500" />
    ) : (
      <User className="h-4 w-4 text-blue-500" />
    );
  };

  const getRoleBadgeColor = () => {
    return user.role === 'admin' 
      ? 'bg-yellow-100 text-yellow-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* User Info */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Welcome,</span>
        <span className="text-sm font-medium text-gray-900">{user.username}</span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
          {getRoleIcon()}
          <span className="ml-1">{user.role}</span>
        </span>
      </div>

      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            ></div>
            
            {/* Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center mt-1">
                      {getRoleIcon()}
                      <span className="ml-1 text-xs text-gray-500 capitalize">
                        {user.role} Account
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Add profile functionality here
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Profile Settings
                </button>
                
                <div className="border-t border-gray-200"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>

              {/* Account Info */}
              {user.last_login && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Last login: {new Date(user.last_login).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Compact version for smaller spaces
export const CompactAuthHeader: React.FC<AuthHeaderProps> = ({ className = '' }) => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-3 w-3 text-white" />
        </div>
        <span className="text-sm text-gray-700">{user.username}</span>
        {user.role === 'admin' && (
          <Shield className="h-3 w-3 text-yellow-500" title="Admin" />
        )}
      </div>
      
      <button
        onClick={logout}
        className="text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded p-1"
        title="Sign Out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AuthHeader;
