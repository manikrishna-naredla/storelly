import { useLanguage } from '../../context/LanguageContext';
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  ShoppingBag,
  CalendarCheck,
  IndianRupee,
  DollarSign,
  UserCheck,
  Download,
  Ticket,
  FileText,
  Star,
  Package,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calendar,
  X,
  Loader2,
  Check,
  CheckCircle2,
  Eye,
  Mail,
  MapPin,
} from 'lucide-react';
import { BusinessProfile, Customer, Expense } from '../../types';
import {
  getCustomers,
  createCustomerManual,
  updateCustomer,
  deleteCustomer,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../services/firebaseService';
import { exportToCSV } from '../../utils/export';
import { isCreatorProfile } from '../../utils/profileHelper';
import { ConfirmActionModal } from '../common/ConfirmActionModal';
import { sanitizePhoneNumberInput } from '../../utils/phoneHelper';

interface CustomerManagerProps {
  business: BusinessProfile;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ business }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'crm' | 'expenses'>('crm');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');

  // Customer Modal & Details State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);

  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('inventory');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  const isCreator = isCreatorProfile(business);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedCustomers, fetchedExpenses] = await Promise.all([
        getCustomers(business.id),
        getExpenses(business.id),
      ]);
      setCustomers(fetchedCustomers);
      setExpenses(fetchedExpenses);
    } catch (err) {
      console.error('Error loading CRM data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business.id]);

  const handleOpenCustomerModal = (cust?: Customer) => {
    if (cust) {
      setEditingCustomer(cust);
      setCustName(cust.name || '');
      setCustPhone(cust.phone || '');
      setCustEmail(cust.email || '');
      setCustAddress(cust.address || '');
      setCustNotes(cust.notes || '');
    } else {
      setEditingCustomer(null);
      setCustName('');
      setCustPhone('');
      setCustEmail('');
      setCustAddress('');
      setCustNotes('');
    }
    setCustomerError(null);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      setCustomerError('Customer name and phone number are required.');
      return;
    }

    try {
      setIsSavingCustomer(true);
      setCustomerError(null);
      const payload = {
        name: custName.trim(),
        phone: custPhone.trim(),
        whatsapp: custPhone.trim(),
        email: custEmail.trim() || undefined,
        address: custAddress.trim() || undefined,
        notes: custNotes.trim() || undefined,
      };

      if (editingCustomer) {
        await updateCustomer(business.id, editingCustomer.id, payload);
      } else {
        await createCustomerManual(business.id, payload);
      }

      setIsCustomerModalOpen(false);
      await loadData();
    } catch (err: any) {
      setCustomerError(err.message || 'Failed to save customer record.');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleDeleteCustomerConfirm = async () => {
    if (!customerToDelete) return;
    try {
      setIsDeletingCustomer(true);
      await deleteCustomer(business.id, customerToDelete.id);
      setCustomerToDelete(null);
      setSelectedCustomerDetails(null);
      await loadData();
    } catch (err) {
      console.error('Error deleting customer:', err);
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  const handleOpenExpenseModal = (exp?: Expense) => {
    if (exp) {
      setEditingExpense(exp);
      setExpenseTitle(exp.title);
      setExpenseCategory(exp.category);
      setExpenseAmount(exp.amount);
      setExpenseDate(exp.date);
      setExpenseNotes(exp.notes || '');
    } else {
      setEditingExpense(null);
      setExpenseTitle('');
      setExpenseCategory('inventory');
      setExpenseAmount(0);
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setExpenseNotes('');
    }
    setExpenseError(null);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim()) {
      setExpenseError('Expense description / title is required.');
      return;
    }
    if (!expenseAmount || expenseAmount <= 0) {
      setExpenseError('Please enter a valid expense amount.');
      return;
    }

    try {
      setIsSavingExpense(true);
      setExpenseError(null);
      const payload = {
        title: expenseTitle.trim(),
        category: expenseCategory,
        amount: Number(expenseAmount),
        date: expenseDate,
        notes: expenseNotes.trim() || undefined,
      };

      if (editingExpense) {
        await updateExpense(business.id, editingExpense.id, payload);
      } else {
        await createExpense(business.id, payload);
      }

      setIsExpenseModalOpen(false);
      await loadData();
    } catch (err: any) {
      setExpenseError(err.message || 'Failed to save expense record.');
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(business.id, id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleWhatsApp = (cust: Customer) => {
    const phone = cust.whatsapp || cust.phone;
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello ${cust.name}! Greetings from *${business.name}*! How can we assist you today?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleExportCSV = () => {
    const dataToExport = filteredCustomers.map((c) => ({
      Name: c.name,
      Phone: c.phone,
      WhatsApp: c.whatsapp || '',
      Email: c.email || '',
      TotalOrders: c.totalOrders || 0,
      TotalBookings: c.totalBookings || 0,
      TotalSpent: c.totalSpent || 0,
      SourceModule: c.sourceModule || (c.sourceModules && c.sourceModules.join(', ')) || 'General',
      Address: c.address || '',
      LastInteraction: c.lastInteractionAt ? new Date(c.lastInteractionAt).toISOString() : '',
    }));
    exportToCSV(`Storelly_CRM_${business.slug || business.id}`, dataToExport);
  };

  const getSourceBadge = (source?: string, sourceModules?: string[]) => {
    const sources = sourceModules && sourceModules.length > 0 ? sourceModules : [source || 'storefront'];
    
    return (
      <div className="flex flex-wrap items-center gap-1 mt-1">
        {sources.map((s, idx) => {
          switch (s) {
            case 'digital_store':
              return (
                <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  <Package className="w-3 h-3" /> Digital Store
                </span>
              );
            case 'consultation':
              return (
                <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  <CalendarCheck className="w-3 h-3" /> 1:1 Session
                </span>
              );
            case 'event':
              return (
                <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  <Ticket className="w-3 h-3" /> Event Ticket
                </span>
              );
            case 'quote':
              return (
                <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  <FileText className="w-3 h-3" /> Custom Quote
                </span>
              );
            case 'review':
              return (
                <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                  <Star className="w-3 h-3" /> Testimonial
                </span>
              );
            default:
              return (
                <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShoppingBag className="w-3 h-3" /> Store Order
                </span>
              );
          }
        })}
      </div>
    );
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (selectedModuleFilter === 'all') return true;

    const sources = [
      c.sourceModule,
      ...(c.sourceModules || [])
    ].filter(Boolean);

    return sources.includes(selectedModuleFilter);
  });

  const totalCustomerRevenue = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const totalExpenseAmount = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netProfitLoss = totalCustomerRevenue - totalExpenseAmount;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--t1)] font-heading">
            {activeTab === 'crm' ? 'Customer Directory & CRM' : 'Business Expenses & P&L'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--t2)] mt-0.5">
            {activeTab === 'crm'
              ? 'Track your customers, contact leads via WhatsApp, and view lifetime purchase stats.'
              : 'Log store expenses, cost of goods, overheads, and compute net profit.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="bg-[var(--card)] p-1 rounded-[var(--r12)] border border-[var(--border)] shadow-[var(--shadow-xs)] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('crm')}
              className={`px-3.5 py-1.5 rounded-[var(--r8)] text-xs font-bold transition cursor-pointer ${
                activeTab === 'crm'
                  ? 'bg-[var(--g600)] text-white shadow-[var(--shadow-xs)]'
                  : 'text-[var(--t2)] hover:text-[var(--t1)]'
              }`}
            >
              CRM Customers ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`px-3.5 py-1.5 rounded-[var(--r8)] text-xs font-bold transition cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-[var(--g600)] text-white shadow-[var(--shadow-xs)]'
                  : 'text-[var(--t2)] hover:text-[var(--t1)]'
              }`}
            >
              Expenses & P&L
            </button>
          </div>

          {activeTab === 'crm' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenCustomerModal()}
                className="ds-btn-primary min-h-[44px] px-3.5 text-xs font-bold shadow-[var(--shadow-xs)] flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Customer</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="ds-btn-secondary min-h-[44px] px-3.5 text-xs font-bold shadow-[var(--shadow-xs)] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--g600)]" />
                <span>Export CSV</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenExpenseModal()}
              className="ds-btn-primary min-h-[44px] px-3.5 text-xs font-bold shadow-[var(--shadow-xs)] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      {activeTab === 'crm' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 rounded-[var(--r16)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-xs)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--t3)] uppercase tracking-wider">Total CRM Contacts</span>
            <div className="text-2xl font-black text-[var(--t1)] font-heading">{customers.length}</div>
            <p className="text-[11px] text-[var(--t2)]">Captured across storefront & modules</p>
          </div>
          <div className="p-4 sm:p-5 rounded-[var(--r16)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-xs)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--t3)] uppercase tracking-wider">Lifetime Revenue</span>
            <div className="text-2xl font-black text-emerald-700 font-heading">
              {business.currencySymbol}{totalCustomerRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-[var(--t2)]">Realized from orders & bookings</p>
          </div>
          <div className="p-4 sm:p-5 rounded-[var(--r16)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-xs)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--t3)] uppercase tracking-wider">Net Business Balance</span>
            <div className={`text-2xl font-black font-heading ${netProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {business.currencySymbol}{netProfitLoss.toLocaleString()}
            </div>
            <p className="text-[11px] text-[var(--t2)]">Revenue minus logged expenses</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 rounded-[var(--r16)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-xs)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--t3)] uppercase tracking-wider">Total Gross Revenue</span>
            <div className="text-2xl font-black text-emerald-700 font-heading">
              {business.currencySymbol}{totalCustomerRevenue.toLocaleString()}
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-[var(--r16)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-xs)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--t3)] uppercase tracking-wider">Total Expenses</span>
            <div className="text-2xl font-black text-rose-600 font-heading">
              {business.currencySymbol}{totalExpenseAmount.toLocaleString()}
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-[var(--r16)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-xs)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--t3)] uppercase tracking-wider">Net Profit</span>
            <div className={`text-2xl font-black font-heading ${netProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {business.currencySymbol}{netProfitLoss.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* CRM Tab Content */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-[var(--card)] p-3 rounded-[var(--r12)] border border-[var(--border)] shadow-[var(--shadow-xs)]">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--t3)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers by name, phone, email..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)] focus:outline-[var(--g400)]"
              />
            </div>

            <select
              value={selectedModuleFilter}
              onChange={(e) => setSelectedModuleFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 text-xs border border-[var(--border)] rounded-[var(--r8)] bg-[var(--card)] text-[var(--t1)] font-medium"
            >
              <option value="all">All Sources</option>
              <option value="storefront">Storefront Orders</option>
              <option value="digital_store">Digital Store</option>
              <option value="consultation">1:1 Session</option>
              <option value="event">Event Ticket</option>
              <option value="quote">Custom Quote</option>
              <option value="review">Testimonial</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[var(--card)] rounded-[var(--r16)] border border-[var(--border)] animate-pulse" />
              ))}
            </div>
          ) : filteredCustomers.length > 0 ? (
            <div className="bg-[var(--card)] rounded-[var(--r16)] border border-[var(--border)] shadow-[var(--shadow-xs)] divide-y divide-[var(--border)] overflow-hidden">
              {filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg)] transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-extrabold text-sm text-[var(--t1)]">
                        {cust.name}
                      </span>
                      {getSourceBadge(cust.sourceModule, cust.sourceModules)}
                    </div>

                    <div className="text-xs text-[var(--t2)] flex items-center gap-2 flex-wrap pt-0.5 font-mono">
                      <span>📱 {cust.phone}</span>
                      {cust.email && (
                        <>
                          <span>•</span>
                          <span>✉️ {cust.email}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                    <div className="text-left sm:text-right text-xs">
                      <div className="text-[var(--t3)]">
                        {cust.totalOrders || 0} orders • {cust.totalBookings || 0} bookings
                      </div>
                      <div className="font-extrabold text-sm text-emerald-700 font-heading">
                        Spent: {business.currencySymbol}{cust.totalSpent || 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleWhatsApp(cust)}
                        className="p-2 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-[var(--r8)] transition cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedCustomerDetails(cust)}
                        className="p-2 text-[var(--t2)] hover:bg-[var(--bg)] border border-[var(--border)] rounded-[var(--r8)] transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenCustomerModal(cust)}
                        className="p-2 text-[var(--t2)] hover:bg-[var(--bg)] border border-[var(--border)] rounded-[var(--r8)] transition cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setCustomerToDelete(cust)}
                        className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-[var(--r8)] transition cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[var(--card)] rounded-[var(--r16)] border border-dashed border-[var(--border)] space-y-3">
              <div className="w-12 h-12 rounded-[var(--r12)] bg-[var(--g100)] text-[var(--g600)] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--t1)] font-heading">No Customers Found</h3>
              <p className="text-xs text-[var(--t2)] max-w-sm mx-auto">
                Customers will automatically appear here when they place orders, book sessions, or register for events.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expenses Tab Content */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {expenses.length > 0 ? (
            <div className="bg-[var(--card)] rounded-[var(--r16)] border border-[var(--border)] shadow-[var(--shadow-xs)] divide-y divide-[var(--border)] overflow-hidden">
              {expenses.map((exp) => (
                <div key={exp.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--t1)]">{exp.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {exp.category}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--t3)]">Date: {exp.date} {exp.notes ? `• ${exp.notes}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-rose-600 text-base font-heading">
                      -{business.currencySymbol}{exp.amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenExpenseModal(exp)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[var(--card)] rounded-[var(--r16)] border border-dashed border-[var(--border)] space-y-3">
              <div className="w-12 h-12 rounded-[var(--r12)] bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--t1)] font-heading">No Expenses Logged</h3>
              <p className="text-xs text-[var(--t2)] max-w-sm mx-auto">
                Keep track of inventory purchases, marketing costs, and creator expenses here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CUSTOMER ADD / EDIT MODAL */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[var(--card)] rounded-[var(--r16)] shadow-[var(--shadow-xl)] border border-[var(--border)] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--t1)] font-heading">
                {editingCustomer ? 'Edit CRM Customer' : 'Add New Customer'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1.5 text-[var(--t3)] hover:text-[var(--t1)] rounded-[var(--r8)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 pt-2 text-xs">
              {customerError && (
                <div className="p-3 rounded-[var(--r8)] bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {customerError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Customer Name *</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Full name..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">WhatsApp / Phone *</label>
                <input
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(sanitizePhoneNumberInput(e.target.value))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)] font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Email Address</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Delivery Address</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Street address, city..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Internal CRM Notes</label>
                <textarea
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  rows={3}
                  placeholder="Preferences, tags, or notes..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="flex-1 ds-btn-primary py-2.5 font-bold text-xs cursor-pointer"
                >
                  {isSavingCustomer ? 'Saving...' : 'Save Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2.5 bg-[var(--bg)] text-[var(--t2)] font-bold text-xs rounded-[var(--r8)] border border-[var(--border)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER DETAILS SLIDE-OVER / MODAL */}
      {selectedCustomerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[var(--card)] rounded-[var(--r16)] shadow-[var(--shadow-xl)] border border-[var(--border)] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--t1)] font-heading">
                  {selectedCustomerDetails.name}
                </h3>
                <p className="text-xs text-[var(--t3)] font-mono">{selectedCustomerDetails.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerDetails(null)}
                className="p-1.5 text-[var(--t3)] hover:text-[var(--t1)] rounded-[var(--r8)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[var(--bg)] rounded-[var(--r12)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--t3)] uppercase font-bold block">Orders</span>
                  <span className="text-lg font-black text-[var(--t1)]">{selectedCustomerDetails.totalOrders || 0}</span>
                </div>
                <div className="p-3 bg-[var(--bg)] rounded-[var(--r12)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--t3)] uppercase font-bold block">Bookings</span>
                  <span className="text-lg font-black text-[var(--t1)]">{selectedCustomerDetails.totalBookings || 0}</span>
                </div>
                <div className="p-3 bg-[var(--bg)] rounded-[var(--r12)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--t3)] uppercase font-bold block">Total Spent</span>
                  <span className="text-lg font-black text-emerald-700">{business.currencySymbol}{selectedCustomerDetails.totalSpent || 0}</span>
                </div>
              </div>

              <div className="p-4 bg-[var(--bg)] rounded-[var(--r12)] border border-[var(--border)] space-y-2">
                <span className="font-bold text-[var(--t3)] uppercase text-[10px] tracking-wider block">Contact Information</span>
                {selectedCustomerDetails.email && (
                  <div className="flex items-center gap-2 text-[var(--t1)]">
                    <Mail className="w-4 h-4 text-[var(--t3)]" />
                    <span>{selectedCustomerDetails.email}</span>
                  </div>
                )}
                {selectedCustomerDetails.address && (
                  <div className="flex items-center gap-2 text-[var(--t1)]">
                    <MapPin className="w-4 h-4 text-[var(--t3)]" />
                    <span>{selectedCustomerDetails.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[var(--t1)]">
                  <Phone className="w-4 h-4 text-[var(--t3)]" />
                  <span>{selectedCustomerDetails.phone}</span>
                </div>
              </div>

              {selectedCustomerDetails.notes && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-[var(--r12)] space-y-1">
                  <span className="font-bold text-amber-900 text-[10px] uppercase tracking-wider block">CRM Notes</span>
                  <p className="text-amber-800 leading-relaxed">{selectedCustomerDetails.notes}</p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleWhatsApp(selectedCustomerDetails)}
                  className="w-full ds-btn-primary py-3 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[var(--shadow-xs)]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE ADD / EDIT MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[var(--card)] rounded-[var(--r16)] shadow-[var(--shadow-xl)] border border-[var(--border)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--t1)] font-heading">
                {editingExpense ? 'Edit Expense Record' : 'Log Business Expense'}
              </h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 text-[var(--t3)] hover:text-[var(--t1)] rounded-[var(--r8)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 pt-2 text-xs">
              {expenseError && (
                <div className="p-3 rounded-[var(--r8)] bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {expenseError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Expense Title / Description *</label>
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. Raw materials, Packaging, Server hosting..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--t1)]">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--card)] text-[var(--t1)] font-medium"
                  >
                    <option value="inventory">Inventory & Stock</option>
                    <option value="marketing">Marketing & Ads</option>
                    <option value="utilities">Utilities & Tech</option>
                    <option value="salary">Salary & Payroll</option>
                    <option value="other">Other Overhead</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[var(--t1)]">Amount ({business.currencySymbol}) *</label>
                  <input
                    type="number"
                    min="1"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)] font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--t1)]">Notes / Receipt Ref</label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="Optional reference notes..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--r8)] bg-[var(--bg)] text-[var(--t1)]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingExpense}
                  className="flex-1 ds-btn-primary py-2.5 font-bold text-xs cursor-pointer"
                >
                  {isSavingExpense ? 'Saving...' : 'Save Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
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
        isOpen={!!customerToDelete}
        title="Delete Customer?"
        message={`Are you sure you want to delete customer ${customerToDelete?.name}?`}
        confirmText="Delete"
        cancelText="Keep"
        isDestructive={true}
        isLoading={isDeletingCustomer}
        onConfirm={handleDeleteCustomerConfirm}
        onCancel={() => setCustomerToDelete(null)}
      />
    </div>
  );
};
