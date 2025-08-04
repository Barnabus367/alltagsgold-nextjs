import { useState } from 'react';
import { User, Heart, ThumbsUp, Star, Calendar, Package, TestTube } from '@/lib/icons';

interface PersonalNote {
  author: string;
  role: string;
  avatar?: string;
  content: string;
  date: string;
}

interface ProductTestResult {
  criteria: string;
  rating: number;
  comment: string;
}

interface PersonalProductDescriptionProps {
  productHandle: string;
  productTitle: string;
  originalDescription?: string;
}

// Simulierte persönliche Notizen - in Produktion aus CMS/Datenbank
const getPersonalNotes = (productHandle: string): PersonalNote | null => {
  const notes: Record<string, PersonalNote> = {
    'default': {
      author: 'Sarah',
      role: 'Produktmanagerin',
      content: `Dieses Produkt haben wir persönlich ausgewählt, weil es unseren hohen Qualitätsstandards entspricht. 
      Wir haben es selbst getestet und sind überzeugt von der Verarbeitung und Funktionalität. 
      Besonders gefällt uns die durchdachte Konstruktion und die Langlebigkeit des Materials.`,
      date: 'Getestet im Januar 2024'
    }
  };

  return notes[productHandle] || notes['default'];
};

// Simulierte Testergebnisse
const getTestResults = (productHandle: string): ProductTestResult[] => {
  return [
    { criteria: 'Verarbeitungsqualität', rating: 5, comment: 'Hochwertige Materialien, sauber verarbeitet' },
    { criteria: 'Alltagstauglichkeit', rating: 4, comment: 'Praktisch und einfach zu bedienen' },
    { criteria: 'Preis-Leistung', rating: 5, comment: 'Fairer Preis für die gebotene Qualität' },
    { criteria: 'Langlebigkeit', rating: 4, comment: 'Robust gebaut, hält was es verspricht' }
  ];
};

export function PersonalProductDescription({ 
  productHandle, 
  productTitle,
  originalDescription 
}: PersonalProductDescriptionProps) {
  const [showTestDetails, setShowTestDetails] = useState(false);
  const personalNote = getPersonalNotes(productHandle);
  const testResults = getTestResults(productHandle);
  
  const averageRating = testResults.reduce((acc, test) => acc + test.rating, 0) / testResults.length;

  return (
    <div className="space-y-6">
      {/* Persönliche Empfehlung */}
      {personalNote && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-amber-800" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">{personalNote.author} empfiehlt:</h4>
                <span className="text-sm text-gray-600">– {personalNote.role}</span>
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "{personalNote.content}"
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {personalNote.date}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  Von uns empfohlen
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unser Test-Ergebnis */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TestTube className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Unser Testurteil</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating) 
                        ? 'text-amber-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">{averageRating.toFixed(1)}/5</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Wir haben dieses Produkt ausführlich getestet, bevor wir es in unser Sortiment aufgenommen haben. 
            Hier sind unsere Erkenntnisse:
          </p>

          {/* Test-Kriterien */}
          <div className="space-y-3">
            {testResults.slice(0, showTestDetails ? undefined : 2).map((test, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < test.rating 
                          ? 'text-amber-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm">{test.criteria}</h5>
                  <p className="text-sm text-gray-600 mt-0.5">{test.comment}</p>
                </div>
              </div>
            ))}
          </div>

          {testResults.length > 2 && (
            <button
              onClick={() => setShowTestDetails(!showTestDetails)}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {showTestDetails ? 'Weniger anzeigen' : 'Alle Testkriterien anzeigen'}
            </button>
          )}
        </div>
      </div>

      {/* Warum bei uns kaufen? */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Warum dieses Produkt bei AlltagsGold kaufen?
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Wir haben es selbst auf Lager und können es sofort versenden</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Von unserem Team persönlich getestet und für gut befunden</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Bei Fragen hilft unser Schweizer Support-Team gerne weiter</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>30 Tage Rückgaberecht - testen Sie in Ruhe zu Hause</span>
          </li>
        </ul>
      </div>

      {/* Original Produktbeschreibung (falls vorhanden) */}
      {originalDescription && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Produktdetails</h4>
          <div className="prose prose-sm max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: originalDescription }} />
          </div>
        </div>
      )}
    </div>
  );
}