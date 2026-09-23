'use client';

import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Pencil, 
  Check, 
  CheckCircle2, 
  ChevronDown,
  Camera,
  Trash2
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

interface ProfileViewProps {
  onRoleChange?: (role: string) => void;
  defaultRole?: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  onRoleChange,
  defaultRole = 'Customer' 
}) => {
  const { darkMode } = useQueue();
  const [profileName, setProfileName] = useState('John Doe');
  const [profileEmail, setProfileEmail] = useState('john.doe@example.com');
  const [profilePhone, setProfilePhone] = useState('+1 234 567 8900');
  const [profileRole, setProfileRole] = useState(defaultRole);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Profile updated successfully!');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved profile data from localStorage on mount
  React.useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem('queuemate_profile_avatar');
      if (savedAvatar) setAvatarUrl(savedAvatar);

      const savedName = localStorage.getItem('queuemate_profile_name');
      if (savedName) setProfileName(savedName);

      const savedEmail = localStorage.getItem('queuemate_profile_email');
      if (savedEmail) setProfileEmail(savedEmail);

      const savedPhone = localStorage.getItem('queuemate_profile_phone');
      if (savedPhone) setProfilePhone(savedPhone);

      const savedRole = localStorage.getItem('queuemate_profile_role');
      if (savedRole) setProfileRole(savedRole);
    } catch {
      // Ignore localStorage read errors in restricted environments
    }
  }, []);

  const handleToggleEdit = () => {
    if (isEditingProfile) {
      // Save changes to localStorage
      try {
        localStorage.setItem('queuemate_profile_name', profileName);
        localStorage.setItem('queuemate_profile_email', profileEmail);
        localStorage.setItem('queuemate_profile_phone', profilePhone);
        localStorage.setItem('queuemate_profile_role', profileRole);
      } catch {
        // Ignore quota/storage errors
      }

      setIsEditingProfile(false);
      setToastMessage('Profile updated successfully!');
      setShowSavedToast(true);
      if (onRoleChange) onRoleChange(profileRole);
      setTimeout(() => setShowSavedToast(false), 2200);
    } else {
      setIsEditingProfile(true);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setAvatarUrl(dataUrl);
          try {
            localStorage.setItem('queuemate_profile_avatar', dataUrl);
          } catch {
            // Ignore storage quota
          }
          setToastMessage('Profile photo updated!');
          setShowSavedToast(true);
          setTimeout(() => setShowSavedToast(false), 2200);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    try {
      localStorage.removeItem('queuemate_profile_avatar');
    } catch {
      // Ignore storage errors
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setToastMessage('Profile photo removed.');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className={`w-full flex-1 flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
    }`}>
      {/* Header */}
      <div className="w-full max-w-sm mx-auto pt-7 px-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className={`text-[22px] sm:text-[24px] font-bold tracking-tight leading-tight transition-colors duration-200 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Profile
          </h1>
          <p className="text-[12.5px] text-slate-400 font-normal mt-0.5">
            Manage your personal information
          </p>
        </div>

        {/* Green Edit Squircle Button */}
        <button
          onClick={handleToggleEdit}
          className="w-10 h-10 rounded-2xl bg-[#00A843] flex items-center justify-center text-white shadow-sm hover:bg-[#00963c] active:scale-95 transition-all cursor-pointer flex-shrink-0"
          title={isEditingProfile ? 'Save Profile' : 'Edit Profile'}
        >
          {isEditingProfile ? (
            <Check className="w-5 h-5 stroke-[2.4]" />
          ) : (
            <Pencil className="w-4 h-4 stroke-[2.2]" />
          )}
        </button>
      </div>

      {/* Saved Toast Feedback */}
      {showSavedToast && (
        <div className="w-full max-w-sm mx-auto px-4 my-1">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2 px-3 rounded-xl flex items-center justify-between animate-scale-in">
            <span className="flex items-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </span>
          </div>
        </div>
      )}

      {/* Scrollable Form Area */}
      <div className="w-full max-w-sm mx-auto flex-1 px-4 py-3 space-y-4 overflow-y-auto">
        {/* Card 1: Avatar Card */}
        <div className={`rounded-3xl p-6 shadow-sm border flex flex-col items-center text-center animate-scale-in transition-colors duration-200 ${
          darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
        }`}>
          {/* Avatar Circle Container with Camera Badge (Matches user screenshot) */}
          <div className="relative mb-3.5">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xs overflow-hidden border transition-colors duration-200 ${
              darkMode ? 'bg-[#131E2E] border-slate-700' : 'bg-[#D7F5DE] border-emerald-100'
            }`}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-[#00A843] stroke-[2.2]" />
              )}
            </div>

            {/* Hidden File Input for Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Green Camera Button Badge - Only appears in edit mode */}
            {isEditingProfile && (
              <button
                onClick={handleCameraClick}
                className="w-8 h-8 rounded-full bg-[#00A843] hover:bg-[#00963c] active:scale-90 text-white flex items-center justify-center shadow-md border-2 border-white absolute bottom-0 right-0 cursor-pointer transition-all animate-scale-in"
                title="Add / change profile picture"
              >
                <Camera className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>

          {/* Remove photo link if custom photo exists */}
          {avatarUrl && isEditingProfile && (
            <button
              onClick={handleRemovePhoto}
              className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center space-x-1 mb-2 font-medium cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove photo</span>
            </button>
          )}

          {/* Name */}
          <h2 className={`text-[20px] font-bold tracking-tight leading-snug mb-0.5 transition-colors duration-200 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {profileName}
          </h2>

          {/* Role */}
          <p className="text-[13px] text-slate-400 font-normal">
            {profileRole}
          </p>
        </div>

        {/* Card 2: Personal Information Card */}
        <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border space-y-4 text-left animate-scale-in transition-colors duration-200 ${
          darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
        }`}>
          <h3 className={`text-[16px] font-bold mb-1 transition-colors duration-200 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Personal Information
          </h3>

          {/* 1. Full Name */}
          <div>
            <label className={`text-xs font-semibold flex items-center space-x-1.5 mb-1.5 ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              disabled={!isEditingProfile}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                darkMode
                  ? (isEditingProfile 
                      ? 'bg-[#101927] border-slate-600 text-white focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                      : 'bg-[#101927]/60 border-slate-750 text-slate-200')
                  : (isEditingProfile
                      ? 'bg-white border-slate-300 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                      : 'bg-white border-slate-200/90 text-slate-800 shadow-2xs')
              }`}
            />
          </div>

          {/* 2. Email Address */}
          <div>
            <label className={`text-xs font-semibold flex items-center space-x-1.5 mb-1.5 ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              disabled={!isEditingProfile}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                darkMode
                  ? (isEditingProfile 
                      ? 'bg-[#101927] border-slate-600 text-white focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                      : 'bg-[#101927]/60 border-slate-750 text-slate-200')
                  : (isEditingProfile
                      ? 'bg-white border-slate-300 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                      : 'bg-white border-slate-200/90 text-slate-800 shadow-2xs')
              }`}
            />
          </div>

          {/* 3. Phone Number */}
          <div>
            <label className={`text-xs font-semibold flex items-center space-x-1.5 mb-1.5 ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              disabled={!isEditingProfile}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                darkMode
                  ? (isEditingProfile 
                      ? 'bg-[#101927] border-slate-600 text-white focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                      : 'bg-[#101927]/60 border-slate-750 text-slate-200')
                  : (isEditingProfile
                      ? 'bg-white border-slate-300 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                      : 'bg-white border-slate-200/90 text-slate-800 shadow-2xs')
              }`}
            />
          </div>

          {/* 4. Role */}
          <div>
            <label className={`text-xs font-semibold flex items-center space-x-1.5 mb-1.5 ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Role</span>
            </label>
            <div className="relative">
              <select
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
                disabled={!isEditingProfile}
                className={`w-full px-4 py-3 rounded-xl border text-sm appearance-none cursor-pointer transition-all outline-none ${
                  darkMode
                    ? (isEditingProfile
                        ? 'bg-[#101927] border-slate-600 text-white focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                        : 'bg-[#101927]/60 border-slate-750 text-slate-200')
                    : (isEditingProfile
                        ? 'bg-white border-slate-300 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                        : 'bg-white border-slate-200/90 text-slate-800 shadow-2xs')
                }`}
              >
                <option value="Customer">Customer</option>
                <option value="Staff">Staff</option>
                <option value="Company">Company</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
