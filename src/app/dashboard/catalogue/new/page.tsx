'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { XMarkIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';

const productSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  description: z.string().min(10, { message: 'La description doit contenir au moins 10 caractères' }),
  price: z.coerce
    .number()
    .min(0.01, { message: 'Le prix doit être supérieur à 0' }),
  stock: z.coerce
    .number()
    .int({ message: 'Le stock doit être un nombre entier' })
    .min(0, { message: 'Le stock ne peut pas être négatif' }),
  categories: z.string().array().min(1, { message: 'Sélectionnez au moins une catégorie' }),
});

type ProductFormValues = z.infer<typeof productSchema>;

const AVAILABLE_CATEGORIES = [
  'Vêtements',
  'Chaussures',
  'Accessoires',
  'Électronique',
  'Maison',
  'Beauté',
  'Sport',
  'Homme',
  'Femme',
  'Enfant',
];

export default function NewProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categories: [],
    },
  });

  const handleImageUpload = () => {
    setUploading(true);
    // Simulate image upload
    setTimeout(() => {
      const newImage = `https://placehold.co/300x300?text=Product+${images.length + 1}`;
      setImages([...images, newImage]);
      setUploading(false);
      toast.success('Image téléchargée avec succès');
    }, 1500);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      // Include images in the data
      const productData = {
        ...data,
        images,
        categories: selectedCategories,
      };

      // In a real app, send to API
      console.log('Product data:', productData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Produit ajouté avec succès');
      router.push('/dashboard/catalogue');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Erreur lors de l\'ajout du produit');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Ajouter un nouveau produit</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Retour
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Product Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images du produit
              </label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="h-32 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className="h-32 w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {uploading ? (
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="rounded-full bg-gray-200 h-10 w-10 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ) : (
                    <>
                      <PhotoIcon className="h-10 w-10 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-700">
                        Ajouter une image
                      </span>
                    </>
                  )}
                </button>
              </div>
              {images.length === 0 && (
                <p className="text-sm text-gray-500">
                  Ajoutez au moins une image pour votre produit.
                </p>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom du produit *
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Product Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Prix (FCFA) *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    {...register('price')}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Stock *
                </label>
                <input
                  type="number"
                  id="stock"
                  min="0"
                  step="1"
                  {...register('stock')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories *
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${selectedCategories.includes(category) ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'} border`}
                  >
                    {category}
                    {selectedCategories.includes(category) ? (
                      <XMarkIcon className="ml-1.5 h-4 w-4" />
                    ) : (
                      <PlusIcon className="ml-1.5 h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
              {errors.categories && (
                <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
              )}
              {selectedCategories.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  Sélectionnez au moins une catégorie pour votre produit.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedCategories.length === 0 || images.length === 0}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}