'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { PlusIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  categories: string[];
}

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Simulate fetching products
  useEffect(() => {
    // In a real app, fetch from API
    const timer = setTimeout(() => {
      const demoProducts: Product[] = [
        {
          id: 'prod-1',
          name: 'T-shirt Premium',
          price: 25.99,
          stock: 45,
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center'],
          categories: ['Vêtements', 'Homme'],
        },
        {
          id: 'prod-2',
          name: 'Robe d\'été',
          price: 39.99,
          stock: 20,
          images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop&crop=center'],
          categories: ['Vêtements', 'Femme'],
        },
        {
          id: 'prod-3',
          name: 'Baskets Sport',
          price: 79.99,
          stock: 15,
          images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center'],
          categories: ['Chaussures', 'Sport'],
        },
        {
          id: 'prod-4',
          name: 'Sac à main cuir',
          price: 129.99,
          stock: 8,
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&crop=center'],
          categories: ['Accessoires', 'Femme'],
        },
        {
          id: 'prod-5',
          name: 'Montre connectée',
          price: 199.99,
          stock: 12,
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&crop=center'],
          categories: ['Électronique', 'Accessoires'],
        },
        {
          id: 'prod-6',
          name: 'Pantalon chino',
          price: 49.99,
          stock: 30,
          images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop&crop=center'],
          categories: ['Vêtements', 'Homme'],
        },
      ];
      setProducts(demoProducts);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Get all unique categories
  const allCategories = [
    'all',
    ...Array.from(new Set(products.flatMap((product) => product.categories))),
  ];

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleImportCSV = () => {
    // In a real app, implement CSV import functionality
    toast.success('Fonctionnalité d\'import CSV à implémenter');
  };

  const handleExportCSV = () => {
    // In a real app, implement CSV export functionality
    toast.success('Fonctionnalité d\'export CSV à implémenter');
  };

  if (loading) {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-semibold text-gray-900">Catalogue de produits</h1>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleImportCSV}
            className="inline-flex items-center px-5 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
            Importer
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-5 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
            Exporter
          </button>
          <Link
            href="/dashboard/catalogue/new"
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
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
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
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
            {allCategories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'Toutes les catégories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter un nouveau produit à votre catalogue.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/catalogue/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Ajouter un produit
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xl font-semibold text-gray-900">{product.price.toFixed(2)} FCFA</p>
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
                  {product.categories.map((category) => (
                    <span
                      key={`${product.id}-${category}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex space-x-2">
                  <Link
                    href={`/dashboard/catalogue/${product.id}`}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Voir
                  </Link>
                  <Link
                    href={`/dashboard/catalogue/${product.id}/edit`}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}