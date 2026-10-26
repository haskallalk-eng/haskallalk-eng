# Hassieb Kalla

**KI-Implementierung · Prozessautomatisierung · API-Integration**

Ich verbinde Geschäftsprozesse, KI-Werkzeuge und APIs zu überprüfbaren Abläufen. Unter **MindRails** arbeite ich an n8n-Automatisierungen, KI-Telefonassistenten und Werkzeugen für Coding-Agenten. E-Commerce ist eine praktische Anwendungsdomäne: Bestellungen, Bestand, Versand und Kundenkommunikation.

Mein Schwerpunkt ist die praktische Umsetzung von KI und Automatisierung: Geschäftsprozesse verstehen, Systeme verbinden und das Ergebnis an konkreten Abläufen prüfen. E-Commerce ist dabei meine wichtigste Anwendungsdomäne. Ich entwickle mit KI-Unterstützung, unter anderem Claude Code; die Projektbeschreibungen ordnen meinen Beitrag und den veröffentlichten Stand ein.

**Berlin · offen für Festanstellung · Voll- oder Teilzeit · hybrid oder remote**

[E-Mail](mailto:info@mindrails.de) · [LinkedIn](https://www.linkedin.com/in/hassieb-kalla-mindrails/) · [MindRails](https://mindrails.de)

## Wo anfangen?

- **Drei Minuten für eine ausführbare Arbeitsprobe:** Der [n8n-Projektrundgang](automation-demos/order-fulfilment/walkthrough.md) zeigt Bestellprüfung, doppelte Ereignisse, verlorene Antworten und begrenzte Wiederholungen. [Workflow, Anleitung und Prüfergebnisse](automation-demos/order-fulfilment/README.md) sind öffentlich; alle Daten sind synthetisch.
- **Prozess- und Integrationsarbeit beurteilen:** [Doctor K](case-studies/doctor-k.md) zeigt die Verbindung von Shop, Bestand, Versand und E-Mail-Abläufen; [Musikbusiness & Studio](case-studies/music-automation.md) ergänzt Marketing- und Teamprozesse.
- **Code und technische Entscheidungen prüfen:** Die [Supervisor-Demo](https://github.com/haskallalk-eng/mindrails-supervisor/blob/main/docs/offline-walkthrough.md) lässt sich ohne Dienstzugänge nachvollziehen. [Phonbot](https://github.com/haskallalk-eng/voice-agent-phonbot) zeigt eine umfangreichere Anwendung mit Backend, Dashboard und externen Integrationen.

## Arbeitsproben

| Projekt | Meine Arbeit | Einstieg und Stand |
| --- | --- | --- |
| **n8n-Bestellverarbeitung** | Öffentliche Referenz mit HTTP-Anbindung, Idempotenz, Eingabeprüfung und Fehlerfällen; mit KI-Unterstützung erstellt | [Ausführen und prüfen](automation-demos/order-fulfilment/README.md) · acht synthetische Fälle, zweimal mit der echten n8n-Engine geprüft |
| **MindRails Supervisor** | Plugins, lokale App und MCP-Werkzeuge für Modellhinweise und Aufgabenprüfungen zusammengeführt | [Code und Offline-Demo](https://github.com/haskallalk-eng/mindrails-supervisor) · abgeschlossene Preview mit synthetischen Beispielen |
| **Phonbot** | KI-Telefonassistent mit Agentenkonfiguration, Dashboard und API-Integrationen | [Code und Architektur](https://github.com/haskallalk-eng/voice-agent-phonbot) · Retell-basierte Anwendung mit OpenAI-Realtime-Referenzcode |
| **Doctor K** | Shopify, Kasse, Bestand, Versand und n8n-E-Mail-Abläufe verbunden | [Fallstudie](case-studies/doctor-k.md) · interner Code und Kundendaten privat |
| **Musikbusiness & Studio** | Sechs E-Mail-Workflows, Verkaufsfunnels und KI-gestützte Teamabläufe eingerichtet | [Fallstudie](case-studies/music-automation.md) · interne Workflows und Geschäftsdaten privat |

## Code und Entscheidungen nachvollziehen

**MindRails Supervisor** bietet einen Einstieg ohne Konto oder API-Schlüssel. Die Offline-Demo zeigt anhand synthetischer Eingaben, wie Aufgaben geprüft und wiederholte Arbeitsschritte erkannt werden. [Herkunft und Abgrenzung zu Jev](https://github.com/haskallalk-eng/mindrails-supervisor/blob/main/docs/provenance.md) sind im Repository dokumentiert.

[Demo Schritt für Schritt](https://github.com/haskallalk-eng/mindrails-supervisor/blob/main/docs/offline-walkthrough.md) · [Architektur](https://github.com/haskallalk-eng/mindrails-supervisor/blob/main/docs/architecture.md) · [Prüfnachweis](https://github.com/haskallalk-eng/mindrails-supervisor/blob/main/docs/portfolio-validation.md)

Der Prüfnachweis vom 23. Oktober 2026 dokumentiert 167 bestandene Tests und 12 lokale MCP-Szenarien mit ihren jeweiligen Prüfrevisionen. Der [Review-Nachtrag](https://github.com/haskallalk-eng/mindrails-supervisor/blob/main/docs/review-follow-up.md) zeigt konkrete Korrekturen an Werkzeugstatus und Gesprächsspeicherung. Das belegt die dort beschriebenen Prüfungen, keine Modellgenauigkeit oder gemessenen Kosteneinsparungen.

**Phonbot** zeigt die Verbindung von Telefonie, Agentenkonfiguration und einem Dashboard mit **TypeScript, React und Fastify**. Für den Betrieb sind eine Datenbank und eigene Dienstzugänge erforderlich. Als Arbeitsprobe ist hier der öffentliche Retell-/OpenAI-Realtime-Code mit seinem dokumentierten Prüfstand verlinkt.

[Projektüberblick](https://github.com/haskallalk-eng/voice-agent-phonbot#readme) · [Architektur](https://github.com/haskallalk-eng/voice-agent-phonbot/blob/master/docs/architecture.md) · [Prüfnachweis](https://github.com/haskallalk-eng/voice-agent-phonbot/blob/master/docs/portfolio-validation.md)

Der [Review-Nachtrag](https://github.com/haskallalk-eng/voice-agent-phonbot/blob/master/docs/review-follow-up.md) verbindet Webhook- und Admin-Prüfungen mit konkreten Regressionstests. Ein zusätzlicher PostgreSQL-Test prüft konkurrierende Minutenreservierungen an einer echten isolierten Datenbank. Das ersetzt keine Live-Telefonie-Abnahme.

Die [Kalenderkorrektur vom 26. Oktober](https://github.com/haskallalk-eng/voice-agent-phonbot/blob/master/docs/calendar-follow-up.md) dokumentiert einen konkreten Fehler, seine Regressionstests und die Aufteilung einer großen React-Datei. Der [aktuelle Issue-Abgleich](https://github.com/haskallalk-eng/voice-agent-phonbot/blob/master/docs/issue-status-2026-10-26.md) zeigt, was im Code belegt ist und welche Betriebs- oder Abnahmenachweise noch fehlen.

## Praktische Schwerpunkte

- **E-Commerce und Integrationen:** Shopify, Kasse, Bestand, Versand und APIs.
- **Prozessautomatisierung:** n8n, E-Mail-Workflows und wiederkehrende Geschäftsabläufe.
- **KI-Implementierung:** Voice Agents, Coding-Agent-Werkzeuge und KI-gestützte Zusammenarbeit.

[MindRails Skills](skills/README.md) enthält wiederverwendbare Vorlagen für Workflow-Reviews, Handelsintegrationen und die Planung von KI-Piloten. Die Beispiele illustrieren die Anwendung und sind keine zusätzlichen Referenzprojekte.

## Zusammenarbeit

Meine Kenntnisse habe ich mir durch praktische Projekte erarbeitet. Ich suche eine Rolle mit Schwerpunkt **KI-Implementierung und Prozessautomatisierung**. Dazu bringe ich praktische Erfahrung mit E-Commerce-Prozessen und der Einrichtung verbundener Systeme mit. Im Gespräch erläutere ich gern Abläufe, Entscheidungen, Fehlerfälle und meinen konkreten Anteil an der Umsetzung.

Interner Kundencode und vertrauliche Daten bleiben privat. Ergebnisse und Grenzen sind in den jeweiligen Fallstudien eingeordnet.

[Kontakt aufnehmen](mailto:info@mindrails.de)

---

**English:** Self-taught builder focused on AI implementation, business automation and API integration, with e-commerce as a practical domain. Start with the executable synthetic n8n example, then explore the coding-agent tools, voice-assistant project and case studies. I use AI coding tools and document my contribution, evidence and limitations. Based in Berlin; open to employment.
