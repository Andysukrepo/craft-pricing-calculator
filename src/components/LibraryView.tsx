import React, { useState } from 'react';
import {
  Plus,
  Search,
  ArrowUpDown,
  Download,
  Edit2,
  Trash2,
  PlusCircle,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { LibraryMaterial, UnitType } from '../types/calculator';
import { UNITS, formatMoney } from '../utils/calculator';
import { FREE_LIMITS } from '../utils/license';
import { Sparkles } from 'lucide-react';

interface LibraryViewProps {
  library: LibraryMaterial[];
  onAddMaterial: (item: Omit<LibraryMaterial, '__backendId' | 'updated_at'>) => void;
  onUpdateMaterial: (backendId: string, item: Omit<LibraryMaterial, '__backendId' | 'updated_at'>) => void;
  onDeleteMaterial: (backendId: string) => void;
  onUseInProduct: (material: LibraryMaterial) => void;
  isPro?: boolean;
  onOpenPaywall?: (feature?: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  library,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onUseInProduct,
  isPro = false,
  onOpenPaywall,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost'>('name');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formPack, setFormPack] = useState(1);
  const [formUnit, setFormUnit] = useState<UnitType>('each');
  const [formPrice, setFormPrice] = useState(0);
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    if (!isPro && library.length >= FREE_LIMITS.maxLibraryMaterials) {
      onOpenPaywall?.(
        `Free plan is limited to ${FREE_LIMITS.maxLibraryMaterials} materials. Upgrade to PRO to store unlimited craft supplies.`
      );
      return;
    }
    setEditingId(null);
    setFormName('');
    setFormSupplier('');
    setFormPack(1);
    setFormUnit('each');
    setFormPrice(0);
    setFormNotes('');
    setModalOpen(true);
  };

  const openEditModal = (item: LibraryMaterial) => {
    setEditingId(item.__backendId);
    setFormName(item.name);
    setFormSupplier(item.supplier);
    setFormPack(item.pack);
    setFormUnit(item.unit);
    setFormPrice(item.price);
    setFormNotes(item.notes);
    setModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a material name.');
      return;
    }
    if (formPack <= 0) {
      alert('Pack quantity must be greater than zero.');
      return;
    }

    if (editingId) {
      onUpdateMaterial(editingId, {
        name: formName.trim(),
        supplier: formSupplier.trim(),
        pack: formPack,
        unit: formUnit,
        price: formPrice,
        notes: formNotes.trim(),
      });
    } else {
      onAddMaterial({
        name: formName.trim(),
        supplier: formSupplier.trim(),
        pack: formPack,
        unit: formUnit,
        price: formPrice,
        notes: formNotes.trim(),
      });
    }
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    if (!isPro) {
      onOpenPaywall?.('CSV materials library export is a PRO feature. Upgrade to export your supplier price database.');
      return;
    }

    const rows = [
      ['Material Name', 'Supplier', 'Pack Quantity', 'Unit', 'Pack Price (£)', 'Cost Per Unit (£)', 'Notes', 'Updated'],
      ...library.map((item) => [
        item.name,
        item.supplier,
        String(item.pack),
        item.unit,
        item.price.toFixed(2),
        (item.price / (item.pack || 1)).toFixed(4),
        item.notes,
        item.updated_at,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'craft-materials-library.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort
  const filtered = library.filter((m) =>
    `${m.name} ${m.supplier} ${m.notes}`.toLowerCase().includes(search.toLowerCase())
  );

  filtered.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    const costA = a.price / (a.pack || 1);
    const costB = b.price / (b.pack || 1);
    return costA - costB;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dbe1e6]">
        <div>
          <h2 className="header-title text-[18px] font-bold text-[#1e293b]">
            Materials Library
          </h2>
          <p className="header-subtitle text-[12px] font-normal text-[#5d6d7d] mt-1">
            Store your bulk craft supplies, supplier prices and unit costs to quickly reuse across product calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
              isPro
                ? 'border-[#dbe1e6] bg-[#ffffff] hover:border-[#2d3e51] text-[#2d3e51]'
                : 'border-amber-300 bg-amber-50/60 hover:bg-amber-100/80 text-amber-950'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
            {!isPro && (
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/80 px-1 rounded">
                PRO
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] active:bg-[#1f2d3d] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Library Material</span>
          </button>
        </div>
      </div>

      {/* Free Plan Limit Notice */}
      {!isPro && library.length >= FREE_LIMITS.maxLibraryMaterials && (
        <div className="bg-[#fff1df] border border-[#ead2a9] text-[#714318] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-200/60 text-amber-900 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <strong className="font-bold text-amber-950 block">
                Free Plan Limit Reached ({library.length} of {FREE_LIMITS.maxLibraryMaterials} materials)
              </strong>
              <span className="text-[11px] text-amber-900">
                You have reached the free tier limit. Upgrade to PRO to store an unlimited materials library with automated cost-per-unit sync.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onOpenPaywall?.(
                `Free plan is limited to ${FREE_LIMITS.maxLibraryMaterials} library materials. Upgrade to PRO for unlimited materials.`
              )
            }
            className="px-4 py-2 rounded-full bg-[#0072ce] hover:bg-[#005ea6] text-white font-bold text-xs shadow-sm hover:shadow transition active:scale-95 flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <span className="text-xs leading-none" role="img" aria-label="star">⭐</span>
            <span>Unlock PRO</span>
          </button>
        </div>
      )}

      {/* Search and Sort Toolbar (With mobile-optimized select dropdown) */}
      <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-[#5d6d7d] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by material name, supplier or notes..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#dbe1e6] rounded-xl text-base sm:text-xs text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          {/* Sort Dropdown - Explicit mobile test & onChange hook */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'cost')}
              className="w-full appearance-none bg-white border border-[#dbe1e6] rounded-xl px-4 py-2.5 pr-9 text-base sm:text-xs font-semibold text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            >
              <option value="name">Sort by: Name (A-Z)</option>
              <option value="cost">Sort by: Cost per Unit (Lowest first)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          </div>
        </div>

        {/* Library Table */}
        <div className="mt-4 overflow-x-auto border border-[#dbe1e6] rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#dbe1e6] text-[#5d6d7d]">
                <th className="py-3 px-4 font-bold">Material Name</th>
                <th className="py-3 px-4 font-bold">Supplier</th>
                <th className="py-3 px-4 font-bold">Pack Purchase</th>
                <th className="py-3 px-4 font-bold">Pack Price</th>
                <th className="py-3 px-4 font-bold">Cost / Unit</th>
                <th className="py-3 px-4 font-bold">Notes</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#5d6d7d]">
                    No materials found. Click &quot;Add Library Material&quot; to save your supplies.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const unitCost = item.price / (item.pack || 1);
                  return (
                    <tr
                      key={item.__backendId}
                      className={`border-b border-[#dbe1e6] hover:bg-slate-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#f8fafc]'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-[#2d3e51]">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-[#5d6d7d]">{item.supplier || '—'}</td>
                      <td className="py-3 px-4 font-semibold text-[#2d3e51]">
                        {item.pack} {item.unit}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2d3e51]">
                        {formatMoney(item.price)}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#34495d]">
                        {formatMoney(unitCost)} <span className="text-[10px] text-[#5d6d7d]">/ {item.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-[#5d6d7d] max-w-xs truncate" title={item.notes}>
                        {item.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUseInProduct(item)}
                            className="px-2.5 py-1 rounded-lg bg-[#2d3e51] hover:bg-[#34495d] active:bg-[#1f2d3d] text-white text-[11px] font-bold shadow-xs transition"
                          >
                            Use in Product
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1 rounded-lg border border-[#dbe1e6] bg-white hover:border-[#2d3e51] text-[#2d3e51] transition"
                            title="Edit material"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMaterial(item.__backendId)}
                            className="p-1 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition"
                            title="Delete material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Material Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-6 w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#dbe1e6]">
              <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51]">
                {editingId ? 'Edit Library Material' : 'Add Library Material'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2d3e51] mb-1">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 100% Cotton Canvas Fabric"
                  className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d3e51] mb-1">
                  Supplier / Brand
                </label>
                <input
                  type="text"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  placeholder="e.g. Whaleys Bradford"
                  className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d3e51] mb-1">
                    Pack Purchase Qty
                  </label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    required
                    value={formPack}
                    onChange={(e) => setFormPack(parseFloat(e.target.value) || 1)}
                    className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
                  />
                </div>

                {/* Pack Unit Dropdown (Mobile-tested) */}
                <div>
                  <label className="block text-xs font-bold text-[#2d3e51] mb-1">
                    Pack Unit
                  </label>
                  <div className="relative">
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value as UnitType)}
                      className="w-full appearance-none text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 pr-8 text-[#2d3e51]"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d3e51] mb-1">
                    Total Pack Price (£)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2d3e51] mb-1">
                    Calculated Unit Cost
                  </label>
                  <div className="px-3 py-2 bg-[#edf2f5] border border-emerald-200 rounded-xl text-xs font-bold text-[#34495d]">
                    {formatMoney(formPrice / (formPack || 1))} / {formUnit}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d3e51] mb-1">
                  Notes / SKU
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Order in bulk for 10% discount"
                  className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
                />
              </div>

              <div className="pt-3 border-t border-[#dbe1e6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#dbe1e6] hover:bg-zinc-100 text-xs font-bold text-[#2d3e51]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Add to Library'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
