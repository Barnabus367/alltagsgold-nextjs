export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  updatedDate?: string;
  author: string;
  authorRole: string;
  category: string;
  tags: string[];
  readTime: number;
  featuredImage: string;
  featuredImageAlt: string;
  metaDescription: string;
  keywords: string[];
}

export const AUTHORS = {
  sarah: {
    name: "Sarah Müller",
    role: "Lifestyle-Redakteurin"
  },
  michael: {
    name: "Michael Weber",
    role: "Produktexperte"
  },
  lisa: {
    name: "Lisa Schneider",
    role: "Interior-Spezialistin"
  },
  thomas: {
    name: "Thomas Fischer",
    role: "Küchenchef & Blogger"
  }
};