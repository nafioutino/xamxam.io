'use client'

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ArrowRight, MessageSquare, ShoppingBag, Package, BarChart3, Sparkles, Sliders, Menu, X, Brain, Zap, Clock, Users, TrendingUp, FileText, MessageCircle, Facebook, Instagram, Phone } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faBox, faChartLine, faMagic, faCog, faShoppingCart, faRocket, faUserPlus, faLink, faRobot, faBrain, faClock, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faTiktok, faWhatsapp, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
      {/* Navigation professionnelle */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 group">
                <div className="absolute inset-0 bg-slate-800 rounded-lg opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
                <div className="relative bg-white rounded-lg p-1.5 shadow-sm border border-slate-200">
                  <div className="inline-flex items-center justify-center w-7 h-7 bg-slate-800 rounded-md">
                    <span className="text-base font-bold text-white">X</span>
                  </div>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">XAMXAM</span>
            </div>

            {/* Navigation desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200">
                Comment ça marche
              </a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200">
                Tarifs
              </a>
              <Link href="/auth/login" className="text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200">
                Connexion
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
              >
                Essai gratuit
              </Link>
            </div>

            {/* Bouton menu mobile */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-200">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#features" className="text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200">
                  Fonctionnalités
                </a>
                <a href="#how-it-works" className="text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200">
                  Comment ça marche
                </a>
                <a href="#pricing" className="text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200">
                  Tarifs
                </a>
                <Link href="/auth/login" className="text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200">
                  Connexion
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-md text-center"
                >
                  Essai gratuit
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section professionnelle */}
      <section className="bg-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Contenu textuel */}
              <div className="space-y-8">
                <div className={`space-y-4 ${isVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 animate-pulse-slow">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    Plateforme de commerce conversationnel
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                    Transformez votre commerce avec
                    <span className="text-blue-600"> l'intelligence artificielle</span>
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                    Gérez toutes vos conversations clients, votre catalogue produits et vos commandes depuis une seule plateforme puissante. Boostez vos ventes avec notre assistant IA intégré.
                  </p>
                </div>

                {/* Statistiques */}
                <div className={`grid grid-cols-3 gap-6 py-6 ${isVisible ? 'animate-fadeInUp delay-200' : 'opacity-0'}`}>
                  <div className="text-center group hover:scale-110 transition-transform duration-300">
                    <div className="text-3xl font-bold text-slate-800">+50%</div>
                    <div className="text-sm text-slate-600">de conversion</div>
                  </div>
                  <div className="text-center group hover:scale-110 transition-transform duration-300">
                    <div className="text-3xl font-bold text-slate-800">6</div>
                    <div className="text-sm text-slate-600">canaux intégrés</div>
                  </div>
                  <div className="text-center group hover:scale-110 transition-transform duration-300">
                    <div className="text-3xl font-bold text-slate-800">24/7</div>
                    <div className="text-sm text-slate-600">assistance IA</div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className={`flex flex-col sm:flex-row gap-4 ${isVisible ? 'animate-fadeInUp delay-300' : 'opacity-0'}`}>
                  <Link 
                    href="/auth/register" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Commencer gratuitement</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link 
                    href="/auth/login" 
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl transition-all duration-300 hover:bg-slate-50 hover:shadow-lg"
                  >
                    Voir une démo
                  </Link>
                </div>

                {/* Avis clients avec photos réalistes */}
                <div className={`flex items-center space-x-4 pt-4 ${isVisible ? 'animate-fadeInUp delay-400' : 'opacity-0'}`}>
                  <div className="flex -space-x-2">
                    <Image 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop"
                      alt="Marie Diop - Designer"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover hover:scale-125 transition-transform duration-300 cursor-pointer"
                    />
                    <Image 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
                      alt="Amadou Sow - Développeur"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover hover:scale-125 transition-transform duration-300 cursor-pointer"
                    />
                    <Image 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=256&auto=format&fit=crop"
                      alt="Fatou Ndiaye - Marketing"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover hover:scale-125 transition-transform duration-300 cursor-pointer"
                    />
                    <div className="w-8 h-8 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center hover:scale-125 transition-transform duration-300 cursor-pointer">
                      <span className="text-xs font-semibold text-blue-600">+</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold">+1000</span> entreprises nous font confiance
                  </div>
                </div>
              </div>

              {/* Image hero */}
              <div className={`relative ${isVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-3xl transform rotate-3 animate-float"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="space-y-6">
                    {/* Simulation d'interface */}
                    <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center animate-pulse-slow">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                          </div>
                        <div>
                          <div className="font-semibold text-slate-800">Nouveau message</div>
                          <div className="text-sm text-slate-600">WhatsApp Business</div>
                        </div>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-colors duration-300">
                        <div className="text-sm text-slate-700">"Bonjour, je suis intéressé par..."</div>
                      </div>
                    </div>

                    {/* Carte produit */}
                    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">Produit recommandé</div>
                          <div className="text-sm text-slate-600">Basé sur la conversation</div>
                        </div>
                        <div className="text-emerald-600 font-semibold group-hover:scale-110 transition-transform duration-300">+15% de ventes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section professionnelle */}
      <section id="features" className="bg-slate-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className={`text-center mb-16 ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6 hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faMagic} className="mr-2" />
                Fonctionnalités avancées
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Une plateforme complète pour votre succès
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Découvrez tous les outils professionnels dont vous avez besoin pour développer votre commerce en ligne et offrir une expérience client exceptionnelle.
              </p>
              
              {/* Canaux de communication */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full hover:bg-green-200 hover:scale-110 transition-all duration-300 cursor-pointer group">
                  <FontAwesomeIcon icon={faWhatsapp} className="text-green-600 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-green-800 font-medium">WhatsApp</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full hover:bg-blue-200 hover:scale-110 transition-all duration-300 cursor-pointer group">
                  <FontAwesomeIcon icon={faFacebook} className="text-blue-600 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-blue-800 font-medium">Facebook</span>
                </div>
                <div className="flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full hover:bg-pink-200 hover:scale-110 transition-all duration-300 cursor-pointer group">
                  <FontAwesomeIcon icon={faInstagram} className="text-pink-600 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-pink-800 font-medium">Instagram</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full hover:bg-purple-200 hover:scale-110 transition-all duration-300 cursor-pointer group">
                  <FontAwesomeIcon icon={faTiktok} className="text-purple-600 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-purple-800 font-medium">TikTok</span>
                </div>
              </div>
            </div>

            {/* Grille de fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Messagerie unifiée */}
              <div className={`bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group ${isVisible ? 'animate-fadeInUp delay-100' : 'opacity-0'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300 group-hover:scale-110">
                    <FontAwesomeIcon icon={faComments} className="text-blue-600 text-xl group-hover:scale-125 transition-transform duration-300" />
                  </div>
                  <div className="text-emerald-600 text-sm font-medium animate-pulse-slow">Populaire</div>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">Messagerie unifiée</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Centralisez toutes vos conversations WhatsApp, Facebook, Instagram, Telegram et Email dans une interface unique.
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                  En savoir plus
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>

              {/* Gestion de catalogue */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg group">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-200 transition-colors duration-300">
                  <FontAwesomeIcon icon={faBox} className="text-emerald-600 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Gestion de catalogue</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Créez et organisez votre catalogue produits avec des outils d'import/export CSV et une synchronisation multi-plateforme.
                </p>
                <div className="flex items-center text-emerald-600 text-sm font-medium">
                  Découvrir
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>

              {/* Assistant IA */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                  <Sparkles className="text-purple-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Assistant IA intelligent</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Automatisez vos réponses aux questions fréquentes et générez du contenu marketing pertinent avec notre IA avancée.
                </p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  Explorer
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>

              {/* Suivi des commandes */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg group">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-orange-600 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Suivi des commandes</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Gérez votre processus de vente de A à Z avec un suivi en temps réel et des notifications automatiques.
                </p>
                <div className="flex items-center text-orange-600 text-sm font-medium">
                  Voir plus
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>

              {/* Analyses et statistiques */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg group">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-200 transition-colors duration-300">
                  <FontAwesomeIcon icon={faChartLine} className="text-indigo-600 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Analyses détaillées</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Obtenez des insights précieux sur vos performances avec des tableaux de bord personnalisables et des rapports détaillés.
                </p>
                <div className="flex items-center text-indigo-600 text-sm font-medium">
                  Analyser
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>

              {/* Personnalisation */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-rose-300 transition-all duration-300 hover:shadow-lg group">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-rose-200 transition-colors duration-300">
                  <FontAwesomeIcon icon={faCog} className="text-rose-600 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Personnalisation avancée</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Adaptez entièrement la plateforme à votre image de marque avec des options de personnalisation complètes.
                </p>
                <div className="flex items-center text-rose-600 text-sm font-medium">
                  Personnaliser
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>

            {/* CTA section */}
            <div className="text-center mt-16">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold text-slate-800 mb-4">Prêt à transformer votre commerce ?</h3>
                <p className="text-slate-600 mb-6">
                  Rejoignez plus de 1000 entreprises qui utilisent XAMXAM pour développer leurs ventes.
                </p>
                <Link 
                  href="/auth/register" 
                  className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
                >
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 mb-6">
                <FontAwesomeIcon icon={faRocket} className="mr-2" />
                En 4 étapes simples
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Lancez votre commerce en ligne
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Transformez votre activité avec notre plateforme tout-en-un. De la création de compte à vos premières ventes, nous vous accompagnons à chaque étape.
              </p>
            </div>

            {/* Processus étape par étape */}
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-slate-200"></div>
              
              {/* Étape 1 */}
              <div className="relative mb-16">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="w-full lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                          <FontAwesomeIcon icon={faUserPlus} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-blue-600">Étape 1</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-800 mb-3">Créez votre compte</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Inscrivez-vous gratuitement et configurez votre profil d'entreprise en quelques minutes. Notre assistant vous guide pour une configuration optimale.
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg relative z-10">
                    1
                  </div>
                  <div className="w-full lg:w-1/2 lg:pl-12 hidden lg:block"></div>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="relative mb-16">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="w-full lg:w-1/2 lg:pr-12 hidden lg:block"></div>
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg relative z-10">
                    2
                  </div>
                  <div className="w-full lg:w-1/2 lg:pl-12 mt-8 lg:mt-0">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                          <FontAwesomeIcon icon={faBox} className="text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-emerald-600">Étape 2</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-800 mb-3">Importez vos produits</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Ajoutez vos produits manuellement ou importez-les en masse via CSV. Notre système optimise automatiquement vos fiches produits pour un meilleur référencement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="relative mb-16">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="w-full lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                          <FontAwesomeIcon icon={faLink} className="text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-purple-600">Étape 3</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-800 mb-3">Connectez vos canaux</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Intégrez vos comptes WhatsApp Business, Facebook, Instagram et autres plateformes de messagerie. Toutes vos conversations centralisées en un seul endroit.
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg relative z-10">
                    3
                  </div>
                  <div className="w-full lg:w-1/2 lg:pl-12 hidden lg:block"></div>
                </div>
              </div>

              {/* Étape 4 */}
              <div className="relative">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="w-full lg:w-1/2 lg:pr-12 hidden lg:block"></div>
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg relative z-10">
                    4
                  </div>
                  <div className="w-full lg:w-1/2 lg:pl-12 mt-8 lg:mt-0">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                          <FontAwesomeIcon icon={faChartLine} className="text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-emerald-600">Étape finale</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-800 mb-3">Commencez à vendre</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Gérez vos conversations, suivez vos commandes et développez votre activité avec l'aide de notre intelligence artificielle intégrée. Vos premières ventes arrivent!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section IA et gain de temps */}
            <div className={`mt-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200 hover:shadow-2xl transition-all duration-500 ${isVisible ? 'animate-scaleIn' : 'opacity-0'}`}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4 hover:scale-110 transition-transform duration-300 animate-pulse-slow">
                  <FontAwesomeIcon icon={faRobot} className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Intelligence Artificielle
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4 hover:text-blue-600 transition-colors duration-300">
                  Fini le temps perdu à répondre manuellement
                </h3>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed hover:text-slate-800 transition-colors duration-300">
                  Notre IA prend en charge 80% de vos conversations, vous permettant de vous concentrer sur l'essentiel : développer votre business.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group hover:border-purple-300">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-all duration-300 group-hover:scale-110">
                    <FontAwesomeIcon icon={faBrain} className="text-purple-600 text-xl group-hover:scale-125 transition-transform duration-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">Marketing Automatisé</h4>
                  <p className="text-slate-600 text-sm group-hover:text-slate-800 transition-colors duration-300">L'IA crée des messages personnalisés qui convertissent vos visiteurs en clients.</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group hover:border-emerald-300">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-all duration-300 group-hover:scale-110">
                    <FileText className="text-emerald-600" size={20} />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300">Création de Contenu</h4>
                  <p className="text-slate-600 text-sm group-hover:text-slate-800 transition-colors duration-300">Générez automatiquement des descriptions de produits engageantes et des réponses pertinentes.</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group hover:border-blue-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-all duration-300 group-hover:scale-110">
                    <Clock className="text-blue-600" size={20} />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">Gestion Clientèle 24/7</h4>
                  <p className="text-slate-600 text-sm group-hover:text-slate-800 transition-colors duration-300">Vos clients sont assistés instantanément, même quand vous dormez.</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-4 bg-white rounded-2xl px-6 py-3 border border-slate-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-2 group hover:scale-110 transition-transform duration-300">
                    <Clock className="text-emerald-600 group-hover:animate-pulse" size={16} />
                    <span className="text-sm font-medium text-slate-700">Économisez 15h/semaine</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center space-x-2 group hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="text-blue-600 group-hover:animate-pulse" size={16} />
                    <span className="text-sm font-medium text-slate-700">+40% de productivité</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center space-x-2 group hover:scale-110 transition-transform duration-300">
                    <Users className="text-purple-600 group-hover:animate-pulse" size={16} />
                    <span className="text-sm font-medium text-slate-700">100% de satisfaction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA finale */}
            <div className={`text-center mt-16 ${isVisible ? 'animate-fadeInUp delay-500' : 'opacity-0'}`}>
              <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-8 border border-blue-100 max-w-2xl mx-auto hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <h3 className="text-2xl font-semibold text-slate-800 mb-4 hover:text-blue-600 transition-colors duration-300">Prêt à vous lancer ?</h3>
                <p className="text-slate-600 mb-6 leading-relaxed hover:text-slate-800 transition-colors duration-300">
                  Rejoignez plus de 1000 entreprises qui utilisent XAMXAM pour développer leurs ventes. Commencez gratuitement dès aujourd'hui.
                </p>
                <Link 
                  href="/auth/register" 
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-110 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Commencer maintenant</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <div className="mt-4 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300">
                  Configuration en 5 minutes • Essai gratuit de 14 jours
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
                <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                Tarifs transparents
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Choisissez votre formule
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Des prix adaptés à chaque étape de votre croissance. Sans engagement, résiliez quand vous voulez.
              </p>
            </div>

            {/* Plans tarifaires */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Plan Débutant */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group">
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-slate-800 mb-3">Débutant</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-5xl font-bold text-slate-800">15 000</span>
                    <span className="text-lg text-slate-600 ml-2">FCFA/mois</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Parfait pour démarrer votre commerce en ligne avec l'essentiel.
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">Jusqu'à 100 produits</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">2 canaux de messagerie</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">Assistant IA basique</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">Support par email</span>
                  </li>
                </ul>

                <Link 
                  href="/auth/register" 
                  className="block w-full bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-200 hover:border-blue-300 text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  Commencer l'essai gratuit
                </Link>
                <p className="text-center text-sm text-slate-500 mt-3">14 jours gratuits</p>
              </div>

              {/* Plan Professionnel - Populaire */}
              <div className="bg-blue-600 rounded-2xl p-8 border border-blue-700 relative transform scale-105 shadow-xl">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Plus populaire
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-white mb-3">Professionnel</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-5xl font-bold text-white">35 000</span>
                    <span className="text-lg text-blue-100 ml-2">FCFA/mois</span>
                  </div>
                  <p className="text-blue-100 leading-relaxed">
                    Pour les entreprises en croissance qui veulent plus de fonctionnalités.
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white">Produits illimités</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white">5 canaux de messagerie</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white">Assistant IA avancé</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white">Support prioritaire</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white">Analyses avancées</span>
                  </li>
                </ul>

                <Link 
                  href="/auth/register" 
                  className="block w-full bg-white hover:bg-blue-50 text-blue-600 text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                >
                  Commencer l'essai gratuit
                </Link>
                <p className="text-center text-sm text-blue-100 mt-3">14 jours gratuits</p>
              </div>

              {/* Plan Entreprise */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group">
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-slate-800 mb-3">Entreprise</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-5xl font-bold text-slate-800">75 000</span>
                    <span className="text-lg text-slate-600 ml-2">FCFA/mois</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Solution complète pour les grandes entreprises avec des besoins personnalisés.
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">Produits illimités</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">Canaux illimités</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">IA personnalisée</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">Support dédié 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">API & intégrations</span>
                  </li>
                </ul>

                <Link 
                  href="/auth/register" 
                  className="block w-full bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-200 hover:border-blue-300 text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  Contacter les ventes
                </Link>
                <p className="text-center text-sm text-slate-500 mt-3">Devis personnalisé</p>
              </div>
            </div>

            {/* Section FAQ rapide */}
            <div className="text-center mt-16">
              <p className="text-slate-600 mb-4">Vous avez des questions ?</p>
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                Contactez notre équipe commerciale →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section professionnelle */}
      <section className="bg-slate-800 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 mb-8">
              <FontAwesomeIcon icon={faRocket} className="mr-2" />
              Démarrage immédiat
            </div>
            
            {/* Titre principal */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Prêt à transformer votre commerce en ligne?
            </h2>
            
            {/* Description */}
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez plus de 1000 entreprises qui utilisent XAMXAM pour développer leur activité. 
              Commencez gratuitement et sans engagement.
            </p>
            
            {/* Bouton CTA principal */}
            <div className="mb-8">
              <Link 
                href="/auth/register" 
                className="inline-flex items-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            {/* Éléments de confiance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faRocket} className="text-emerald-600 text-lg" />
                </div>
                <h4 className="text-white font-semibold mb-2">Démarrage rapide</h4>
                <p className="text-slate-400 text-sm">Configuration en 5 minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faChartLine} className="text-blue-600 text-lg" />
                </div>
                <h4 className="text-white font-semibold mb-2">Résultats mesurables</h4>
                <p className="text-slate-400 text-sm">+40% de conversion en moyenne</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faComments} className="text-purple-600 text-lg" />
                </div>
                <h4 className="text-white font-semibold mb-2">Support dédié</h4>
                <p className="text-slate-400 text-sm">Assistance 7j/7</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Élément décoratif */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full opacity-5 blur-3xl"></div>
        </div>
      </section>

      {/* Footer professionnel */}
      <footer className="bg-slate-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section principale du footer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Logo et description */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative w-10 h-10 group">
                    <div className="absolute inset-0 bg-white rounded-lg opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
                    <div className="relative bg-slate-700 rounded-lg p-1.5 shadow-sm border border-slate-600">
                      <div className="inline-flex items-center justify-center w-7 h-7 bg-white rounded-md">
                        <span className="text-base font-bold text-slate-800">X</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-white">XAMXAM</span>
                </div>
                <p className="text-slate-300 leading-relaxed mb-6 max-w-md">
                  La plateforme tout-en-un qui transforme votre commerce en ligne. Gérez vos conversations, 
                  vendez vos produits et développez votre activité avec notre intelligence artificielle intégrée.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Liens produits */}
              <div>
                <h3 className="text-white font-semibold mb-4">Produits</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#features" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                      Fonctionnalités
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                      Tarifs
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                      Comment ça marche
                    </a>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                      Tableau de bord
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Liens entreprise */}
              <div>
                <h3 className="text-white font-semibold mb-4">Entreprise</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/contact" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                      Confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                      Conditions d&apos;utilisation
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                      Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-slate-700 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-slate-400 text-sm mb-4 md:mb-0">
                  © 2025 XAMXAM. Tous droits réservés.
                </p>
                <div className="flex items-center space-x-6">
                  <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                    Confidentialité
                  </Link>
                  <Link href="/terms-of-service" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                    Conditions
                  </Link>
                  <Link href="/contact" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
