import { useState, useEffect } from 'react';

const trustQuotes = [
  "Ich will keine Dropshipping-Ware – sondern echte Produkte aus der Schweiz.",
  "Lieferung in 2 Tagen – das nenn ich Service.",
  "Rückgabe ohne Diskussion – das gibt's sonst nirgends.",
  "Einfach ehrlich. Alltagsgold."
];

export function TrustSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(3);
  const [showPrevious, setShowPrevious] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Show previous quote briefly for pulse effect
      setShowPrevious(true);
      setPreviousIndex(currentIndex);
      
      // After 500ms, hide previous and show new current
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % trustQuotes.length);
        setTimeout(() => {
          setShowPrevious(false);
        }, 500);
      }, 100);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section className="bg-gradient-to-r from-[#fefaf5] to-[#f7f1ea] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Intro text */}
        <p className="text-center text-sm uppercase tracking-widest text-amber-600 mb-6 font-medium">
          Was unsere Kunden sagen
        </p>

        {/* Vertrauenspuls Container */}
        <div className="relative h-48 md:h-52 lg:h-56 flex items-center justify-center">
          {/* Previous quote - subtle echo effect */}
          {showPrevious && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-neutral-800 opacity-5 text-center transition-all duration-1000 ease-in-out px-8 translate-y-[2px] blur-sm">
                " {trustQuotes[previousIndex]} "
              </p>
            </div>
          )}

          {/* Current active quote */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-neutral-800 opacity-100 text-center transition-all duration-1000 ease-in-out px-8 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
              " {trustQuotes[currentIndex]} "
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}