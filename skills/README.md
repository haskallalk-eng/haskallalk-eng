# MindRails Skills

Drei eigenständig für dieses Portfolio ausgearbeitete Agent-Skills von **Hassieb Kalla / MindRails**, mit KI-Unterstützung erstellt. Sie übersetzen die Themen meiner Projektarbeit in wiederverwendbare Prüf- und Planungsabläufe. Keine Sammlung kopierter Fremd-Skills und kein Export interner Kundendokumentation.

| Skill | Konkretes Ergebnis | Beispiel |
| --- | --- | --- |
| [Automation Review](mindrails-review-automation/SKILL.md) | Nebenwirkungen, Wiederholungen und Fehlerbehandlung prüfen; priorisierte Befunde und Replay-Testplan liefern | [Doppelte Versandlabels](mindrails-review-automation/references/worked-example.md) |
| [Commerce Mapping](mindrails-map-commerce/SKILL.md) | Datenverantwortung, Bestell- und Bestandsübergänge sowie Ausnahmefälle abbilden | [Letzte Einheit im Shop und an der Kasse](mindrails-map-commerce/references/worked-example.md) |
| [AI Pilot](mindrails-plan-ai-pilot/SKILL.md) | Einen begrenzten KI-Piloten mit Quellen, erlaubten Aktionen und überprüfbaren Abnahmekriterien planen | [Telefonassistent für Studiobuchungen](mindrails-plan-ai-pilot/references/worked-example.md) |

## Ausprobieren

Jeder Ordner enthält eine vollständige `SKILL.md`, UI-Metadaten und ein synthetisches Arbeitsbeispiel. Übernimm den gewünschten Ordner in das Skill-Verzeichnis deines kompatiblen Agenten. Die Skills benötigen keine eigenen API-Schlüssel, Pakete oder laufenden Dienste. Der Agent kann für die tatsächliche Aufgabe zusätzliche Lesezugriffe benötigen; diese sind nicht im Skill enthalten.

Beispielaufträge nach dem Laden des jeweiligen Skills:

- `Nutze $mindrails-review-automation: Prüfe diesen redigierten Workflow auf doppelte Buchungen und sichere Wiederholungen.`
- `Nutze $mindrails-map-commerce: Ordne die Datenverantwortung zwischen Shopify, Kasse, Lager und Versand zu.`
- `Nutze $mindrails-plan-ai-pilot: Plane einen Telefonassistenten, der zunächst nur Anfragen sammelt und an Mitarbeiter übergibt.`

Ohne Skill-Unterstützung kannst du den Inhalt der gewünschten `SKILL.md` als Arbeitsanweisung bereitstellen und das verlinkte Beispiel ergänzen. Private Daten vorher entfernen. Die Vorlagen führen selbst keine Aktionen aus; ein Agent mit Werkzeugzugriff muss weiterhin die jeweiligen Berechtigungen und Bestätigungspflichten beachten.

## Prüfstand und Grenzen

Am 22. Oktober 2026 wurden alle drei Skill-Strukturen mit dem Skill-Creator-Validator geprüft. Die Beispiele sind synthetisch und beschreiben erwartetes Verhalten, keine Kundenmessungen. Die Skills sind abgeschlossene Prüf- und Planungsvorlagen; sie enthalten keine vorgetäuschten Integrationen oder Live-Demos.

Ein separater Agent hat außerdem drei synthetische Aufgaben mit den Skills bearbeitet: konkurrierende Versandlabel-Käufe, Rückerstattung vor Warenrücknahme und ein Telefonassistent ohne Kalenderzugriff. Die Antworten trennten unbekannte Zustände von Fehlern, Rückerstattung von Wiedereinlagerung und Buchungsanfrage von bestätigter Buchung. Das war ein qualitativer Durchlauf, kein wiederholter Modellbenchmark und kein Live-Integrationstest.

Eine Strukturprüfung beweist keine zuverlässige Modellleistung. Ergebnisse hängen vom ausführenden Modell, den bereitgestellten Unterlagen und Werkzeugen ab. Ein Review ersetzt keinen Integrationstest; ein geplanter Pilot ersetzt keine ausgeführte Abnahme. Kosten, Einsparungen, Rechtskonformität und Produktionsreife werden nicht garantiert.

[Zurück zum Profil](../README.md)
