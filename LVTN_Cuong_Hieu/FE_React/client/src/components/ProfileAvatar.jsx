import React from 'react';

const ProfileAvatar = ({ name, size = 80 }) => {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div 
      className="bg-gradient-to-br from-amber-500 to-purple-600 rounded-full flex items-center justify-center text-gray-200 font-bold border-4 border-white shadow-lg mx-auto mb-4"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {getInitials(name)}
    </div>
  );
};

export default ProfileAvatar;