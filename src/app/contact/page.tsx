import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - Zoba',
  description: 'Contactez l\'équipe Zoba pour toute question ou support technique.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ZOBA
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Contact</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/privacy-policy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Politique de confidentialité
              </a>
              <a href="/terms-of-service" className="text-gray-600 hover:text-blue-600 transition-colors">
                Conditions d'utilisation
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Nous sommes là pour vous aider. N'hésitez pas à nous contacter pour toute question ou assistance.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Informations de contact */}
                <div>
                  <div className="flex items-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Informations de contact
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                          <p className="text-blue-600 font-medium">support@zoba.com</p>
                          <p className="text-blue-600 font-medium">contact@zoba.com</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Réponse sous 24h en moyenne
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Téléphone</h3>
                          <p className="text-blue-600 font-medium">+33 1 23 45 67 89</p>
                          <p className="text-sm text-gray-500">Lundi - Vendredi, 9h - 18h (CET)</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Support technique disponible
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Adresse</h3>
                          <p className="text-green-600 font-medium">
                            123 Rue de la Technologie<br/>
                            75001 Paris, France
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Rendez-vous sur demande
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Heures d'ouverture</h3>
                          <p className="text-orange-600 font-medium">
                            Lundi - Vendredi : 9h00 - 18h00<br/>
                            Samedi - Dimanche : Fermé
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Fermé les dimanches et jours fériés
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Support technique</h3>
                    <p className="text-gray-600 mb-4">
                      Pour un support technique rapide, veuillez inclure :
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Description détaillée du problème</li>
                      <li>Étapes pour reproduire le problème</li>
                      <li>Captures d'écran si applicable</li>
                      <li>Informations sur votre navigateur et système</li>
                    </ul>
                  </div>
                </div>

                {/* Formulaire de contact */}
                <div>
                  <div className="flex items-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Envoyez-nous un message
                    </h2>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Votre nom complet"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-3">
                          Entreprise
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Nom de votre entreprise"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-3">
                          Sujet *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="">Sélectionnez un sujet</option>
                          <option value="support">🔧 Support technique</option>
                          <option value="sales">💼 Questions commerciales</option>
                          <option value="billing">💳 Facturation</option>
                          <option value="feature">🎯 Demande de fonctionnalité</option>
                          <option value="bug">🐛 Signaler un bug</option>
                          <option value="partnership">🤝 Partenariat</option>
                          <option value="other">❓ Autre</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          required
                          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                          placeholder="Décrivez votre demande en détail... Plus vous nous donnerez d'informations, mieux nous pourrons vous aider !"
                        ></textarea>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="privacy"
                          name="privacy"
                          required
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
                          J'accepte la <a href="/privacy-policy" className="text-blue-600 hover:underline">politique de confidentialité</a> *
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          Envoyer le message
                        </span>
                      </button>
                      
                      <p className="text-center text-sm text-gray-500">
                        Nous vous répondrons dans les plus brefs délais, généralement sous 24h.
                      </p>
                    </form>
                  </div>
                </div>
              </div>

              {/* Section FAQ */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center mb-12">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Questions Fréquemment Posées
                  </h2>
                </div>
                
                <div className="grid gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">?</span>
                      </span>
                      Comment puis-je commencer à utiliser ZOBA ?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Vous pouvez créer un compte gratuitement et commencer à connecter vos canaux de communication. 
                      Notre équipe vous accompagnera dans la configuration initiale avec un onboarding personnalisé.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">?</span>
                      </span>
                      Quels canaux de communication sont supportés ?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      ZOBA supporte Facebook Messenger, WhatsApp Business, Instagram Direct, 
                      et d'autres plateformes populaires. Nous ajoutons régulièrement de nouveaux canaux selon les besoins de nos clients.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">?</span>
                      </span>
                      Y a-t-il une période d'essai gratuite ?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, nous offrons une période d'essai de 14 jours sans engagement. 
                      Vous pouvez tester toutes les fonctionnalités avant de vous abonner, avec un support complet inclus.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">?</span>
                      </span>
                      Comment contacter le support technique ?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Vous pouvez nous contacter via le formulaire ci-dessus, par email à support@zoba.com, 
                      ou par téléphone pendant nos heures d'ouverture. Notre équipe répond généralement sous 2h.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              ZOBA
            </h3>
            <p className="text-gray-400 mb-6">
              Plateforme de gestion de conversations multi-canaux
            </p>
            <div className="flex justify-center space-x-6 mb-6">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">
                Accueil
              </a>
              <a href="/privacy-policy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Politique de confidentialité
              </a>
              <a href="/terms-of-service" className="text-gray-400 hover:text-blue-400 transition-colors">
                Conditions d'utilisation
              </a>
            </div>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} ZOBA. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}