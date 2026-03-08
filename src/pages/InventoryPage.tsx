import { useState } from 'react';
import { Package, Plus, ChevronDown, ChevronUp, Wrench, X, Pencil, Trash2, Search, Camera, Smartphone, Wind, Zap } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { mockProducts } from '@/api/mock';
import { formatCurrencyCompact } from '@/types';
import type { Product, ProductAddon, ProductStatus } from '@/types';
import { cn } from '@/lib/utils';

// ── Status helpers ─────────────────────────────────────────────────────────────

function statusColor(s: ProductStatus) {
  switch (s) {
    case 'AVAILABLE':   return 'text-primary';
    case 'RENTED':      return 'text-blue-400';
    case 'MAINTENANCE': return 'text-amber-400';
  }
}

function statusDot(s: ProductStatus) {
  switch (s) {
    case 'AVAILABLE':   return 'bg-primary';
    case 'RENTED':      return 'bg-blue-400';
    case 'MAINTENANCE': return 'bg-amber-400';
  }
}

// ── Category image helpers ─────────────────────────────────────────────────────

function categoryStyle(category?: string): { Icon: React.ElementType; gradient: string; iconColor: string } {
  const cat = (category ?? '').toLowerCase();
  if (cat.includes('camera'))  return { Icon: Camera,     gradient: 'from-violet-500/25 to-purple-500/25',  iconColor: '#a78bfa' };
  if (cat.includes('phone'))   return { Icon: Smartphone, gradient: 'from-blue-500/25 to-cyan-500/25',      iconColor: '#60a5fa' };
  if (cat.includes('drone'))   return { Icon: Wind,       gradient: 'from-cyan-500/25 to-teal-500/25',      iconColor: '#22d3ee' };
  if (cat.includes('action'))  return { Icon: Zap,        gradient: 'from-orange-500/25 to-amber-500/25',   iconColor: '#fb923c' };
  return { Icon: Package, gradient: 'from-primary/15 to-primary/25', iconColor: '#79e19b' };
}

// ── Addon row ─────────────────────────────────────────────────────────────────

function AddonRow({
  addon,
  onEdit,
  onDelete,
}: {
  addon: ProductAddon;
  onEdit: (a: ProductAddon) => void;
  onDelete: (a: ProductAddon) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 text-xs group">
      <span className="text-foreground truncate flex-1 min-w-0 mr-2">{addon.name}</span>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 text-muted-foreground tabular-nums">
          {addon.daily_rate === 0 ? (
            <span className="text-primary">Free</span>
          ) : (
            <>
              <span>{formatCurrencyCompact(addon.daily_rate)}/day</span>
              {addon.weekly_rate != null && (
                <span className="hidden sm:inline">{formatCurrencyCompact(addon.weekly_rate)}/wk</span>
              )}
              {addon.monthly_rate != null && (
                <span className="hidden md:inline">{formatCurrencyCompact(addon.monthly_rate)}/mo</span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(addon)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            aria-label="Edit add-on"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(addon)}
            className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Delete add-on"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Addon Modal ───────────────────────────────────────────────────────────

function EditAddonModal({
  addon,
  onSave,
  onClose,
}: {
  addon: Partial<ProductAddon>;
  onSave: (data: Pick<ProductAddon, 'name' | 'daily_rate' | 'weekly_rate' | 'monthly_rate'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name:         addon.name ?? '',
    daily_rate:   String(addon.daily_rate ?? 0),
    weekly_rate:  addon.weekly_rate != null ? String(addon.weekly_rate) : '',
    monthly_rate: addon.monthly_rate != null ? String(addon.monthly_rate) : '',
  });

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({
      name:         form.name.trim(),
      daily_rate:   parseFloat(form.daily_rate) || 0,
      weekly_rate:  form.weekly_rate ? parseFloat(form.weekly_rate) : undefined,
      monthly_rate: form.monthly_rate ? parseFloat(form.monthly_rate) : undefined,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 space-y-4">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-2 sm:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{addon.id ? 'Edit Add-on' : 'New Add-on'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className={LABEL_CLASS}>Name</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Extra Battery"
              className={INPUT_CLASS}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Daily</label>
              <input
                type="number"
                value={form.daily_rate}
                onChange={e => setForm(p => ({ ...p, daily_rate: e.target.value }))}
                placeholder="0"
                min={0}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Weekly</label>
              <input
                type="number"
                value={form.weekly_rate}
                onChange={e => setForm(p => ({ ...p, weekly_rate: e.target.value }))}
                placeholder="—"
                min={0}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Monthly</label>
              <input
                type="number"
                value={form.monthly_rate}
                onChange={e => setForm(p => ({ ...p, monthly_rate: e.target.value }))}
                placeholder="—"
                min={0}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Set Daily Rate to 0 for free / included.</p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 border border-border text-muted-foreground hover:bg-background hover:text-foreground rounded-lg px-4 py-2.5 sm:py-2 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Product Modal ─────────────────────────────────────────────────────────

interface EditProductModalProps {
  product: Product;
  onSave: (updated: Partial<Product>) => void;
  onClose: () => void;
}

const INPUT_CLASS =
  'w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors';
const LABEL_CLASS = 'text-xs font-medium text-muted-foreground uppercase tracking-wide';

function EditProductModal({ product, onSave, onClose }: EditProductModalProps) {
  const [form, setForm] = useState({
    product_name: product.product_name,
    brand: product.brand ?? '',
    model: product.model ?? '',
    description: product.description ?? '',
    category: product.category ?? '',
    daily_rate: String(product.daily_rate),
    weekly_rate: product.weekly_rate != null ? String(product.weekly_rate) : '',
    monthly_rate: product.monthly_rate != null ? String(product.monthly_rate) : '',
    status: product.status,
  });

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave({
      product_name: form.product_name.trim() || product.product_name,
      brand: form.brand.trim() || undefined,
      model: form.model.trim() || undefined,
      description: form.description.trim() || undefined,
      category: form.category.trim() || undefined,
      daily_rate: parseFloat(form.daily_rate) || product.daily_rate,
      weekly_rate: form.weekly_rate ? parseFloat(form.weekly_rate) : undefined,
      monthly_rate: form.monthly_rate ? parseFloat(form.monthly_rate) : undefined,
      status: form.status as ProductStatus,
    });
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className={LABEL_CLASS}>Product Name</label>
            <input
              value={form.product_name}
              onChange={e => set('product_name', e.target.value)}
              placeholder="Product name"
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Brand</label>
              <input
                value={form.brand}
                onChange={e => set('brand', e.target.value)}
                placeholder="e.g. Canon"
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Model</label>
              <input
                value={form.model}
                onChange={e => set('model', e.target.value)}
                placeholder="e.g. G7X MK2"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={LABEL_CLASS}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional description"
              rows={2}
              className={cn(INPUT_CLASS, 'resize-none')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Category</label>
              <input
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="e.g. Camera"
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="RENTED">RENTED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Daily Rate</label>
              <input
                type="number"
                value={form.daily_rate}
                onChange={e => set('daily_rate', e.target.value)}
                placeholder="0"
                min={0}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Weekly Rate</label>
              <input
                type="number"
                value={form.weekly_rate}
                onChange={e => set('weekly_rate', e.target.value)}
                placeholder="Optional"
                min={0}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Monthly Rate</label>
              <input
                type="number"
                value={form.monthly_rate}
                onChange={e => set('monthly_rate', e.target.value)}
                placeholder="Optional"
                min={0}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-border text-muted-foreground hover:bg-background hover:text-foreground rounded-lg px-4 py-2.5 sm:py-2 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [addons, setAddons] = useState<ProductAddon[]>(product.addons ?? []);
  const [editingAddon, setEditingAddon] = useState<ProductAddon | null | 'new'>(null);

  function handleSaveAddon(data: Pick<ProductAddon, 'name' | 'daily_rate' | 'weekly_rate' | 'monthly_rate'>) {
    if (editingAddon === 'new') {
      const newAddon: ProductAddon = { id: `a-${Date.now()}`, product_id: product.id, ...data };
      setAddons(prev => [...prev, newAddon]);
    } else if (editingAddon) {
      setAddons(prev => prev.map(a => a.id === editingAddon.id ? { ...a, ...data } : a));
    }
  }

  function handleDeleteAddon(addon: ProductAddon) {
    setAddons(prev => prev.filter(a => a.id !== addon.id));
  }

  const { Icon: CatIcon, gradient, iconColor } = categoryStyle(product.category);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-border/80 transition-colors">
      {/* Main row */}
      <div className="flex items-stretch">

        {/* Image area */}
        <div className="w-[88px] sm:w-[108px] shrink-0 relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={cn('w-full h-full min-h-[96px] flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br', gradient)}>
              <CatIcon className="w-7 h-7 sm:w-8 sm:h-8 opacity-70" style={{ color: iconColor }} />
              {product.category && (
                <span className="text-[9px] sm:text-[10px] font-medium opacity-50 text-center px-1 leading-tight" style={{ color: iconColor }}>
                  {product.category}
                </span>
              )}
            </div>
          )}
          {/* Status pill overlaid on image */}
          <div className={cn('absolute top-2 left-2 flex items-center gap-1 rounded-full px-1.5 py-0.5 bg-black/50 backdrop-blur-sm')}>
            <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot(product.status))} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-snug truncate">{product.product_name}</p>
              {product.brand && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {product.brand}{product.model ? ` · ${product.model}` : ''}
                </p>
              )}
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-0.5 shrink-0 -mt-0.5">
              <button
                onClick={() => onEdit(product)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                aria-label="Edit product"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(product)}
                className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="Delete product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Status label */}
          <span className={cn('text-xs font-medium', statusColor(product.status))}>
            {product.status}
          </span>

          {product.description && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
          )}

          {/* Rates */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-2">
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {formatCurrencyCompact(product.daily_rate)}
              <span className="font-normal text-muted-foreground">/day</span>
            </span>
            {product.weekly_rate != null && (
              <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                {formatCurrencyCompact(product.weekly_rate)}/wk
              </span>
            )}
            {product.monthly_rate != null && (
              <span className="text-xs text-muted-foreground tabular-nums hidden md:inline">
                {formatCurrencyCompact(product.monthly_rate)}/mo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add-ons toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2 border-t border-border text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
      >
        <span>{addons.length} add-on{addons.length !== 1 ? 's' : ''}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="border-t border-border">
          {addons.length > 0 && (
            <div className="divide-y divide-border/50">
              {addons.map(a => (
                <AddonRow
                  key={a.id}
                  addon={a}
                  onEdit={setEditingAddon}
                  onDelete={handleDeleteAddon}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => setEditingAddon('new')}
            className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border-t border-border/50"
          >
            <Plus className="w-3 h-3" /> Add add-on
          </button>
        </div>
      )}

      {editingAddon !== null && (
        <EditAddonModal
          addon={editingAddon === 'new' ? {} : editingAddon}
          onSave={handleSaveAddon}
          onClose={() => setEditingAddon(null)}
        />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<ProductStatus | 'ALL'> = ['ALL', 'AVAILABLE', 'RENTED', 'MAINTENANCE'];

export default function InventoryPage() {
  const [products, setProducts] = useState(mockProducts);
  const [filter, setFilter] = useState<ProductStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filtered = products.filter(p => {
    const matchesFilter = filter === 'ALL' || p.status === filter;
    if (!matchesFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      p.product_name.toLowerCase().includes(q) ||
      (p.brand?.toLowerCase().includes(q) ?? false) ||
      (p.model?.toLowerCase().includes(q) ?? false) ||
      (p.description?.toLowerCase().includes(q) ?? false)
    );
  });

  const counts: Record<string, number> = { ALL: products.length };
  products.forEach(p => { counts[p.status] = (counts[p.status] ?? 0) + 1; });

  function handleSaveEdit(updated: Partial<Product>) {
    if (!editingProduct) return;
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
  }

  function handleConfirmDelete() {
    if (!deletingProduct) return;
    setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{products.length} products</p>
          </div>
          <button
            onClick={() => alert('Add Product — coming soon')}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Mobile header row */}
        <div className="flex items-center justify-between lg:hidden">
          <p className="text-xs text-muted-foreground">{products.length} products</p>
          <button
            onClick={() => alert('Add Product — coming soon')}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-card border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filter === s
                  ? 'bg-primary/10 text-primary'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {s === 'MAINTENANCE' && <Wrench className="w-3 h-3" />}
              {s}
              <span className={cn(
                'text-[10px] rounded-full px-1.5 py-0.5',
                filter === s ? 'bg-primary/20 text-primary' : 'bg-background text-muted-foreground'
              )}>
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Product list */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <X className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={setEditingProduct}
                onDelete={setDeletingProduct}
              />
            ))}
          </div>
        )}

      </div>

      {/* Edit modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onSave={handleSaveEdit}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDeleteModal
        open={!!deletingProduct}
        title={`Delete ${deletingProduct?.product_name ?? ''}?`}
        description="This action cannot be undone."
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}
