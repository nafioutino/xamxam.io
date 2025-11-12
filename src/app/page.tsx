import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageSquare, ShoppingBag, Package, BarChart3, Sparkles, Sliders } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="relative w-10 h-10 mr-2 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <span className="text-lg font-bold text-white">X</span>
              </div>
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">XAMXAM</span>
        </div>
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Fonctionnalités</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Comment ça marche</a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Tarifs</a>
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Se connecter</Link>
          <Link href="/auth/register" className="relative group bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition shadow-lg">
            Essayer gratuitement
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" aria-hidden="true" />
          </Link>
        </div>
        <div className="md:hidden">
          <button className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" aria-label="Ouvrir le menu">
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
              XAMXAM transforme votre façon de vendre en ligne en intégrant messagerie, catalogue et IA dans une seule plateforme puissante.  
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/register" className="relative group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition flex items-center justify-center shadow-lg">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" aria-hidden="true" />
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
                  alt="XAMXAM Dashboard Preview" 
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
                <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Messagerie unifiée</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gérez toutes vos conversations (WhatsApp, Facebook, Instagram, Telegram, TikTok, Email) depuis une seule interface.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Package className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Gestion de catalogue</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Créez et gérez facilement votre catalogue de produits avec import/export CSV et synchronisation multi-plateforme.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Assistant IA</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatisez les réponses aux questions fréquentes et générez du contenu marketing avec notre assistant IA intégré.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Suivi des commandes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Suivez toutes vos commandes en temps réel et gérez efficacement votre processus de vente de bout en bout.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Analyses et statistiques</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Obtenez des insights précieux sur vos performances commerciales avec des tableaux de bord intuitifs.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition hover:shadow-md">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Sliders className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
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
              Commencez à utiliser XAMXAM en quelques étapes simples et transformez votre commerce en ligne.
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
            Rejoignez des milliers d&apos;entrepreneurs qui utilisent XAMXAM pour développer leur activité.
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
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">XAMXAM</span>
              <p className="text-gray-600 dark:text-gray-400 mt-2">La plateforme tout-en-un pour votre commerce en ligne</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                <span className="sr-only">Facebook</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                <span className="sr-only">Instagram</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                <span className="sr-only">Twitter</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">© 2025 XAMXAM. Tous droits réservés.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy-policy" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
                </svg>
                Confidentialité
              </a>
              <a href="/terms-of-service" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><line x1="9" y1="9" x2="10" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
                </svg>
                Conditions d&apos;utilisation
              </a>
              <a href="/contact" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
