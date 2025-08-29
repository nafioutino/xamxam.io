import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ChatBubbleLeftRightIcon, ShoppingBagIcon, CubeIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ZOBA</span>
        </div>
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Fonctionnalités</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Comment ça marche</a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Tarifs</a>
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Se connecter</Link>
          <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition">
            Essayer gratuitement
          </Link>
        </div>
        <div className="md:hidden">
          <button className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block">Gérez votre commerce</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">avec l&apos;IA à vos côtés</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              ZOBA transforme votre façon de vendre en ligne en intégrant messagerie, catalogue et IA dans une seule plateforme puissante.  
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition flex items-center justify-center">
                Commencer maintenant
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/auth/login" className="border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-3 rounded-md text-lg font-medium transition flex items-center justify-center">
                Se connecter
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25"></div>
              <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                <Image 
                  src="/dashboard-preview.svg" 
                  alt="ZOBA Dashboard Preview" 
                  width={600} 
                  height={400}
                  className="rounded-md"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tout ce dont vous avez besoin pour réussir</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Une plateforme complète qui réunit tous les outils essentiels pour développer votre commerce en ligne.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Messagerie unifiée</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gérez toutes vos conversations (WhatsApp, Facebook, Instagram, Telegram, TikTok, Email) depuis une seule interface.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <CubeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Gestion de catalogue</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Créez et gérez facilement votre catalogue de produits avec import/export CSV et synchronisation multi-plateforme.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Assistant IA</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatisez les réponses aux questions fréquentes et générez du contenu marketing avec notre assistant IA intégré.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <ShoppingBagIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Suivi des commandes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Suivez toutes vos commandes en temps réel et gérez efficacement votre processus de vente de bout en bout.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <ChartBarIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Analyses et statistiques</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Obtenez des insights précieux sur vos performances commerciales avec des tableaux de bord intuitifs.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Personnalisation complète</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Adaptez la plateforme à vos besoins spécifiques avec des options de personnalisation étendues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 dark:bg-gray-800 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Commencez à utiliser ZOBA en quelques étapes simples et transformez votre commerce en ligne.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 dark:bg-blue-900"></div>
              
              {/* Step 1 */}
              <div className="relative z-10 mb-12">
                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8 md:pr-12">
                    <h3 className="text-xl font-bold mb-2">Créez votre compte</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Inscrivez-vous gratuitement et configurez votre profil d&apos;entreprise en quelques minutes.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    1
                  </div>
                  <div className="flex-1 pl-8 md:pl-12"></div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative z-10 mb-12">
                <div className="flex items-center">
                  <div className="flex-1 pr-8 md:pr-12"></div>
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    2
                  </div>
                  <div className="flex-1 text-left pl-8 md:pl-12">
                    <h3 className="text-xl font-bold mb-2">Importez vos produits</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ajoutez vos produits manuellement ou importez-les en masse via CSV pour créer votre catalogue.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative z-10 mb-12">
                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8 md:pr-12">
                    <h3 className="text-xl font-bold mb-2">Connectez vos canaux de vente</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Intégrez vos comptes WhatsApp, Facebook, Instagram et autres plateformes de messagerie.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    3
                  </div>
                  <div className="flex-1 pl-8 md:pl-12"></div>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="relative z-10">
                <div className="flex items-center">
                  <div className="flex-1 pr-8 md:pr-12"></div>
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    4
                  </div>
                  <div className="flex-1 text-left pl-8 md:pl-12">
                    <h3 className="text-xl font-bold mb-2">Commencez à vendre</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Gérez vos conversations, suivez vos commandes et développez votre activité avec l&apos;aide de notre IA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white dark:bg-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tarifs simples et transparents</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choisissez le forfait qui correspond le mieux aux besoins de votre entreprise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden transition hover:shadow-lg">
              <div className="p-8">
                <h3 className="text-xl font-bold mb-4">Débutant</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-extrabold">15 000</span>
                  <span className="text-xl font-medium ml-1">FCFA</span>
                  <span className="text-gray-500 ml-2">/mois</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Parfait pour les petites entreprises qui débutent dans la vente en ligne.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Jusqu&apos;à 100 produits</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>2 canaux de messagerie</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Assistant IA basique</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Support par email</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-md transition">
                  Commencer l&apos;essai gratuit
                </Link>
              </div>
            </div>
            
            {/* Professional Plan */}
            <div className="bg-blue-600 rounded-xl overflow-hidden transition hover:shadow-lg transform scale-105">
              <div className="p-8">
                <h3 className="text-xl font-bold mb-4 text-white">Professionnel</h3>
                <div className="flex items-baseline mb-4 text-white">
                  <span className="text-4xl font-extrabold">35 000</span>
                  <span className="text-xl font-medium ml-1">FCFA</span>
                  <span className="text-blue-200 ml-2">/mois</span>
                </div>
                <p className="text-blue-100 mb-6">
                  Idéal pour les entreprises en croissance avec des besoins de vente plus avancés.
                </p>
                <ul className="space-y-3 mb-8 text-white">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Produits illimités</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>5 canaux de messagerie</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Assistant IA avancé</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Analyses avancées</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block w-full bg-white text-blue-600 hover:bg-blue-50 text-center px-4 py-3 rounded-md transition">
                  Commencer l&apos;essai gratuit
                </Link>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden transition hover:shadow-lg">
              <div className="p-8">
                <h3 className="text-xl font-bold mb-4">Entreprise</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-extrabold">75 000</span>
                  <span className="text-xl font-medium ml-1">FCFA</span>
                  <span className="text-gray-500 ml-2">/mois</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Solution complète pour les grandes entreprises avec des besoins personnalisés.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Produits illimités</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Canaux illimités</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>IA personnalisée</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Support dédié 24/7</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>API & intégrations</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-md transition">
                  Contacter les ventes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à transformer votre commerce en ligne?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Rejoignez des milliers d&apos;entrepreneurs qui utilisent ZOBA pour développer leur activité.
          </p>
          <Link href="/auth/register" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-md text-lg font-medium transition inline-block">
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ZOBA</span>
              <p className="text-gray-600 dark:text-gray-400 mt-2">La plateforme tout-en-un pour votre commerce en ligne</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">© 2025 ZOBA. Tous droits réservés.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy-policy" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition text-sm">Confidentialité</a>
              <a href="/terms-of-service" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition text-sm">Conditions d&apos;utilisation</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
