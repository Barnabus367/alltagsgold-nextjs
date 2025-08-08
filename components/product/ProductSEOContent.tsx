import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SEOContentProps {
  ourOpinion?: string;
  useCases?: Array<{
    title: string;
    description: string;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export function ProductSEOContent({ ourOpinion, useCases, faqs }: SEOContentProps) {
  const [faqOpen, setFaqOpen] = React.useState<number | null>(null);
  
  if (!ourOpinion && !useCases && !faqs) {
    return null;
  }

  return (
    <div className="mt-12 space-y-12">
      {/* Unsere ehrliche Meinung */}
      {ourOpinion && (
        <section className="bg-gray-50 rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4">Unsere ehrliche Meinung</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {ourOpinion}
          </p>
        </section>
      )}

      {/* Anwendungsfälle */}
      {useCases && useCases.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Perfekt geeignet für</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Häufig gestellte Fragen */}
      {faqs && faqs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Häufig gestellte Fragen</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      faqOpen === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {faqOpen === index && (
                  <div className="px-4 pb-3 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}