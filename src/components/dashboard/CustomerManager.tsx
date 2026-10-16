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
} from 'lucide-react';
import { BusinessProfile, Customer, Expense } from '../../types';
import {
  getCustomers,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../services/firebaseService';
import { exportToCSV } from '../../utils/export';
import { isCreatorProfile } from '../../utils/profileHelper';

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

  const filteredExpenses = expenses.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            {isCreator ? 'Audience, Clients & Financials' : 'Customer CRM & Expense Tracker'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage customer records, track operational costs, and view real-time Profit &amp; Loss.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'expenses' ? (
            <button
              type="button"
              onClick={() => handleOpenExpenseModal()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Expense</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('crm')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'crm'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Directory ({customers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expense Tracker &amp; P&amp;L ({expenses.length})</span>
        </button>
      </div>

      {activeTab === 'expenses' ? (
        <div className="space-y-6">
          {/* P&L Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Revenue</span>
              <div className="text-xl font-extrabold text-emerald-700 font-heading">
                {business.currencySymbol}{totalCustomerRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400">Direct sales &amp; bookings</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Operating Expenses</span>
              <div className="text-xl font-extrabold text-rose-600 font-heading">
                {business.currencySymbol}{totalExpenseAmount.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400">{expenses.length} expense records logged</p>
            </div>

            <div className={`p-4 rounded-2xl border shadow-2xs space-y-1 ${
              netProfitLoss >= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Net Profit / Loss</span>
                {netProfitLoss >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-rose-600" />}
              </div>
              <div className={`text-xl font-extrabold font-heading ${netProfitLoss >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                {business.currencySymbol}{netProfitLoss.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {netProfitLoss >= 0 ? 'Positive Operating Profit 🎉' : 'Operating Deficit'}
              </p>
            </div>
          </div>

          {/* Search Bar for Expenses */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses by title, category, notes..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Expenses Table */}
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /></div>
          ) : filteredExpenses.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {filteredExpenses.map((exp) => (
                <div key={exp.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">{exp.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {exp.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{exp.date}</span>
                      {exp.notes && <span>• {exp.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-rose-600 text-sm">
                      -{business.currencySymbol}{exp.amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenExpenseModal(exp)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Expenses Logged</h3>
              <p className="text-xs text-slate-500">Record costs like inventory, rent, or marketing to compute net profit.</p>
              <button
                type="button"
                onClick={() => handleOpenExpenseModal()}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Add First Expense
              </button>
            </div>
          )}
        </div>
      ) : (
        /* CRM TAB */
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${isCreator ? 'clients' : 'customers'} by name, phone, or email...`}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {[
                { id: 'all', label: 'All Contacts' },
                ...(isCreator
                  ? [
                      { id: 'digital_store', label: 'Digital Store' },
                      { id: 'consultation', label: '1:1 Consultations' },
                      { id: 'event', label: 'Event Tickets' },
                      { id: 'quote', label: 'Custom Quotes' },
                      { id: 'review', label: 'Reviewers' },
                    ]
                  : [
                      { id: 'storefront', label: 'Store Orders' },
                      { id: 'consultation', label: 'Bookings' },
                      { id: 'quote', label: 'Custom Quotes' },
                    ]),
              ].map((filt) => (
                <button
                  key={filt.id}
                  type="button"
                  onClick={() => setSelectedModuleFilter(filt.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs shrink-0 transition cursor-pointer ${
                    selectedModuleFilter === filt.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filt.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filteredCustomers.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl font-extrabold text-sm flex items-center justify-center shrink-0 ${
                      isCreator ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100/70 text-emerald-800'
                    }`}>
                      {cust.name ? cust.name.slice(0, 2).toUpperCase() : 'CU'}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{cust.name}</h3>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                        <span>{cust.phone}</span>
                        {cust.email && (
                          <>
                            <span>•</span>
                            <span>{cust.email}</span>
                          </>
                        )}
                      </div>
                      {getSourceBadge(cust.sourceModule, cust.sourceModules)}
                      {cust.address && (
                        <p className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">{cust.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-4 text-xs">
                      {cust.totalOrders > 0 && (
                        <div className="text-center">
                          <div className="font-extrabold text-slate-900">{cust.totalOrders}</div>
                          <div className="text-[10px] text-slate-400">{isCreator ? 'Sales' : 'Orders'}</div>
                        </div>
                      )}

                      {cust.totalBookings > 0 && (
                        <div className="text-center">
                          <div className="font-extrabold text-slate-900">{cust.totalBookings}</div>
                          <div className="text-[10px] text-slate-400">Bookings</div>
                        </div>
                      )}

                      <div className="text-center">
                        <div className="font-extrabold text-emerald-700">
                          {business.currencySymbol}{cust.totalSpent || 0}
                        </div>
                        <div className="text-[10px] text-slate-400">Total Spent</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleWhatsApp(cust)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Contacts Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isCreator
                  ? 'Client records will be automatically logged here as clients purchase digital products, book 1:1 sessions, buy event tickets, or request quotes.'
                  : 'Customers will be automatically recorded here as soon as they place orders or submit bookings on your storefront.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* RECORD / EDIT EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingExpense ? 'Edit Expense Record' : 'Record Business Expense'}
                </h3>
                <p className="text-[11px] text-slate-500">Track costs for accurate P&amp;L reporting.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              {expenseError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {expenseError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. Raw materials inventory, Shop Rent, Google Ads"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="inventory">Inventory / Stock</option>
                    <option value="rent">Rent / Premises</option>
                    <option value="utilities">Utilities &amp; Bills</option>
                    <option value="salaries">Salaries &amp; Wages</option>
                    <option value="marketing">Marketing &amp; Ads</option>
                    <option value="software">SaaS &amp; Software</option>
                    <option value="logistics">Logistics &amp; Courier</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amount ({business.currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expenseAmount || ''}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    placeholder="500"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Date
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="e.g. Paid via UPI reference #12345"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingExpense}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                >
                  {isSavingExpense ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editingExpense ? 'Update Expense' : 'Save Expense'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

