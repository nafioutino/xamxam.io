import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Home, FileText, Mail, Shield, BookOpen, AlertCircle, FileCode, Users, Lock, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation - XAMXAM',
  description: 'Conditions d\'utilisation de XAMXAM - Règles et conditions pour l\'utilisation de notre plateforme.',
};

export default function TermsOfServicePage() {
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
              <a href="/privacy-policy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Confidentialité
              </a>
              <a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-100 text-sm font-medium mb-6">
            <Check className="w-4 h-4 mr-2" />
            Conditions légales et d'utilisation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Conditions d'utilisation
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Les règles et conditions qui régissent l'utilisation de notre plateforme XAMXAM.
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
                  <a href="#acceptation" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Acceptation des conditions
                  </a>
                  <a href="#utilisation" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Description du service
                  </a>
                  <a href="#services" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Compte utilisateur
                  </a>
                  <a href="#introduction" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Utilisation acceptable
                  </a>
                  <a href="#compte" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Propriété intellectuelle
                  </a>
                  <a href="#responsabilite" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Limitation de responsabilité
                  </a>
                </div>
              </div>

              <div className="space-y-12">
                <p className="text-gray-600 mb-6">
                  <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
                </p>

                <section id="acceptation" className="scroll-mt-24">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Acceptation des conditions
                    </h2>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      En accédant et en utilisant XAMXAM ("le Service"), vous acceptez d'être lié par 
                      ces conditions d'utilisation ("les Conditions"). Si vous n'acceptez pas ces 
                      conditions, veuillez ne pas utiliser notre service.
                    </p>
                  </div>
                </section>

                <section id="description" className="scroll-mt-24">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Description du service
                    </h2>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Plateforme de gestion multi-canaux</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          XAMXAM est une plateforme de gestion de conversations clients qui permet aux 
                          entreprises de centraliser et gérer leurs communications avec leurs clients 
                          via différents canaux, notamment les pages Facebook (Messenger).
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                3. Inscription et compte
              </h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                3.1 Éligibilité
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vous devez avoir au moins 18 ans et avoir la capacité légale de conclure 
                des contrats pour utiliser notre service.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                3.2 Informations de compte
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Vous devez fournir des informations exactes et complètes</li>
                <li>Vous êtes responsable de maintenir la confidentialité de votre compte</li>
                <li>Vous devez nous notifier immédiatement de tout usage non autorisé</li>
                <li>Vous êtes responsable de toutes les activités sous votre compte</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                4. Utilisation acceptable
              </h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.1 Utilisations autorisées
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vous pouvez utiliser notre service uniquement à des fins commerciales légitimes 
                et conformément à ces conditions.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.2 Utilisations interdites
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vous vous engagez à ne pas :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Violer des lois ou réglementations applicables</li>
                <li>Envoyer du spam ou du contenu non sollicité</li>
                <li>Harceler, menacer ou intimider d'autres utilisateurs</li>
                <li>Utiliser le service pour des activités frauduleuses</li>
                <li>Tenter d'accéder de manière non autorisée à nos systèmes</li>
                <li>Interférer avec le fonctionnement du service</li>
                <li>Violer les droits de propriété intellectuelle</li>
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
                L'utilisation de l'intégration Facebook est soumise aux conditions d'utilisation 
                de Facebook. Vous devez respecter les politiques de Facebook lors de l'utilisation 
                de cette intégration.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                5.2 Responsabilité
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Vous êtes responsable de votre utilisation des services tiers et devez vous 
                conformer à leurs conditions d'utilisation respectives.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Propriété intellectuelle
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Le service et tout son contenu, fonctionnalités et fonctionnalités sont et 
                resteront la propriété exclusive de XAMXAM et de ses concédants de licence.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Vous conservez tous les droits sur le contenu que vous soumettez via notre service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Confidentialité et données
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Votre vie privée est importante pour nous. Veuillez consulter notre 
                <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
                  Politique de confidentialité
                </a> pour comprendre comment nous collectons, utilisons et protégeons vos informations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Tarification et paiement
              </h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                8.1 Frais
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                L'utilisation de certaines fonctionnalités peut être soumise à des frais. 
                Tous les frais sont indiqués clairement avant l'achat.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                8.2 Facturation
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Les frais sont facturés à l'avance sur une base mensuelle ou annuelle selon 
                votre plan d'abonnement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                9. Résiliation
              </h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                9.1 Résiliation par vous
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vous pouvez résilier votre compte à tout moment en nous contactant.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                9.2 Résiliation par nous
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Nous pouvons suspendre ou résilier votre compte en cas de violation de ces conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                10. Limitation de responsabilité
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Dans la mesure permise par la loi, XAMXAM ne sera pas responsable des dommages 
                indirects, accessoires, spéciaux, consécutifs ou punitifs résultant de votre 
                utilisation du service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                11. Modifications des conditions
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications importantes vous seront notifiées par email ou via notre plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                12. Droit applicable
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Ces conditions sont régies par le droit français. Tout litige sera soumis 
                à la juridiction exclusive des tribunaux français.
              </p>
            </section>

                <section id="contact" className="scroll-mt-24">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold">13</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Contact
                    </h2>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
                    <p className="text-gray-700 text-lg mb-6">
                      Pour toute question concernant ces conditions d'utilisation, 
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
                        <p className="text-gray-600">legal@xamxam.io</p>
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
                          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
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
                <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Politique de confidentialité
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center">
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