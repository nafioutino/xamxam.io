'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Plus, Upload, Download, Search as SearchIcon, Package } from 'lucide-react';
import { useShop } from '@/hooks/useShop';


interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  category?: { id: string; name: string } | null;
  isActive?: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
}

export default function CataloguePage() {
  const { shop, isLoading: shopLoading } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger catégories et produits depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      if (!shop || shopLoading) return;
      setLoading(true);
      try {
        // Catégories actives
        const catRes = await fetch(`/api/category?shopId=${shop.id}&isActive=true`);
        const catJson = await catRes.json();
        if (catJson?.success) {
          const opts: CategoryOption[] = (catJson.data || []).map((c: any) => ({ id: c.id, name: c.name }));
          setCategories(opts);
        }
        // Produits
        const prodRes = await fetch(`/api/product?shopId=${shop.id}`);
        const prodJson = await prodRes.json();
        if (prodJson?.success) {
          const list: Product[] = (prodJson.data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            images: Array.isArray(p.images) ? p.images : [],
            category: p.category ? { id: p.category.id, name: p.category.name } : null,
            isActive: p.isActive ?? true,
          }));
          setProducts(list);
        } else {
          toast.error(prodJson?.message || 'Erreur lors du chargement des produits');
        }
      } catch (e) {
        console.error(e);
        toast.error("Impossible de charger les données du catalogue");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shop, shopLoading]);

  // Get all unique categories
  const allCategories = ['all', ...categories.map((c) => c.id)];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [] as any[];
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = (cols[idx] || '').trim();
      });
      rows.push(obj);
    }
    return rows;
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!shop) {
      toast.error('Boutique introuvable');
      return;
    }
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
        toast.error('CSV vide ou invalide');
        return;
      }
      toast.loading('Import en cours...', { id: 'import-catalogue' });
      // Charger mapping des catégories par nom
      const catsByName: Record<string, string> = {};
      categories.forEach((c) => (catsByName[c.name.toLowerCase()] = c.id));
      let createdCount = 0;
      for (const r of rows) {
        const name = r.name || r.nom;
        const description = r.description || '';
        const price = parseFloat(r.price || r.prix || '0');
        const stock = parseInt(r.stock || '0');
        const sku = r.sku || null;
        const imageUrls = (r.imageUrls || r.images || '').split(';').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        const categoryName = (r.categoryName || r.categorie || '').toLowerCase();
        const categoryId = catsByName[categoryName];
        if (!name || !price || !categoryId) {
          console.warn('Ligne ignorée (données manquantes):', r);
          continue;
        }
        const res = await fetch('/api/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            price,
            stock,
            images: imageUrls,
            sku,
            shopId: shop.id,
            categoryId,
            isActive: true,
          }),
        });
        const json = await res.json();
        if (json?.success) createdCount++;
      }
      toast.success(`${createdCount} produit(s) importé(s)`, { id: 'import-catalogue' });
      // Rafraîchir
      setSelectedCategory('all');
      setSearchTerm('');
      // Recharger les produits
      if (shop) {
        const prodRes = await fetch(`/api/product?shopId=${shop.id}`);
        const prodJson = await prodRes.json();
        if (prodJson?.success) {
          const list: Product[] = (prodJson.data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            images: Array.isArray(p.images) ? p.images : [],
            category: p.category ? { id: p.category.id, name: p.category.name } : null,
            isActive: p.isActive ?? true,
          }));
          setProducts(list);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur pendant l\'import CSV');
    } finally {
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportCSV = () => {
    const headers = ['id','name','price','stock','sku','categoryName','imageUrls'];
    const lines = [headers.join(',')];
    filteredProducts.forEach((p) => {
      const imageUrls = (p.images || []).join(';');
      const sku = '';
      const categoryName = p.category?.name || '';
      lines.push([
        p.id,
        p.name,
        p.price,
        p.stock,
        sku,
        categoryName,
        imageUrls,
      ].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalogue.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV généré');
  };

  const openView = (product: Product) => {
    setModalProduct(product);
    setIsEditing(false);
  };

  const openEdit = (product: Product) => {
    setModalProduct(product);
    setIsEditing(true);
  };

  const closeModal = () => {
    setModalProduct(null);
    setIsEditing(false);
  };

  const saveEdit = async (updates: Partial<Product> & { categoryId?: string }) => {
    if (!modalProduct) return;
    try {
      toast.loading('Mise à jour...', { id: 'edit-product' });
      const res = await fetch('/api/product', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modalProduct.id, ...updates }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || 'Echec mise à jour');
      // Update local state
      setProducts((prev) => prev.map((p) => (p.id === modalProduct.id ? {
        ...p,
        ...updates,
        category: updates.categoryId ? { id: updates.categoryId, name: categories.find((c) => c.id === updates.categoryId)?.name || p.category?.name || '' } : p.category,
      } : p)));
      toast.success('Produit mis à jour', { id: 'edit-product' });
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error("Impossible de mettre à jour le produit", { id: 'edit-product' });
    }
  };

  const deleteProduct = async () => {
    if (!modalProduct) return;
    try {
      toast.loading('Suppression...', { id: 'delete-product' });
      const res = await fetch('/api/product', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modalProduct.id }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || 'Echec suppression');
      setProducts((prev) => prev.filter((p) => p.id !== modalProduct.id));
      toast.success('Produit supprimé', { id: 'delete-product' });
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error('Impossible de supprimer le produit', { id: 'delete-product' });
    }
  };

  if (loading || shopLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 h-8 bg-gray-200 rounded w-1/4"></h1>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg h-80"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-semibold text-gray-900">Catalogue de produits</h1>
        <div className="flex space-x-3">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFileChange} />
          <button
            type="button"
            onClick={triggerImport}
            className="inline-flex items-center px-5 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
            Importer
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-5 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
            Exporter
          </button>
          <Link
            href="/dashboard/catalogue/new"
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Ajouter un produit
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="w-full sm:w-64">
          <label htmlFor="search" className="sr-only">
            Rechercher
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Rechercher un produit"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full sm:w-64">
          <label htmlFor="category" className="sr-only">
            Catégorie
          </label>
          <select
            id="category"
            name="category"
            className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter un nouveau produit à votre catalogue.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/catalogue/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Ajouter un produit
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, idx) => (
            <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg transition-transform hover:-translate-y-0.5 hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-700"
                 style={{ animationDelay: `${100 + (idx % 6) * 100}ms` }}>
              <div className="h-48 w-full overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={sanitizeImageUrl(product.images[0])}
                    alt={`Image du produit ${product.name}`}
                    width={600}
                    height={300}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xl font-semibold text-gray-900">{(() => { const n = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)); return Number.isFinite(n) ? n.toFixed(2) : '0.00'; })()} FCFA</p>
                  <p
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {product.stock > 10
                      ? `En stock (${product.stock})`
                      : product.stock > 0
                      ? `Stock limité (${product.stock})`
                      : 'Rupture de stock'}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.category?.name && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category.name}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => openView(product)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-in fade-in">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-lg shadow-lg animate-in slide-in-from-bottom-2">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{isEditing ? 'Modifier le produit' : 'Détails du produit'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">Fermer</button>
            </div>
            {!isEditing ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {modalProduct.images?.[0] ? (
                    <img src={sanitizeImageUrl(modalProduct.images[0])} alt={modalProduct.name} width={80} height={80} loading="lazy" className="rounded object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded bg-gray-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{modalProduct.name}</div>
                    <div className="text-sm text-gray-600">{modalProduct.category?.name || 'Sans catégorie'}</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Prix</span>
                  <span className="font-semibold">{(() => { const n = typeof modalProduct.price === 'number' ? modalProduct.price : parseFloat(String(modalProduct.price)); return Number.isFinite(n) ? n.toFixed(2) : '0.00'; })()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Stock</span>
                  <span className="font-semibold">{modalProduct.stock}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setIsEditing(true)} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Modifier</button>
                  <button onClick={deleteProduct} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-md shadow-sm text-red-700 bg-red-50 hover:bg-red-100">Supprimer</button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prix</label>
                    <input type="number" step="0.01" defaultValue={modalProduct.price} onChange={(e) => setModalProduct((p) => p ? { ...p, price: parseFloat(e.target.value) } : p)} className="mt-1 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input type="number" defaultValue={modalProduct.stock} onChange={(e) => setModalProduct((p) => p ? { ...p, stock: parseInt(e.target.value) } : p)} className="mt-1 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                    <select defaultValue={modalProduct.category?.id || ''} onChange={(e) => setModalProduct((p) => p ? { ...p, category: { id: e.target.value, name: categories.find((c) => c.id === e.target.value)?.name || '' } } : p)} className="mt-1 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Sans catégorie</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => saveEdit({ price: modalProduct.price, stock: modalProduct.stock, categoryId: modalProduct.category?.id })} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Enregistrer</button>
                  <button onClick={closeModal} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Annuler</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const sanitizeImageUrl = (url?: string): string => {
  if (!url) return '/file.svg';
  const cleaned = String(url).trim().replace(/^['"()\[\]]+|['"()\[\]]+$/g, '');
  if (!cleaned) return '/file.svg';
  try {
    const u = new URL(cleaned);
    return u.protocol.startsWith('http') ? cleaned : '/file.svg';
  } catch {
    return '/file.svg';
  }
};