// Catalog.tsx
import React from 'react';
import ProductGrid from '../components/ProductGrid';
import { products } from '../data/products';
import { Product } from '../types/product';

interface CatalogProps {
  onViewProduct: (product: Product) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onViewProduct }) => {
  return (
    <div className="min-h-screen">
      <ProductGrid 
        products={products} 
        title="Toute la Collection"
        onViewProduct={onViewProduct}
        showFilters={true}
      />
    </div>
  );
};

export default Catalog;

// About.tsx
import React from 'react';
import { Award, Truck, Shield, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-8">
            À Propos de <span className="font-bold">MOBOUR</span>
          </h1>
          <div className="w-24 h-1 bg-gray-900 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Depuis 2018, nous créons et sélectionnons des pièces de mobilier et de décoration 
            au style industriel épuré, pour sublimer votre intérieur avec authenticité et élégance.
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-6">Notre Histoire</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                Née d'une passion pour l'esthétique industrielle et le design contemporain, 
                MOBOUR puise son inspiration dans l'architecture urbaine, les matériaux 
                bruts et l'héritage manufacturier.
              </p>
              <p>
                Chaque pièce de notre collection est soigneusement sélectionnée ou créée 
                selon nos critères d'exigence : qualité des matériaux, finitions impeccables 
                et design intemporel.
              </p>
              <p>
                Nous travaillons exclusivement avec des artisans et manufacturiers qui 
                partagent notre vision du beau et du durable, pour vous offrir des créations 
                uniques qui traverseront les années.
              </p>
            </div>
          </div>
          <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <p>Image d'atelier industriel</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              Nos Valeurs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des principes qui guident chacune de nos décisions et façonnent notre approche du design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600 text-sm">
                Des matériaux nobles et des finitions irréprochables pour chaque création.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Authenticité</h3>
              <p className="text-gray-600 text-sm">
                Un style industriel respectueux des codes historiques et esthétiques.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Durabilité</h3>
              <p className="text-gray-600 text-sm">
                Des pièces conçues pour durer, dans le respect de l'environnement.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Service</h3>
              <p className="text-gray-600 text-sm">
                Un accompagnement personnalisé de la commande à la livraison.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Notre Processus
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            De la conception à la livraison, découvrez comment nous créons des pièces exceptionnelles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Conception</h3>
            <p className="text-gray-600">
              Nos designers imaginent et dessinent chaque pièce en s'inspirant de l'esthétique industrielle authentique.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Fabrication</h3>
            <p className="text-gray-600">
              Nos partenaires artisans façonnent chaque pièce avec expertise, en utilisant les meilleurs matériaux.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Livraison</h3>
            <p className="text-gray-600">
              Votre mobilier est soigneusement emballé et livré avec le plus grand soin jusqu'à chez vous.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

// Contact.tsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    alert('Message envoyé avec succès ! Nous vous recontacterons sous 24h.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-8">
            Nous <span className="font-bold">Contacter</span>
          </h1>
          <div className="w-24 h-1 bg-gray-900 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Une question, un projet sur mesure, ou simplement envie d'échanger ? 
            Notre équipe est là pour vous accompagner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Informations de Contact
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600">
                      123 Rue Industrielle<br />
                      75001 Paris, France
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                    <p className="text-gray-600">+33 1 23 45 67 89</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">contact@mobour.fr</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Horaires</h3>
                    <p className="text-gray-600">
                      Lun-Ven: 9h00 - 18h00<br />
                      Sam: 10h00 - 17h00<br />
                      Dim: Fermé
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nos Services
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Conseils personnalisés</li>
                <li>• Projets sur mesure</li>
                <li>• Livraison et installation</li>
                <li>• Service après-vente</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Envoyez-nous un Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="info">Demande d'information</option>
                    <option value="custom">Projet sur mesure</option>
                    <option value="order">Question sur commande</option>
                    <option value="support">Support technique</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Décrivez votre demande en détail..."
                    required
                  ></textarea>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className="bg-gray-900 text-white px-8 py-3 hover:bg-gray-800 transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Envoyer le Message</span>
                  </button>
                  
                  <p className="text-sm text-gray-600">
                    Réponse sous 24h
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
