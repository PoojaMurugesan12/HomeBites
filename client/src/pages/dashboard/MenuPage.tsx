import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select, Textarea } from '../../components/common/Inputs';
import { api } from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import type { MenuItem, MenuCategory, InventoryItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const MenuPage: React.FC = () => {
  const { user, activeKitchen } = useAuth();
  const isOwner = user?.role === 'KITCHEN_OWNER' || activeKitchen?.role === 'OWNER';

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');

  // Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    imageUrl: '',
    sellingPrice: 250,
    costPrice: 85,
    prepTimeMinutes: 15,
    isAvailable: true,
    tags: ''
  });

  // Recipe Form State
  const [recipeState, setRecipeState] = useState<{
    menuItemId: string;
    yieldQuantity: number;
    notes: string;
    ingredients: { ingredientId: string; quantity: number; unit: string }[];
  }>({
    menuItemId: '',
    yieldQuantity: 1,
    notes: '',
    ingredients: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, invRes] = await Promise.all([
        api.get('/menu'),
        api.get('/inventory')
      ]);

      if (menuRes.success) {
        setItems(menuRes.items || []);
        setCategories(menuRes.categories || []);
      }
      if (invRes.success) {
        setInventoryItems(invRes.items || []);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeKitchen?.id]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 250,
      costPrice: 85,
      prepTimeMinutes: 15,
      isAvailable: true,
      tags: ''
    });
    setItemModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      sellingPrice: Number(item.sellingPrice),
      costPrice: Number(item.costPrice),
      prepTimeMinutes: item.prepTimeMinutes,
      isAvailable: item.isAvailable,
      tags: item.tags || ''
    });
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingItem) {
        const res = await api.patch(`/menu/${editingItem.id}`, formData);
        if (res.success) {
          setItems((prev) => prev.map((m) => (m.id === editingItem.id ? res.item : m)));
          setItemModalOpen(false);
        }
      } else {
        const res = await api.post('/menu', formData);
        if (res.success) {
          setItems((prev) => [res.item, ...prev]);
          setItemModalOpen(false);
        }
      }
    } catch (err: any) {
      alert(`Failed to save menu item: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await api.patch(`/menu/${item.id}/toggle-availability`);
      if (res.success) {
        setItems((prev) => prev.map((m) => (m.id === item.id ? res.item : m)));
      }
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleArchiveItem = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to archive "${item.name}"? Historical orders will be preserved.`)) return;
    try {
      const res = await api.delete(`/menu/${item.id}`);
      if (res.success) {
        setItems((prev) => prev.filter((m) => m.id !== item.id));
      }
    } catch (err: any) {
      alert(`Archive failed: ${err.message}`);
    }
  };

  // Recipe configuration
  const handleOpenRecipeModal = (item: MenuItem) => {
    const existing = item.recipe;
    setRecipeState({
      menuItemId: item.id,
      yieldQuantity: existing?.yieldQuantity || 1,
      notes: existing?.notes || '',
      ingredients: existing?.ingredients.map((ri) => ({
        ingredientId: ri.ingredientId,
        quantity: Number(ri.quantity),
        unit: ri.unit
      })) || [
        {
          ingredientId: inventoryItems[0]?.ingredientId || '',
          quantity: 0.20,
          unit: inventoryItems[0]?.unit || 'kg'
        }
      ]
    });
    setEditingItem(item);
    setRecipeModalOpen(true);
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/menu/recipes', recipeState);
      if (res.success) {
        fetchData();
        setRecipeModalOpen(false);
      }
    } catch (err: any) {
      alert(`Failed to configure recipe: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Menu Management & Recipe Linking
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Configure dishes, unit margins, and recipe ingredient linkages for automated stock deduction.
          </p>
        </div>

        {isOwner && (
          <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-1" /> Add Menu Item
          </Button>
        )}
      </div>

      {/* Categories Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === ''
                ? 'bg-brand-navy text-white shadow-2xs'
                : 'bg-white border border-surface-border text-content-secondary hover:text-content-primary'
            }`}
          >
            All Dishes ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-brand-navy text-white shadow-2xs'
                  : 'bg-white border border-surface-border text-content-secondary hover:text-content-primary'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-content-muted" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
          <p className="text-xs text-content-secondary">Loading kitchen menu...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-surface-border">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-content-muted flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-content-primary">No Menu Items Found</h3>
          <p className="text-xs text-content-secondary max-w-sm mx-auto">
            Add your first kitchen specialty to begin tracking contribution margins and recipe inventory.
          </p>
          {isOwner && (
            <Button size="sm" variant="primary" onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4 mr-1" /> Add First Dish
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const selling = Number(item.sellingPrice);
            const cost = Number(item.costPrice);
            const contribution = selling - cost;
            const marginPct = selling > 0 ? (contribution / selling) * 100 : 0;
            const hasRecipe = item.recipe && item.recipe.ingredients.length > 0;

            return (
              <Card key={item.id} className="overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  {/* Photo & Availability badge */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <UtensilsCrossed className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : '86ed / Out of Stock'}
                      </button>
                    </div>
                    {item.category && (
                      <div className="absolute bottom-2.5 left-2.5 bg-brand-navy/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        {item.category.name}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-content-primary line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-content-secondary line-clamp-2 mt-1 leading-snug">
                        {item.description || 'Cloud kitchen specialty prepared fresh on order.'}
                      </p>
                    </div>

                    {/* Unit Economics Box (Owner only) */}
                    <div className="p-3 bg-surface-muted rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-content-secondary">Selling Price:</span>
                        <span className="font-extrabold text-content-primary">{formatCurrency(item.sellingPrice)}</span>
                      </div>
                      {isOwner && (
                        <>
                          <div className="flex justify-between items-center text-content-secondary">
                            <span>Estimated Cost:</span>
                            <span>{formatCurrency(item.costPrice)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-surface-border/60">
                            <span className="font-semibold text-content-primary">Unit Contribution:</span>
                            <span className="font-bold text-brand-teal">
                              {formatCurrency(contribution)} ({marginPct.toFixed(0)}%)
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Recipe status indicator */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-content-secondary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.prepTimeMinutes} mins prep</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${hasRecipe ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        <span className="text-content-secondary">
                          {hasRecipe ? `${item.recipe?.ingredients.length} ingredients linked` : 'No recipe linked'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 bg-surface-muted/50 border-t border-surface-border/60 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs py-1"
                    onClick={() => handleOpenRecipeModal(item)}
                  >
                    <Layers className="w-3.5 h-3.5 mr-1" /> Configure Recipe
                  </Button>

                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-content-secondary hover:text-content-primary rounded hover:bg-surface-muted transition-colors"
                        title="Edit dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchiveItem(item)}
                        className="p-1.5 text-status-error hover:bg-rose-50 rounded transition-colors"
                        title="Archive dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT MENU ITEM */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? `Edit Dish: ${editingItem.name}` : 'Add New Menu Item'}
        description="Configure menu pricing, estimated cost, and dish details."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <Input
            label="Dish Name *"
            required
            placeholder="e.g. Hyderabadi Chicken Dum Biryani"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Select
            label="Menu Category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">Select Category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Selling Price (₹) *"
              type="number"
              required
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
            />
            <Input
              label="Estimated Variable Cost (₹) *"
              type="number"
              required
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prep Time (Minutes)"
              type="number"
              min="1"
              value={formData.prepTimeMinutes}
              onChange={(e) => setFormData({ ...formData, prepTimeMinutes: parseInt(e.target.value, 10) || 15 })}
            />
            <Input
              label="Tags (Comma separated)"
              placeholder="e.g. Bestseller, Non-Veg, Spicy"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <Input
            label="Image URL (Unsplash or verified CDN)"
            placeholder="https://images.unsplash.com/..."
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />

          <Textarea
            label="Dish Description"
            placeholder="Describe the preparation style, portion size, and accompaniment..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2 border-t border-surface-border">
            <Button type="button" variant="ghost" onClick={() => setItemModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Save Menu Dish
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RECIPE INGREDIENT LINKAGE */}
      <Modal
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        title={`Recipe Ingredient Configuration: ${editingItem?.name}`}
        description="Link raw inventory ingredients and quantities required for 1 portion of this dish."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveRecipe} className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-content-primary uppercase tracking-wider">
              Recipe Ingredients per Portion
            </span>
            {recipeState.ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-surface-muted p-2 rounded-lg">
                <div className="flex-1">
                  <select
                    value={ing.ingredientId}
                    onChange={(e) => {
                      const selectedInv = inventoryItems.find((inv) => inv.ingredientId === e.target.value);
                      const updated = [...recipeState.ingredients];
                      updated[idx].ingredientId = e.target.value;
                      if (selectedInv) updated[idx].unit = selectedInv.unit;
                      setRecipeState({ ...recipeState, ingredients: updated });
                    }}
                    className="w-full text-xs p-2 bg-white border border-surface-border rounded-md"
                  >
                    <option value="">Select ingredient...</option>
                    {inventoryItems.map((inv) => (
                      <option key={inv.id} value={inv.ingredientId || ''}>
                        {inv.name} ({inv.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => {
                      const updated = [...recipeState.ingredients];
                      updated[idx].quantity = parseFloat(e.target.value) || 0;
                      setRecipeState({ ...recipeState, ingredients: updated });
                    }}
                    className="w-full text-xs p-2 bg-white border border-surface-border rounded-md text-center"
                  />
                </div>
                <div className="w-16 text-xs text-content-secondary font-semibold">
                  {ing.unit}
                </div>
                {recipeState.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = recipeState.ingredients.filter((_, i) => i !== idx);
                      setRecipeState({ ...recipeState, ingredients: updated });
                    }}
                    className="p-1 text-status-error hover:bg-rose-50 rounded"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setRecipeState({
                ...recipeState,
                ingredients: [
                  ...recipeState.ingredients,
                  {
                    ingredientId: inventoryItems[0]?.ingredientId || '',
                    quantity: 0.1,
                    unit: inventoryItems[0]?.unit || 'kg'
                  }
                ]
              });
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Recipe Ingredient
          </Button>

          <Textarea
            label="Chef Notes / Recipe Instructions"
            placeholder="Slow steam for 20 minutes on low flame..."
            value={recipeState.notes}
            onChange={(e) => setRecipeState({ ...recipeState, notes: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2 border-t border-surface-border">
            <Button type="button" variant="ghost" onClick={() => setRecipeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Save Recipe Linkage
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
