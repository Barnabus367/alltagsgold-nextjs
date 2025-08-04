import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  pageUrl?: string;
}

export function FAQSchema({ faqs, pageUrl }: FAQSchemaProps) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema)
      }}
    />
  );
}

// Häufige Fragen für AlltagsGold
export const defaultFAQs: FAQItem[] = [
  {
    question: 'Wie schnell wird meine Bestellung geliefert?',
    answer: 'Alle Bestellungen werden innerhalb von 1-2 Werktagen aus unserem Schweizer Lager versendet. Die Lieferung erfolgt mit der Schweizer Post in 1-3 Werktagen.'
  },
  {
    question: 'Gibt es eine Mindestbestellmenge?',
    answer: 'Nein, es gibt keine Mindestbestellmenge. Ab CHF 50.- ist der Versand kostenlos, darunter berechnen wir CHF 4.90 Versandkosten.'
  },
  {
    question: 'Kann ich meine Bestellung zurückgeben?',
    answer: 'Ja, Sie haben 30 Tage Zeit, Ihre Bestellung zurückzugeben. Die Produkte müssen unbenutzt und in Originalverpackung sein.'
  },
  {
    question: 'Ist AlltagsGold ein Schweizer Shop?',
    answer: 'Ja, AlltagsGold ist ein Schweizer Online-Shop. Wir lagern alle Produkte in der Schweiz und versenden direkt von hier - kein Dropshipping!'
  },
  {
    question: 'Welche Zahlungsmethoden werden akzeptiert?',
    answer: 'Wir akzeptieren alle gängigen Zahlungsmethoden: Kreditkarte (Visa, Mastercard), PayPal, Twint und Rechnung.'
  }
];