import { Product } from '../types/product';

export const products: Product[] = [
  {
    id: 1,
    name: "Surface",
    price: 289,
    category: "Éclairage",
    description: "Lampe de table au design industriel épuré, réalisée en béton lisse et métal brossé. Un parfait équilibre entre esthétisme minimaliste et fonctionnalité.",
    images: [
      "/articles/Surface-1.jpeg",
      "/articles/Surface-2.jpeg",
      "/articles/Surface-1.jpeg",
      "/articles/Surface-2.jpeg"
    ],
    specifications: {
      material: "Béton lisse, Acier inoxydable",
      dimensions: "25 x 25 x 35 cm",
      weight: "2.8 kg",
      finish: "Béton mat, Métal brossé"
    },
    inStock: true,
    featured: false
  },
  {
    id: 2,
    name: "Holy",
    price: 549,
    category: "Mobilier",
    description: "Table basse au design architectural, structure en acier noir mat et plateau en béton poli. Pièce maîtresse pour un intérieur contemporain.",
    images: [
      "/articles/Holy-1.jpeg",
      "/articles/Holy-2.jpeg",
      "/articles/Holy-1.jpeg",
      "/articles/Holy-2.jpeg"
    ],
    specifications: {
      material: "Acier, Béton poli",
      dimensions: "120 x 60 x 40 cm",
      weight: "28 kg",
      finish: "Acier noir mat, Béton poli"
    },
    inStock: true,
    featured: false
  }
];
