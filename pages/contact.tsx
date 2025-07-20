import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SEOHelmet } from '../components/SEOHelmet';
import { SEOHead } from '../components/seo/SEOHead';
import { Mail, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { trackContact } from '@/lib/analytics';
import { Layout } from '@/components/layout/Layout';
import { generateStaticPageSEO } from '../lib/seo';

export default function ContactPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Generate SEO metadata for contact page
  const seoData = generateStaticPageSEO('contact');

  return (
    <Layout onSearch={setSearchQuery}>
      <SEOHead seo={seoData} canonicalUrl="/contact" />
      <Contact />
    </Layout>
  );
}

export function Contact() {
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const formInView = useInView(formRef, { once: true, margin: "-100px" });
  const infoInView = useInView(infoRef, { once: true, margin: "-100px" });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Track contact form submission
      trackContact({
        form_name: 'contact_form',
        method: 'form_submission'
      });

      const response = await apiRequest('POST', '/api/contact', formData);
      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setError(result.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      // Parse error message from apiRequest
      const errorMessage = error.message || 'Verbindungsfehler. Bitte versuchen Sie es später erneut.';
      if (errorMessage.includes('400:')) {
        setError(errorMessage.split('400: ')[1] || 'Ungültige Eingabedaten');
      } else if (errorMessage.includes('500:')) {
        setError('Serverfehler. Bitte versuchen Sie es später erneut.');
      } else {
        setError('Verbindungsfehler. Bitte versuchen Sie es später erneut.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHelmet 
        title="Kontakt - Wir sind für Sie da"
        description="Kontaktieren Sie uns bei Fragen zu unseren Premium-Produkten. Unser Kundenservice steht Ihnen gerne zur Verfügung. Schnelle und professionelle Beratung."
        canonicalUrl="/contact"
        type="website"
      />
      
      {/* HULL-style Hero Section */}
      <motion.section 
        ref={heroRef}
        className="py-32 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-light text-black mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Kontakt
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Haben Sie Fragen zu unseren Produkten oder benötigen Sie Unterstützung? 
            Wir sind für Sie da und freuen uns auf Ihre Nachricht.
          </motion.p>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* HULL-style Contact Form */}
          <motion.div 
            ref={formRef}
            initial={{ opacity: 0, x: -50 }}
            animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-light text-black mb-8 tracking-tight">
              Nachricht senden
            </h2>
            
            {isSubmitted && (
              <motion.div 
                className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 font-light"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Vielen Dank für Ihre Nachricht. Wir werden uns bald bei Ihnen melden.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-normal text-black mb-2 tracking-wide">
                    NAME *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none font-light"
                    placeholder="Ihr vollständiger Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-normal text-black mb-2 tracking-wide">
                    E-MAIL *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none font-light"
                    placeholder="ihre.email@beispiel.ch"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-normal text-black mb-2 tracking-wide">
                  BETREFF *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none font-light"
                  placeholder="Worum geht es bei Ihrem Anliegen?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-normal text-black mb-2 tracking-wide">
                  NACHRICHT *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none font-light resize-vertical"
                  placeholder="Teilen Sie uns mit, wie wir Ihnen helfen können..."
                />
              </div>
              
              {/* Success Message */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-sm"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Nachricht erfolgreich gesendet!</p>
                    <p className="text-green-700 text-sm">Sie erhalten eine Bestätigungs-E-Mail und wir melden uns schnellstmöglich bei Ihnen.</p>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-sm"
                >
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-red-800 font-medium">Fehler beim Senden</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
              
              <Button 
                type="submit" 
                disabled={isSubmitting || isSubmitted}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 font-normal tracking-wide disabled:opacity-50"
              >
                {isSubmitting ? 'WIRD GESENDET...' : isSubmitted ? 'GESENDET ✓' : 'NACHRICHT SENDEN'}
              </Button>
            </form>
          </motion.div>

          {/* HULL-style Contact Info */}
          <motion.div 
            ref={infoRef}
            className="space-y-12"
            initial={{ opacity: 0, x: 50 }}
            animate={infoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div>
              <h2 className="text-3xl font-light text-black mb-8 tracking-tight">
                Kontaktinformationen
              </h2>
              <p className="text-gray-600 font-light leading-relaxed mb-8">
                Erreichen Sie uns über verschiedene Kanäle. Wir antworten normalerweise 
                innerhalb von 24 Stunden.
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  icon: Mail,
                  title: "E-Mail",
                  content: "hallo@alltagsgold.ch",
                  subtitle: "Für allgemeine Anfragen"
                },
                {
                  icon: MapPin,
                  title: "Adresse",
                  content: "AlltagsGold\nSchweiz",
                  subtitle: "Online-Shop"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={infoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1, ease: "easeOut" }}
                >
                  <div className="p-3 bg-gray-100 rounded-full">
                    <item.icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-normal text-black mb-1 tracking-wide">
                      {item.title.toUpperCase()}
                    </h3>
                    <p className="text-gray-800 font-light leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                    <p className="text-sm text-gray-500 font-light">
                      {item.subtitle}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* HULL-style FAQ Section */}
      <motion.section 
        className="py-20 bg-gray-50"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-black mb-6 tracking-tight">
              Häufige Fragen
            </h2>
            <p className="text-lg text-gray-600 font-light leading-relaxed">
              Antworten auf die am häufigsten gestellten Fragen.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                question: "Wie lange dauert der Versand?",
                answer: "Wir versenden alle Bestellungen innerhalb von 1-2 Werktagen. Die Lieferzeit beträgt in Deutschland 2-4 Werktage."
              },
              {
                question: "Kann ich meine Bestellung zurücksenden?",
                answer: "Ja, Sie haben 30 Tage Rückgaberecht. Die Artikel müssen unbenutzt und in der Originalverpackung sein."
              },
              {
                question: "Welche Zahlungsmethoden akzeptieren Sie?",
                answer: "Wir akzeptieren alle gängigen Kreditkarten, PayPal, SEPA-Lastschrift und Kauf auf Rechnung."
              },
              {
                question: "Haben Sie einen physischen Store?",
                answer: "Derzeit sind wir nur online tätig, planen aber die Eröffnung eines Showrooms in der Zukunft."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="border-b border-gray-200 pb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-normal text-black mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

// Default export for Next.js routing
export default function ContactPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout onSearch={setSearchQuery}>
      <Contact />
    </Layout>
  );
}
