import { Product } from '../types/product';

export const products: Product[] = [
  {
    id: 1,
    name: "Lampe Industrielle Béton",
    price: 289,
    category: "Éclairage",
    description: "Lampe de table au design industriel épuré, réalisée en béton lisse et métal brossé. Un parfait équilibre entre esthétisme minimaliste et fonctionnalité.",
    images: [
      "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571456/pexels-photo-1571456.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=800"
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
    name: "Table Basse Métal",
    price: 549,
    category: "Mobilier",
    description: "Table basse au design architectural, structure en acier noir mat et plateau en béton poli. Pièce maîtresse pour un intérieur contemporain.",
    images: [
      "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1350790/pexels-photo-1350790.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1350792/pexels-photo-1350792.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    specifications: {
      material: "Acier, Béton poli",
      dimensions: "120 x 60 x 40 cm",
      weight: "28 kg",
      finish: "Acier noir mat, Béton poli"
    },
    inStock: true,
    featured: false
  },
  {
    id: 3,
    name: "Étagère Modulaire",
    price: 349,
    category: "Mobilier",
    description: "Système d'étagères modulaire en acier brut et bois massif. Design épuré pour une organisation optimale de l'espace.",
    images: [
      "https://images.pexels.com/photos/1350769/pexels-photo-1350769.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1350771/pexels-photo-1350771.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1350773/pexels-photo-1350773.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    specifications: {
      material: "Acier brut, Chêne massif",
      dimensions: "180 x 35 x 200 cm",
      weight: "18 kg",
      finish: "Acier brut, Bois huilé"
    },
    inStock: true,
    featured: false
  },
  {
    id: 4,
    name: "Suspension Minimaliste",
    price: 189,
    category: "Éclairage",
    description: "Suspension au design ultra-épuré, structure en métal brossé et diffuseur en verre dépoli. Éclairage doux et élégant.",
    images: [
      "https://images.pexels.com/photos/1571464/pexels-photo-1571464.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571465/pexels-photo-1571465.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571466/pexels-photo-1571466.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    specifications: {
      material: "Métal brossé, Verre",
      dimensions: "Ø 30 x 25 cm",
      weight: "1.2 kg",
      finish: "Métal brossé, Verre dépoli"
    },
    inStock: true,
    featured: false
  },
  {
    id: 5,
    name: "Chaise Industrielle",
    price: 229,
    category: "Mobilier",
    description: "Chaise au design industriel authentique, structure en acier et assise en cuir vieilli. Confort et style réunis.",
    images: [
      "https://images.pexels.com/photos/1350767/pexels-photo-1350767.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571472/pexels-photo-1571472.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1350768/pexels-photo-1350768.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571474/pexels-photo-1571474.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    specifications: {
      material: "Acier, Cuir vieilli",
      dimensions: "45 x 50 x 85 cm",
      weight: "6.5 kg",
      finish: "Acier brut, Cuir vieilli"
    },
    inStock: true,
    featured: false
  },
  {
    id: 6,
    name: "Miroir Industriel",
    price: 169,
    category: "Décoration",
    description: "Miroir rond encadré de métal oxydé, inspiré des fenêtres industrielles. Pièce décorative forte pour sublimer votre intérieur.",
    images: [
      "https://images.pexels.com/photos/1350774/pexels-photo-1350774.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571475/pexels-photo-1571475.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1350775/pexels-photo-1350775.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1571476/pexels-photo-1571476.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    specifications: {
      material: "Métal oxydé, Miroir",
      dimensions: "Ø 80 cm",
      weight: "3.8 kg",
      finish: "Métal oxydé"
    },
    inStock: true,
    featured: false
  }
];