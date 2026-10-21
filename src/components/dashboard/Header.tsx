import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  Store,
  User,
  Bell,
  Sparkles,
  QrCode,
  Globe,
  LogOut,
  Settings,
  Share2
} from 'lucide-react';
import { BusinessProfile } from '../../types';
import { getStorefrontUrl, subscribeToNotifications } from '../../services/firebaseService';
import { auth } from '../../config/firebase';
import { requestFcmNotificationPermission } from '../../services/fcmPushService';
import { useLanguage } from '../../context/LanguageContext';
import { isCreatorProfile, getPrimaryPublicUrl } from '../../utils/profileHelper';
import { SafeImage } from '../common/SafeImage';
import { useFirestoreSyncStatus } from '../../services/firestoreSyncService';
import { getBusinessLogo } from '../../utils/branding';

interface HeaderProps {
  business: BusinessProfile | null;
  userBusinesses: BusinessProfile[];
  onSelectBusiness: (biz: BusinessProfile) => void;
  onCreateNewBusiness: () => void;
  onToggleSidebar: () => void;
  onOpenStorefront: () => void;
  onOpenShareModal: () => void;
  onNavigateToNotifications?: () => void;
  userName?: string | null;
  onLogout?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  userBusinesses,
  onSelectBusiness,
  onCreateNewBusiness,
  onToggleSidebar,
  onOpenStorefront,
  onOpenShareModal,
  onNavigateToNotifications,
  userName,
  onLogout,
  onOpenSettings,
}) => {
  const { t } = useLanguage();
  const syncStatus = useFirestoreSyncStatus();
  const [copied, setCopied] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [copiedBizId, setCopiedBizId] = useState<string | null>(null);
  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const bizMenuRef = useRef<HTMLDivElement>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (bizMenuRef.current && !bizMenuRef.current.contains(event.target as Node)) {
        setBizDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isCreator = isCreatorProfile(business);
  const storeUrl = business ? (isCreator ? getPrimaryPublicUrl(business) : getStorefrontUrl(business)) : '';

  useEffect(() => {
    if (!business?.id || !auth?.currentUser) {
      setUnreadNotificationsCount(0);
      return;
    }
    const currentProfileType = isCreator ? 'creator' : 'vendor';
    const unsubscribe = subscribeToNotifications(
      business.id,
      (notifications) => {
        const count = notifications.filter((n) => !n.read).length;
        setUnreadNotificationsCount(count);
      },
      currentProfileType
    );
    return () => {
      unsubscribe();
      setUnreadNotificationsCount(0);
    };
  }, [business?.id, isCreator]);

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!storeUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(storeUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = storeUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setShowCopiedToast(true);
      setTimeout(() => setCopied(false), 2200);
      setTimeout(() => setShowCopiedToast(false), 2800);
    } catch (err) {
      console.error('Failed to copy store URL:', err);
    }
  };

  const handleCopySpecificBiz = async (e: React.MouseEvent, biz: BusinessProfile) => {
    e.stopPropagation();
    const url = isCreatorProfile(biz) ? getPrimaryPublicUrl(biz) : getStorefrontUrl(biz);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedBizId(biz.id);
      setShowCopiedToast(true);
      setTimeout(() => setCopiedBizId(null), 2200);
      setTimeout(() => setShowCopiedToast(false), 2800);
    } catch (err) {
      console.error('Failed to copy specific biz URL:', err);
    }
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!storeUrl) return;
    window.open(storeUrl, '_blank');
  };

  return (
    <header className="sticky top-0 z-30 min-h-[4rem] sm:min-h-[68px] bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)] px-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2 sm:gap-4 transition-colors shadow-xs w-full max-w-full">
      
      {/* Toast Notification for Link Copy */}
      {showCopiedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-[var(--g900)] text-white text-xs font-bold rounded-full shadow-lg border border-white/20 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-emerald-400" />
          </div>
          <span>Public store link copied to clipboard!</span>
        </div>
      )}

      {/* LEFT SECTION: Hamburger & Store Selector */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 flex-wrap">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-xl text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--bg)] transition cursor-pointer touch-target-accessible flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Business Selector Pill */}
        <div className="relative min-w-0 flex-1 sm:flex-initial" ref={bizMenuRef}>
          <button
            type="button"
            onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--g400)] hover:bg-[var(--bg)] transition-all shadow-xs cursor-pointer select-none group w-full sm:w-auto max-w-[180px] xs:max-w-[220px] sm:max-w-[300px] min-w-0"
            title="Switch store or create new profile"
          >
            {/* Store Monogram / Logo */}
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border)] bg-[var(--g100)] text-[var(--g700)] flex items-center justify-center font-black text-xs shadow-xs">
              {getBusinessLogo(business) ? (
                <SafeImage
                  src={getBusinessLogo(business)!}
                  alt={business?.name || "Store"}
                  fallbackType="avatar"
                  loading="lazy"
                  className="w-full h-full object-contain object-center"
                />
              ) : (
                <span>{(business?.name || (isCreator ? 'C' : 'M')).slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            {/* Store Title & Badge */}
            <div className="text-left min-w-0 flex-1 truncate">
              <span className="block font-heading font-bold text-xs sm:text-sm text-[var(--t1)] truncate min-w-0">
                {business ? business.name : t("header.selectStore")}
              </span>
            </div>

            {/* Role Badge */}
            <span className="hidden md:inline-flex items-center text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--g100)] text-[var(--g700)] border border-[var(--g200)] shrink-0">
              {isCreator ? 'Creator' : 'Store'}
            </span>

            <ChevronDown className={`w-3.5 h-3.5 text-[var(--t3)] group-hover:text-[var(--t1)] transition-transform duration-200 shrink-0 ${bizDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Business Switcher Dropdown Menu */}
          {bizDropdownOpen && (
            <div className="absolute left-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-[var(--card)] rounded-2xl shadow-xl border border-[var(--border)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--border)] mb-1">
                <span className="text-[11px] font-bold text-[var(--t3)] uppercase tracking-wider">
                  {t("header.myBusinesses")} ({userBusinesses.length})
                </span>
                <span className="text-[10px] text-[var(--t3)]">Switch active store</span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1 p-0.5">
                {userBusinesses.map((b) => {
                  const bCreator = isCreatorProfile(b);
                  const isSelected = business?.id === b.id;
                  const bImg = getBusinessLogo(b);
                  const bUrl = bCreator ? getPrimaryPublicUrl(b) : getStorefrontUrl(b);
                  const isCopied = copiedBizId === b.id;

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        onSelectBusiness(b);
                        setBizDropdownOpen(false);
                      }}
                      className={`group w-full flex items-center justify-between p-2 rounded-xl transition cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--g100)] text-[var(--g800)] font-bold border border-[var(--g300)]'
                          : 'text-[var(--t1)] hover:bg-[var(--bg)] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[var(--border)] bg-[var(--g100)] text-[var(--g700)] flex items-center justify-center font-bold text-xs">
                          {bImg ? (
                            <SafeImage
                              src={bImg}
                              alt={b.name}
                              fallbackType="avatar"
                              loading="lazy"
                              className="w-full h-full object-contain object-center"
                            />
                          ) : (
                            <span>{b.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 text-left flex-1">
                          <span className="truncate block font-semibold text-xs text-[var(--t1)]">{b.name}</span>
                          <span className="text-[10px] font-mono block truncate text-[var(--g600)]">
                            {bUrl.replace(/^https?:\/\//, '')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={(e) => handleCopySpecificBiz(e, b)}
                          title="Copy Link"
                          className="p-1.5 rounded-lg hover:bg-[var(--card)] text-[var(--t3)] hover:text-[var(--t1)] transition cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(bUrl, '_blank');
                          }}
                          title="Open Storefront in New Tab"
                          className="p-1.5 rounded-lg hover:bg-[var(--card)] text-[var(--t3)] hover:text-[var(--t1)] transition cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 mt-1 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => {
                    setBizDropdownOpen(false);
                    onCreateNewBusiness();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-[var(--g700)] hover:bg-[var(--g100)] rounded-xl transition cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Create New Store or Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Store URL Quick Copy Bar (Desktop) */}
        {business && storeUrl && (
          <div className="hidden xl:flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs text-[var(--t2)] font-mono hover:border-[var(--g400)] transition">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate max-w-[170px] text-[11px] text-[var(--t1)] font-medium select-all">
              {storeUrl.replace(/^https?:\/\//, '')}
            </span>
            <button
              type="button"
              onClick={(e) => handleCopy(e)}
              title="Copy store URL"
              className="p-1 rounded-md text-[var(--t3)] hover:text-[var(--g600)] hover:bg-[var(--card)] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleOpenInNewTab}
              title="Open public store in new tab"
              className="p-1 rounded-md text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--card)] transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Spacious, Professional Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        
        {/* Cloud Sync Status Indicator */}
        <div
          role="status"
          aria-live="polite"
          title={
            syncStatus === 'synced'
              ? 'Real-time database sync active'
              : syncStatus === 'syncing'
              ? 'Saving changes to cloud...'
              : 'Network offline'
          }
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--t2)] font-medium select-none shadow-xs"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced'
                ? 'bg-emerald-500'
                : syncStatus === 'syncing'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-[11px] font-semibold text-[var(--t2)]">
            {syncStatus === 'synced' && 'Synced'}
            {syncStatus === 'syncing' && 'Syncing'}
            {syncStatus === 'offline' && 'Offline'}
          </span>
        </div>

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateToNotifications) {
              onNavigateToNotifications();
            } else {
              requestFcmNotificationPermission();
            }
          }}
          className="relative p-1.5 sm:p-2 rounded-xl text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] transition cursor-pointer touch-target-accessible shrink-0"
          title="Notifications & Orders"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold border-2 border-[var(--card)] shadow-xs animate-pulse">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {business && (
          <>
            {/* Share & QR Standee Button: compact icon on mobile */}
            <button
              type="button"
              onClick={onOpenShareModal}
              title="Share store link & counter QR standee"
              className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border transition shadow-xs cursor-pointer touch-target-accessible shrink-0 ${
                isCreator
                  ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 border-purple-200 dark:border-purple-800'
                  : 'text-[var(--g700)] bg-[var(--g100)] hover:bg-[var(--g200)] border-[var(--g200)]'
              }`}
            >
              <QrCode className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden md:inline">Share &amp; QR</span>
            </button>

            {/* Primary Action: Live Storefront Button */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={onOpenStorefront}
                title={isCreator ? "Open public creator profile" : "Preview digital storefront in-app"}
                className={`flex items-center gap-1 px-2 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white rounded-l-xl transition shadow-xs cursor-pointer active:scale-95 touch-target-accessible ${
                  isCreator
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                    : 'bg-[var(--g600)] hover:bg-[var(--g700)] shadow-emerald-600/20'
                }`}
              >
                <Store className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline">{isCreator ? 'Profile' : 'Store'}</span>
              </button>
              <button
                type="button"
                onClick={handleOpenInNewTab}
                title="Open storefront in new browser tab"
                aria-label="Open storefront in new tab"
                className={`flex items-center justify-center px-1.5 sm:px-2 py-1.5 sm:py-2 text-white text-xs rounded-r-xl border-l border-white/20 transition cursor-pointer touch-target-accessible ${
                  isCreator
                    ? 'bg-purple-700 hover:bg-purple-800'
                    : 'bg-[var(--g700)] hover:bg-[var(--g800)]'
                }`}
              >
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* User Account Menu Hub */}
        <div className="relative pl-1 border-l border-[var(--border)] shrink-0" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1 sm:gap-2 p-1 rounded-xl hover:bg-[var(--bg)] transition cursor-pointer select-none group touch-target-accessible"
            title="Account & Profile Settings"
            aria-label="User account menu"
            aria-expanded={userMenuOpen}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--g100)] border border-[var(--border)] text-[var(--g700)] flex items-center justify-center font-bold text-xs shadow-xs group-hover:border-[var(--g400)] transition">
              {userName ? userName.slice(0, 1).toUpperCase() : <User className="w-3.5 h-3.5 text-[var(--t3)]" />}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[var(--t3)] group-hover:text-[var(--t1)] transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Dropdown Menu */}
          {userMenuOpen && (
            <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-1 w-[calc(100vw-1rem)] sm:w-72 max-w-xs bg-[var(--card)] rounded-2xl shadow-xl border border-[var(--border)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Account Header */}
              <div className="p-3 border-b border-[var(--border)] bg-[var(--bg)]/50 rounded-xl mb-1">
                <p className="text-xs font-bold text-[var(--t1)] truncate">
                  {userName || "Signed In User"}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-extrabold text-[var(--t3)] uppercase tracking-wider">
                    {isCreator ? "Creator Account" : "Merchant Account"}
                  </span>
                  {business && (
                    <span className="text-[10px] text-[var(--g600)] font-semibold truncate">
                      • {business.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions List */}
              <div className="py-1 space-y-0.5">
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--t1)] hover:bg-[var(--bg)] rounded-xl font-medium transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[var(--t2)]" />
                    <span>Account Settings</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenStorefront();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--t1)] hover:bg-[var(--bg)] rounded-xl font-medium transition cursor-pointer"
                >
                  {isCreator ? <Sparkles className="w-4 h-4 text-purple-600" /> : <Store className="w-4 h-4 text-[var(--g600)]" />}
                  <span>{isCreator ? "View Public Profile" : "View Live Store"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenShareModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--t1)] hover:bg-[var(--bg)] rounded-xl font-medium transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[var(--t2)]" />
                  <span>Share Store &amp; QR Standee</span>
                </button>
              </div>

              {/* Sign Out Action */}
              {onLogout && (
                <div className="pt-1 mt-1 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export const DashboardHeader = Header;
export default Header;
