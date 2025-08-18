'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PlusIcon, MagnifyingGlassIcon, ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipping' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: string;
  trackingNumber?: string;
  conversationId?: string;
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payé',
  processing: 'En préparation',
  shipping: 'En livraison',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'Sophie Martin',
    customerPhone: '+33612345678',
    customerEmail: 'sophie.martin@example.com',
    items: [
      {
        id: 'ITEM-001',
        productId: 'PROD-001',
        productName: 'T-shirt Premium',
        quantity: 2,
        price: 29.99,
        total: 59.98,
      },
      {
        id: 'ITEM-002',
        productId: 'PROD-002',
        productName: 'Jean Slim',
        quantity: 1,
        price: 49.99,
        total: 49.99,
      },
    ],
    total: 109.97,
    status: 'delivered',
    paymentMethod: 'Carte bancaire',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-17T14:20:00Z',
    shippingAddress: '123 Rue de Paris, 75001 Paris',
    trackingNumber: 'TRK-12345',
    conversationId: 'CONV-001',
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-002',
    customerName: 'Thomas Dubois',
    customerPhone: '+33623456789',
    items: [
      {
        id: 'ITEM-003',
        productId: 'PROD-003',
        productName: 'Sneakers Urban',
        quantity: 1,
        price: 89.99,
        total: 89.99,
      },
    ],
    total: 89.99,
    status: 'shipping',
    paymentMethod: 'PayPal',
    createdAt: '2023-06-16T15:45:00Z',
    updatedAt: '2023-06-16T16:00:00Z',
    shippingAddress: '456 Avenue Victor Hugo, 69002 Lyon',
    trackingNumber: 'TRK-67890',
  },
  {
    id: 'ORD-003',
    customerId: 'CUST-003',
    customerName: 'Marie Leroy',
    customerPhone: '+33634567890',
    customerEmail: 'marie.leroy@example.com',
    items: [
      {
        id: 'ITEM-004',
        productId: 'PROD-004',
        productName: 'Robe d\'été',
        quantity: 1,
        price: 39.99,
        total: 39.99,
      },
      {
        id: 'ITEM-005',
        productId: 'PROD-005',
        productName: 'Sandales',
        quantity: 1,
        price: 29.99,
        total: 29.99,
      },
      {
        id: 'ITEM-006',
        productId: 'PROD-006',
        productName: 'Chapeau de paille',
        quantity: 1,
        price: 19.99,
        total: 19.99,
      },
    ],
    total: 89.97,
    status: 'processing',
    paymentMethod: 'Carte bancaire',
    createdAt: '2023-06-17T09:15:00Z',
    updatedAt: '2023-06-17T10:00:00Z',
    shippingAddress: '789 Boulevard de la Mer, 06000 Nice',
    conversationId: 'CONV-002',
  },
  {
    id: 'ORD-004',
    customerId: 'CUST-004',
    customerName: 'Pierre Moreau',
    customerPhone: '+33645678901',
    items: [
      {
        id: 'ITEM-007',
        productId: 'PROD-007',
        productName: 'Chemise Business',
        quantity: 3,
        price: 45.99,
        total: 137.97,
      },
    ],
    total: 137.97,
    status: 'paid',
    paymentMethod: 'Virement bancaire',
    createdAt: '2023-06-17T11:30:00Z',
    updatedAt: '2023-06-17T12:00:00Z',
    shippingAddress: '101 Rue du Commerce, 33000 Bordeaux',
  },
  {
    id: 'ORD-005',
    customerId: 'CUST-005',
    customerName: 'Julie Petit',
    customerPhone: '+33656789012',
    customerEmail: 'julie.petit@example.com',
    items: [
      {
        id: 'ITEM-008',
        productId: 'PROD-008',
        productName: 'Sac à main',
        quantity: 1,
        price: 79.99,
        total: 79.99,
      },
    ],
    total: 79.99,
    status: 'pending',
    paymentMethod: 'En attente',
    createdAt: '2023-06-17T14:00:00Z',
    updatedAt: '2023-06-17T14:00:00Z',
    conversationId: 'CONV-003',
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    );
    toast.success(`Statut de la commande ${orderId} mis à jour : ${statusLabels[newStatus]}`);
  };

  const handleCreateOrder = () => {
    // In a real app, this would create a new order in the database
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerId: `CUST-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerName: 'Nouveau Client',
      customerPhone: '+33600000000',
      items: [
        {
          id: `ITEM-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          productId: 'PROD-001',
          productName: 'Produit exemple',
          quantity: 1,
          price: 29.99,
          total: 29.99,
        },
      ],
      total: 29.99,
      status: 'pending',
      paymentMethod: 'En attente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders([newOrder, ...orders]);
    setIsCreateModalOpen(false);
    toast.success(`Nouvelle commande créée : ${newOrder.id}`);
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-900">Suivi des commandes</h1>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Nouvelle commande
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Rechercher
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 text-base py-3 border-gray-300 rounded-md"
                  placeholder="Rechercher par ID, nom ou téléphone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-64">
              <label htmlFor="status-filter" className="sr-only">
                Filtrer par statut
              </label>
              <select
                id="status-filter"
                name="status-filter"
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center px-5 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Paiement
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.customerName}</span>
                        <span>{order.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.total.toFixed(2)} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[order.status]} border-0 bg-transparent`}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      <Transition.Root show={isCreateModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setIsCreateModalOpen}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Créer une nouvelle commande
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Cette fonctionnalité permet de créer une commande manuellement. Dans le MVP, nous
                        utilisons des données simulées.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                    onClick={handleCreateOrder}
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Order Details Modal */}
      <Transition.Root show={isDetailsModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setIsDetailsModalOpen}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
                {selectedOrder && (
                  <div>
                    <div className="flex justify-between items-start">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Détails de la commande {selectedOrder.id}
                      </Dialog.Title>
                      <div className="ml-3 flex-shrink-0 flex">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}
                        >
                          {statusLabels[selectedOrder.status]}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900">Informations client</h4>
                      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Nom</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedOrder.customerName}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedOrder.customerPhone}</dd>
                        </div>
                        {selectedOrder.customerEmail && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedOrder.customerEmail}</dd>
                          </div>
                        )}
                        {selectedOrder.shippingAddress && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Adresse de livraison</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedOrder.shippingAddress}</dd>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900">Articles</h4>
                      <div className="mt-2 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                              <thead>
                                <tr>
                                  <th
                                    scope="col"
                                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                  >
                                    Produit
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                  >
                                    Quantité
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                  >
                                    Prix unitaire
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                  >
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {selectedOrder.items.map((item) => (
                                  <tr key={item.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                      {item.productName}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {item.quantity}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {item.price.toFixed(2)} FCFA
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {item.total.toFixed(2)} FCFA
                                    </td>
                                  </tr>
                                ))}
                                <tr>
                                  <td colSpan={3} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 text-right sm:pl-0">
                                    Total
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">
                                    {selectedOrder.total.toFixed(2)} FCFA
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900">Informations de paiement</h4>
                      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Méthode de paiement</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedOrder.paymentMethod}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Date de commande</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}
                          </dd>
                        </div>
                        {selectedOrder.trackingNumber && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Numéro de suivi</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedOrder.trackingNumber}</dd>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedOrder.conversationId && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900">Conversation associée</h4>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsDetailsModalOpen(false);
                              // In a real app, this would navigate to the conversation
                              toast.success('Navigation vers la conversation (simulation)');
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Voir la conversation
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={() => setIsDetailsModalOpen(false)}
                      >
                        Fermer
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={() => {
                          // In a real app, this would print or export the order
                          toast.success(`Commande ${selectedOrder.id} exportée`);
                        }}
                      >
                        Exporter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}