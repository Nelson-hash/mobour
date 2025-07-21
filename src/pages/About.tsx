import React from 'react';
import { Award, Truck, Shield, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen">
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