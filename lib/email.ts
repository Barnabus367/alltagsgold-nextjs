/**
 * E-Mail Utility Funktionen für AlltagsGold
 */

const CONTACT_EMAIL = 'hallo@alltagsgold.ch';

export interface NewsletterData {
  email: string;
  source?: string; // 'footer' | 'collections' | 'other'
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Erstellt einen mailto-Link für Newsletter-Anmeldungen
 */
export function createNewsletterMailtoLink(email: string, source: string = ''): string {
  const subject = encodeURIComponent('Newsletter-Anmeldung - AlltagsGold');
  const body = encodeURIComponent(
    `Hallo AlltagsGold Team,

ich möchte mich für Ihren Newsletter anmelden.

E-Mail-Adresse: ${email}
Quelle: ${source}

Mit freundlichen Grüßen`
  );
  
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Erstellt einen mailto-Link für Kontaktformular
 */
export function createContactMailtoLink(data: ContactFormData): string {
  const subject = encodeURIComponent(data.subject || 'Kontaktanfrage - AlltagsGold');
  const body = encodeURIComponent(
    `Name: ${data.name}
E-Mail: ${data.email}
Betreff: ${data.subject}

Nachricht:
${data.message}

---
Diese Nachricht wurde über das Kontaktformular auf alltagsgold.ch gesendet.`
  );
  
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Versucht E-Mail zu senden (Fallback zu mailto)
 */
export async function sendEmail(type: 'newsletter' | 'contact', data: any): Promise<boolean> {
  try {
    // Versuche zuerst eine API-basierte Lösung (falls implementiert)
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data,
        to: CONTACT_EMAIL
      }),
    });

    if (response.ok) {
      return true;
    }
  } catch (error) {
    console.log('API-Email failed, falling back to mailto:', error);
  }

  // Fallback: Öffne Standard-E-Mail-Programm
  let mailtoLink: string;
  
  if (type === 'newsletter') {
    mailtoLink = createNewsletterMailtoLink(data.email, data.source);
  } else {
    mailtoLink = createContactMailtoLink(data);
  }
  
  // Öffne E-Mail-Programm
  window.location.href = mailtoLink;
  return true;
}

/**
 * Validiert E-Mail-Adresse
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Zeigt Erfolgs-/Fehlermeldung an
 */
export function showEmailNotification(success: boolean, message?: string) {
  if (success) {
    // Hier könntest du ein Toast/Notification System verwenden
    alert(message || 'E-Mail-Programm wurde geöffnet. Bitte senden Sie die E-Mail ab.');
  } else {
    alert(message || 'Fehler beim Öffnen des E-Mail-Programms.');
  }
}
