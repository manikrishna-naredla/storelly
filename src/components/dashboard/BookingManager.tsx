import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Calendar,
  User,
  Phone,
  BedDouble,
  Car,
  Scissors,
  X,
  Loader2,
  QrCode,
  Mail,
  Video,
  Users,
  CreditCard,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import { BusinessProfile, Booking, BookingStatus, CatalogItem } from '../../types';
import {
  subscribeToBookings,
  updateBookingStatus,
  updateBookingDetails,
  deleteBooking,
  createBooking,
  getCatalogItems,
  getModuleDeepUrl,
} from '../../services/firebaseService';
import { ModuleQrModal } from '../common/ModuleQrModal';
import { ConfirmActionModal } from '../common/ConfirmActionModal';
import { isCreatorProfile } from '../../utils/profileHelper';
import { sanitizePhoneNumberInput } from '../../utils/phoneHelper';

interface BookingManagerProps {
  business: BusinessProfile;
}

export const BookingManager: React.FC<BookingManagerProps> = ({ business }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // New Booking Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [newItemId, setNewItemId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newBookingDate, setNewBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newBookingTimeSlot, setNewBookingTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [newMeetingUrl, setNewMeetingUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [newBookingError, setNewBookingError] = useState<string | null>(null);

  // Edit Booking State
  const [isEditing, setIsEditing] = useState(false);
  const [editMeetingUrl, setEditMeetingUrl] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>('pending');
  const [editBookingDate, setEditBookingDate] = useState('');
  const [editBookingTimeSlot, setEditBookingTimeSlot] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Delete Booking Confirmation State
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCreator = isCreatorProfile(business);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToBookings(business.id, (list) => {
      setBookings(list);
      setIsLoading(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [business.id]);

  useEffect(() => {
    if (isNewModalOpen) {
      getCatalogItems(business.id)
        .then((items) => {
          setCatalogItems(items);
          if (items.length > 0 && !newItemId) {
            setNewItemId(items[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isNewModalOpen, business.id]);

  const handleOpenEdit = (bk: Booking) => {
    setSelectedBooking(bk);
    setEditMeetingUrl(bk.meetingUrl || '');
    setEditPaymentStatus(bk.paymentStatus || 'pending');
    setEditBookingDate(bk.bookingDate || new Date().toISOString().split('T')[0]);
    setEditBookingTimeSlot(bk.bookingTimeSlot || '10:00 AM - 11:00 AM');
    setEditNotes(bk.notes || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      setIsUpdating(true);
      await updateBookingDetails(business.id, selectedBooking.id, {
        meetingUrl: editMeetingUrl.trim() || undefined,
        paymentStatus: editPaymentStatus as any,
        bookingDate: editBookingDate || undefined,
        bookingTimeSlot: editBookingTimeSlot.trim() || undefined,
        notes: editNotes.trim() || undefined,
      });
      setSelectedBooking({
        ...selectedBooking,
        meetingUrl: editMeetingUrl.trim() || undefined,
        paymentStatus: editPaymentStatus as any,
        bookingDate: editBookingDate || undefined,
        bookingTimeSlot: editBookingTimeSlot.trim() || undefined,
        notes: editNotes.trim() || undefined,
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating booking details:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      setIsUpdating(true);
      await updateBookingStatus(business.id, bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      setNewBookingError('Customer name and phone are required.');
      return;
    }

    const matchedItem = catalogItems.find((i) => i.id === newItemId);
    const itemName = matchedItem ? matchedItem.name : 'Custom Appointment / Service';
    const totalAmount = matchedItem ? (matchedItem.salePrice ?? matchedItem.price ?? 0) : 0;

    try {
      setIsCreatingBooking(true);
      setNewBookingError(null);

      await createBooking(business.id, {
        bookingType: 'appointment',
        itemId: newItemId || 'manual_item',
        itemName,
        customerName: newCustomerName.trim(),
        customerPhone: newCustomerPhone.trim(),
        customerEmail: newCustomerEmail.trim() || undefined,
        bookingDate: newBookingDate,
        bookingTimeSlot: newBookingTimeSlot,
        totalAmount,
        status: 'confirmed',
        paymentStatus: newPaymentStatus,
        meetingUrl: newMeetingUrl.trim() || undefined,
        notes: newNotes.trim() || undefined,
      });

      setIsNewModalOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      setNewMeetingUrl('');
      setNewNotes('');
    } catch (err: any) {
      setNewBookingError(err.message || 'Failed to create manual booking.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handleDeleteBookingConfirm = async () => {
    if (!bookingToDelete) return;
    try {
      setIsDeleting(true);
      await deleteBooking(business.id, bookingToDelete.id);
      setBookingToDelete(null);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error deleting booking:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendWhatsAppUpdate = (booking: Booking) => {
    if (!booking.customerPhone) return;
    const cleanPhone = booking.customerPhone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello ${booking.customerName}!\n\n` +
      `Regarding your ${isCreator ? 'consultation' : 'booking'} *${booking.bookingNumber}* for *${booking.itemName}* with *${business.name}*:\n` +
      `Date: ${booking.bookingDate || booking.checkInDate || booking.startDate}\n` +
      `${booking.bookingTimeSlot ? `Time Slot: ${booking.bookingTimeSlot}\n` : ''}` +
      `${booking.meetingUrl ? `Virtual Meeting Link: ${booking.meetingUrl}\n` : ''}` +
      `Status: *${booking.status.toUpperCase()}*\n\n` +
      `We look forward to serving you! Feel free to reply if you need any adjustments.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesQuery =
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--t1)] font-heading">
            {isCreator ? 'Consultations & 1:1 Bookings' : 'Appointments & Bookings'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--t2)] mt-0.5">
            {isCreator 
              ? 'Manage your scheduled mentorship sessions, consultations, and event bookings.'
              : 'Manage scheduled customer appointments, stay reservations, and vehicle rentals.'
            }
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="ds-btn-primary min-h-[44px] px-4 text-xs font-bold shadow-[var(--shadow-xs)] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Booking</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="ds-btn-secondary min-h-[44px] px-3.5 text-xs font-bold shadow-[var(--shadow-xs)] flex items-center gap-1.5 cursor-pointer"
            title={isCreator ? 'QR code for 1:1 Consultations' : 'QR code for Bookings'}
          >
            <QrCode className="w-4 h-4 text-[var(--g600)]" />
            <span>{isCreator ? 'Consultation QR' : 'Booking Page QR'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[var(--card)] p-3 rounded-[var(--r12)] border border-[var(--border)] shadow-[var(--shadow-xs)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--t3)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings by customer, item name, booking #..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-[var(--border)] rounded-[var(--r8)] focus:outline-[var(--g400)] bg-[var(--bg)] text-[var(--t1)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs border border-[var(--border)] rounded-[var(--r8)] focus:outline-[var(--g400)] bg-[var(--card)] text-[var(--t1)] font-medium"
        >
          <option value="all">All Statuses ({bookings.length})</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--card)] rounded-[var(--r16)] border border-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="bg-[var(--card)] rounded-[var(--r16)] border border-[var(--border)] shadow-[var(--shadow-xs)] divide-y divide-[var(--border)] overflow-hidden">
          {filteredBookings.map((bk) => (
            <div
              key={bk.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg)] transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-extrabold text-sm text-[var(--t1)]">
                    {bk.bookingNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-[var(--r8)] text-[10px] font-bold uppercase tracking-wider border ${
                      bk.status === 'confirmed'
                        ? 'bg-[var(--g100)] text-[var(--g700)] border-[var(--g200)]'
                        : bk.status === 'completed'
                        ? 'bg-[var(--g100)] text-[var(--g700)] border-[var(--g200)]'
                        : bk.status === 'cancelled'
                        ? 'bg-[var(--r100)] text-[var(--r500)] border-rose-200'
                        : 'bg-[var(--y100)] text-amber-800 border-amber-200'
                    }`}
                  >
                    {bk.status}
                  </span>
                  <span className="text-xs font-bold text-[var(--g700)] bg-[var(--g100)] px-2 py-0.5 rounded-[var(--r4)] border border-[var(--g200)]">
                    {bk.itemName}
                  </span>
                </div>

                <div className="text-xs text-[var(--t2)] flex items-center gap-2 flex-wrap pt-0.5">
                  <span className="font-bold text-[var(--t1)]">{bk.customerName}</span>
                  <span>•</span>
                  <span>{bk.customerPhone}</span>
                  <span>•</span>
                  <span className="text-[var(--t3)] font-medium">
                    📅 {bk.bookingDate || bk.checkInDate || bk.startDate}
                    {bk.bookingTimeSlot ? ` (${bk.bookingTimeSlot})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                <div className="text-left sm:text-right">
                  <div className="font-extrabold text-base text-[var(--t1)]">
                    {business.currencySymbol}{bk.totalAmount}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppUpdate(bk)}
                    className="p-2 text-[var(--g600)] hover:bg-[var(--g100)] border border-[var(--g200)] rounded-[var(--r8)] transition cursor-pointer"
                    title="Send WhatsApp Update"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBooking(bk);
                      setIsEditing(false);
                    }}
                    className="px-3 py-2 bg-[var(--g900)] hover:bg-[var(--g800)] text-white text-xs font-bold rounded-[var(--r8)] transition flex items-center gap-1 cursor-pointer shadow-[var(--shadow-xs)]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[var(--card)] rounded-[var(--r16)] border border-dashed border-[var(--border)] space-y-3">
          <div className="w-12 h-12 rounded-[var(--r12)] bg-[var(--g100)] text-[var(--g600)] flex items-center justify-center mx-auto">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--t1)] font-heading">No {isCreator ? 'Consultations' : 'Bookings'} Yet</h3>
          <p className="text-xs text-[var(--t2)] max-w-sm mx-auto">
            {isCreator 
              ? 'Clients can book 1:1 sessions or event tickets directly from your profile.'
              : 'Customers can book appointments, hotel stays, or vehicles directly from your public storefront.'
            }
          </p>
        </div>
      )}

      {/* Booking Details / Edit Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[var(--card)] rounded-[var(--r16)] shadow-[var(--shadow-xl)] border border-[var(--border)] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--t1)] font-heading">
                    Booking #{selectedBooking.bookingNumber}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedBooking.bookingType.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-[var(--g700)] font-semibold mt-0.5">{selectedBooking.itemName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedBooking)}
                  className="p-1.5 bg-[var(--bg)] text-[var(--t1)] hover:bg-[var(--border)] rounded-[var(--r8)] transition cursor-pointer"
                  title="Edit Booking"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setBookingToDelete(selectedBooking)}
                  className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-[var(--r8)] transition cursor-pointer"
                  title="Delete Booking"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 text-[var(--t3)] hover:text-[var(--t1)] rounded-[var(--r8)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 pt-2 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--t1)]">Virtual Meeting Link (Google Meet / Zoom URL)</label>
                  <input
                    type="url"
                    value={editMeetingUrl}
                    onChange={(e) => setEditMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[var(--t1)]">Booking Date</label>
                    <input
                      type="date"
                      value={editBookingDate}
                      onChange={(e) => setEditBookingDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[var(--t1)]">Time Slot</label>
                    <input
                      type="text"
                      value={editBookingTimeSlot}
                      onChange={(e) => setEditBookingTimeSlot(e.target.value)}
                      placeholder="10:00 AM - 11:00 AM"
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--t1)]">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--card)] text-[var(--t1)] font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--t1)]">Merchant Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes or instructions..."
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)] resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 ds-btn-primary py-2.5 font-bold text-xs cursor-pointer"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 bg-[var(--bg)] text-[var(--t2)] font-bold text-xs rounded-[var(--r8)] border border-[var(--border)] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Status switcher */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[var(--t1)] uppercase tracking-wider font-heading">
                    Update Booking Status
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(selectedBooking.id, st)}
                        className={`py-1.5 px-2 rounded-[var(--r8)] text-xs font-bold capitalize transition cursor-pointer ${
                          selectedBooking.status === st
                            ? 'bg-[var(--g600)] text-white shadow-[var(--shadow-xs)]'
                            : 'bg-[var(--card)] text-[var(--t2)] hover:bg-[var(--bg)] border border-[var(--border)]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking & Customer Details Grid */}
                <div className="space-y-3">
                  {/* Customer Information */}
                  <div className="p-3.5 rounded-[var(--r12)] border border-[var(--border)] bg-[var(--bg)] space-y-2 text-xs">
                    <span className="font-bold uppercase text-[10px] tracking-wider block text-[var(--t3)]">
                      Customer Contact
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[var(--t1)] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[var(--t3)]" />
                        <span>{selectedBooking.customerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[var(--t2)] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[var(--t3)]" />
                        <span>{selectedBooking.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${selectedBooking.customerPhone}`}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppUpdate(selectedBooking)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition cursor-pointer"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {selectedBooking.customerEmail && (
                      <div className="text-[var(--t2)] flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-[var(--t3)] shrink-0" />
                        <a href={`mailto:${selectedBooking.customerEmail}`} className="hover:underline truncate">
                          {selectedBooking.customerEmail}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Schedule Details */}
                  <div className="p-3.5 rounded-[var(--r12)] border border-[var(--border)] bg-[var(--bg)] space-y-2 text-xs">
                    <span className="font-bold uppercase text-[10px] tracking-wider block text-[var(--t3)]">
                      Schedule & Reservation
                    </span>

                    {selectedBooking.bookingDate && (
                      <div className="flex justify-between">
                        <span className="text-[var(--t3)]">Scheduled Date:</span>
                        <span className="font-bold text-[var(--t1)]">{selectedBooking.bookingDate}</span>
                      </div>
                    )}

                    {selectedBooking.bookingTimeSlot && (
                      <div className="flex justify-between">
                        <span className="text-[var(--t3)]">Time Slot:</span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {selectedBooking.bookingTimeSlot}
                        </span>
                      </div>
                    )}

                    {selectedBooking.meetingUrl && (
                      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-[var(--t3)]">Virtual Meeting:</span>
                        <a
                          href={selectedBooking.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded font-bold text-[11px] flex items-center gap-1"
                        >
                          <Video className="w-3 h-3 text-purple-600" />
                          <span>Join Meeting</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}

                    {selectedBooking.totalAmount !== undefined && (
                      <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center">
                        <span className="text-[var(--t3)] font-semibold">Total Fee:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[var(--t1)]">
                            {business.currencySymbol}{selectedBooking.totalAmount}
                          </span>
                          {selectedBooking.paymentStatus && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              selectedBooking.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {selectedBooking.paymentStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedBooking.notes && (
                      <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--t2)] bg-amber-50/60 p-2 rounded border border-amber-200">
                        <span className="font-bold block text-amber-900">Notes:</span>
                        <p className="text-amber-800 mt-0.5">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppUpdate(selectedBooking)}
                    className="w-full ds-btn-primary py-2.5 font-bold text-xs shadow-[var(--shadow-xs)] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Customer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW BOOKING MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[var(--card)] rounded-[var(--r16)] shadow-[var(--shadow-xl)] border border-[var(--border)] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--t1)] font-heading">
                Create New Booking / Appointment
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 text-[var(--t3)] hover:text-[var(--t1)] rounded-[var(--r8)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4 pt-2 text-xs">
              {newBookingError && (
                <div className="p-3 rounded-[var(--r8)] bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {newBookingError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Service / Item</label>
                <select
                  value={newItemId}
                  onChange={(e) => setNewItemId(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--card)] text-[var(--t1)] font-medium"
                >
                  {catalogItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({business.currencySymbol}{it.salePrice ?? it.price ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Customer Name *</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Full name..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Customer Phone / WhatsApp *</label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(sanitizePhoneNumberInput(e.target.value))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)] font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--t1)]">Date</label>
                  <input
                    type="date"
                    value={newBookingDate}
                    onChange={(e) => setNewBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[var(--t1)]">Time Slot</label>
                  <input
                    type="text"
                    value={newBookingTimeSlot}
                    onChange={(e) => setNewBookingTimeSlot(e.target.value)}
                    placeholder="10:00 AM - 11:00 AM"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--card)] text-[var(--t1)] font-medium"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Virtual Meeting Link (Optional)</label>
                <input
                  type="url"
                  value={newMeetingUrl}
                  onChange={(e) => setNewMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isCreatingBooking}
                  className="flex-1 ds-btn-primary py-2.5 font-bold text-xs cursor-pointer"
                >
                  {isCreatingBooking ? 'Creating...' : 'Create Booking'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 bg-[var(--bg)] text-[var(--t2)] font-bold text-xs rounded-[var(--r8)] border border-[var(--border)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmActionModal
        isOpen={!!bookingToDelete}
        title="Delete Booking?"
        message={`Are you sure you want to delete booking #${bookingToDelete?.bookingNumber}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteBookingConfirm}
        onCancel={() => setBookingToDelete(null)}
      />

      {/* Booking Page QR Modal */}
      {isQrModalOpen && (
        <ModuleQrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title="Appointments & Services QR Code"
          subtitle={`Allow clients and customers to directly book appointments and 1:1 sessions with ${business.name}.`}
          badge="1:1 Bookings & Appointments"
          url={getModuleDeepUrl(business, isCreator ? 'consultations' : 'services')}
          businessName={business.name}
          logoUrl={business.logo || business.profileImage}
          accentColor="emerald"
        />
      )}
    </div>
  );
};
