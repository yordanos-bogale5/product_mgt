import React from 'react';
import { useAuth } from '../lib/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg font-medium">{user?.email}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">User ID</p>
          <p className="text-lg font-medium">{user?.id}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Last Sign In</p>
          <p className="text-lg font-medium">
            {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;