import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, BookOpen, Database, Lock, AlertCircle, Home, FileText, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de confidentialité - XAMXAM',
  description: 'Politique de confidentialité de XAMXAM - Comment nous collectons, utilisons et protégeons vos données personnelles.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                XAMXAM
              </h1>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Accueil
              </Link>
              <a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-100 text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Transparence et protection des données
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Politique de confidentialité
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Nous nous engageons à protéger votre vie privée et à traiter vos données personnelles avec le plus grand soin.
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* Barre de progression */}
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="p-8 md:p-12">
          
              {/* Table des matières */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-12">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Table des matières
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  <a href="#introduction" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Introduction
                  </a>
                  <a href="#collecte" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Collecte d'informations
                  </a>
                  <a href="#utilisation" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Utilisation des données
                  </a>
                  <a href="#partage" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Partage des données
                  </a>
                  <a href="#securite" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Sécurité des données
                  </a>
                  <a href="#droits" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Vos droits
                  </a>
                </div>
              </div>

              <div className="space-y-12">
                <p className="text-gray-600 mb-6">
                  <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
                </p>

                <section id="introduction" className="scroll-mt-24">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Introduction
                    </h2>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      XAMXAM ("nous", "notre", "nos") s'engage à protéger et respecter votre vie privée. 
                      Cette politique de confidentialité explique comment nous collectons, utilisons, 
                      stockons et protégeons vos informations personnelles lorsque vous utilisez notre 
                      plateforme de gestion de conversations clients.
                    </p>
                  </div>
                </section>

                <section id="collecte" className="scroll-mt-24">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Collecte d'informations
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Informations fournies
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">Informations de compte (nom, e-mail, mot de passe)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">Informations de profil d'entreprise</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">Configuration des canaux de communication</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">Messages et conversations avec vos clients</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Collecte automatique
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">Données d'utilisation et de navigation</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">Adresses IP et informations de l'appareil</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">Cookies et technologies similaires</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">Logs d'activité de l'application</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="utilisation" className="scroll-mt-24">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Comment nous utilisons vos informations
                    </h2>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Services principaux</h4>
                            <p className="text-gray-600">Fournir et maintenir nos services de gestion de conversations</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Support client</h4>
                            <p className="text-gray-600">Traiter et gérer vos conversations clients</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Amélioration</h4>
                            <p className="text-gray-600">Améliorer notre plateforme et développer de nouvelles fonctionnalités</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Sécurité</h4>
                            <p className="text-gray-600">Assurer la sécurité et prévenir la fraude</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15V9h4v6H8z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Conformité légale</h4>
                            <p className="text-gray-600">Respecter nos obligations légales</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Communications</h4>
                            <p className="text-gray-600">Vous contacter concernant votre compte ou nos services</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Partage de vos informations
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. 
                Nous pouvons partager vos informations uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Avec votre consentement explicite</li>
                <li>Avec nos prestataires de services de confiance (hébergement, analytics)</li>
                <li>Pour respecter une obligation légale</li>
                <li>Pour protéger nos droits et notre sécurité</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Intégrations tierces
              </h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                5.1 Facebook/Meta
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Notre plateforme s'intègre avec Facebook/Meta pour gérer vos pages et conversations. 
                Nous collectons et traitons les données suivantes via l'API Facebook :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Informations de vos pages Facebook</li>
                <li>Messages reçus sur vos pages</li>
                <li>Informations publiques des utilisateurs qui vous contactent</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Ces données sont traitées conformément aux politiques de Facebook et à cette politique de confidentialité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Sécurité des données
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
                appropriées pour protéger vos informations personnelles contre l'accès non autorisé, 
                la modification, la divulgation ou la destruction. Cela inclut le chiffrement des 
                données sensibles, l'authentification sécurisée et des audits de sécurité réguliers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Vos droits
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement ("droit à l'oubli")</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Conservation des données
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous conservons vos informations personnelles aussi longtemps que nécessaire pour 
                fournir nos services et respecter nos obligations légales. Les données de conversation 
                sont conservées selon vos paramètres de compte et les exigences légales applicables.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                9. Modifications de cette politique
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
                Nous vous informerons de tout changement important par email ou via notre plateforme.
              </p>
            </section>

                <section id="contact" className="scroll-mt-24">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold">10</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Contact
                    </h2>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
                    <p className="text-gray-700 text-lg mb-6">
                      Pour toute question concernant cette politique de confidentialité ou vos données personnelles, 
                      vous pouvez nous contacter à :
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-gray-800">Email</h4>
                        </div>
                        <p className="text-gray-600">privacy@xamxam.io</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-gray-800">Adresse</h4>
                        </div>
                        <p className="text-gray-600">123 Rue de la Tech<br />75001 Paris, France</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-gray-800">Téléphone</h4>
                        </div>
                        <p className="text-gray-600">+33 1 23 45 67 89</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                XAMXAM
              </h3>
              <p className="text-gray-400 mb-6">
                Plateforme de gestion de conversations multi-canaux
              </p>
              <div className="flex justify-center space-x-6 mb-6">
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Conditions d'utilisation
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Link>
              </div>
              <div className="border-t border-gray-800 pt-6">
                <p className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} XAMXAM. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }