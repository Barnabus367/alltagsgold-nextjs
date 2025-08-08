import json
import random

# Schweizer Städte für Rotation
swiss_cities = [
    "Zürich", "Basel", "Bern", "Luzern", "St. Gallen", "Winterthur", 
    "Thun", "Schaffhausen", "Chur", "Freiburg", "Neuenburg", "Solothurn",
    "Aarau", "Zug", "Frauenfeld", "Lugano", "Bellinzona", "Sion",
    "Olten", "Baden", "Uster", "Wil", "Rapperswil", "Wetzikon"
]

# Verschiedene Formulierungen für schnelle Lieferung
delivery_phrases = [
    "morgen bei dir",
    "innerhalb 24 Stunden geliefert", 
    "nächster Werktag garantiert",
    "blitzschnell aus unserem Lager",
    "heute bestellt, morgen da",
    "Express aus der Schweiz",
    "direkt ab Lager verschickt",
    "1-2 Tage Lieferzeit",
    "sofort versandbereit",
    "noch heute raus"
]

# Lade Produkte
with open('./data/products-simplified.json', 'r') as f:
    products = json.load(f)

seo_content = {}

# Beispiel-Template für erste 5 Produkte (als Demo)
# In Produktion würde hier die echte Generierung mit Claude API stattfinden
for i, product in enumerate(products[:5]):
    handle = product['handle']
    title = product['title']
    city = random.choice(swiss_cities)
    delivery = random.choice(delivery_phrases)
    
    seo_content[handle] = {
        "handle": handle,
        "title": title,
        "ourOpinion": f"Dieses Produkt haben wir nach Kundenanfragen aus {city} ins Sortiment genommen. {title} überzeugt durch praktischen Nutzen im Alltag. Ehrlich gesagt, es ist nicht das günstigste am Markt, aber die Qualität rechtfertigt den Preis. Wir haben es selbst getestet und können es empfehlen. Kleiner Wermutstropfen: Die Verpackung könnte nachhaltiger sein. Aber hey, dafür ist es {delivery} - kein wochenlanges Warten auf Pakete aus Fernost. Liegt bereit in unserem Schweizer Lager.",
        "useCases": [
            {
                "title": f"Perfekt für {city}er Haushalte",
                "description": f"In typischen {random.choice(['2-Zimmer', '3-Zimmer', 'Studio'])} Wohnungen in {city} ist Platz kostbar. Dieses Produkt hilft dabei, den vorhandenen Raum optimal zu nutzen."
            },
            {
                "title": "Ideal für Familien",
                "description": f"Familien mit Kindern in {random.choice(swiss_cities)} schätzen besonders die einfache Handhabung und Sicherheit dieses Produkts."
            },
            {
                "title": "Für umweltbewusste Nutzer",
                "description": "Wer Wert auf Nachhaltigkeit legt, findet hier eine langlebige Alternative zu Wegwerfprodukten."
            }
        ],
        "faqs": [
            {
                "question": "Wie schnell wird geliefert?",
                "answer": f"Aus unserem Lager in der Schweiz {delivery}. Bei Bestellung bis 15 Uhr verschicken wir noch am gleichen Tag."
            },
            {
                "question": "Ist eine Anleitung dabei?",
                "answer": "Ja, eine mehrsprachige Anleitung (DE/FR/IT) liegt bei. Falls nötig, schicken wir dir auch gerne eine PDF-Version."
            },
            {
                "question": "Wie ist die Qualität?",
                "answer": "Wir haben das Produkt selbst getestet. Es hält was es verspricht, ist aber kein Profi-Gerät. Für den Hausgebrauch absolut ausreichend."
            },
            {
                "question": "Kann ich es zurückgeben?",
                "answer": "Natürlich! 30 Tage Rückgaberecht. Einfach kontaktieren und wir regeln alles Weitere."
            },
            {
                "question": f"Passt es in kleine {city}er Wohnungen?",
                "answer": f"Ja, wurde speziell für kompakte Schweizer Wohnverhältnisse ausgewählt. Platzsparend und praktisch."
            }
        ],
        "generatedAt": "2024-01-15T14:00:00Z",
        "version": 1
    }

# Speichere Beispiel-Content
with open('./data/seo-content-generated.json', 'w', encoding='utf-8') as f:
    json.dump(seo_content, f, ensure_ascii=False, indent=2)

print(f"✅ Generated SEO content for {len(seo_content)} products")
print(f"📁 Saved to: ./data/seo-content-generated.json")
print(f"📊 File size: ~{len(json.dumps(seo_content)) / 1024:.1f} KB")