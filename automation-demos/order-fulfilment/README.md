# n8n-Arbeitsprobe: Bestellereignisse zuverlässig verarbeiten

Eine ausführbare, vollständig synthetische Referenz für Prozessautomatisierung: Eine bezahlte Bestellung wird geprüft, an eine lokale Versandattrappe übergeben und bei unklarem Ergebnis mit derselben Vorgangskennung wiederholt. Das Beispiel ist mit KI-Unterstützung entstanden. Es ist ein neues öffentliches Demonstrationsprojekt, kein Export eines Kundenworkflows.

[Drei-Minuten-Rundgang](walkthrough.md) · [Importierbarer Workflow](workflow.json) · [Prüfergebnis](verification.json) · [CI](https://github.com/haskallalk-eng/haskallalk-eng/actions/workflows/portfolio.yml)

## In unter einer Minute lokal starten

Voraussetzung: Node.js 22 oder neuer. Im Stammverzeichnis dieses Repositorys:

```sh
npm test
npm run demo
```

Dieser Einstieg benötigt keine npm-Abhängigkeiten und keine Dienstzugänge. Er verwendet echte HTTP-Anfragen an eine lokal gestartete Attrappe und prüft acht Fälle zweimal. **Das ist der Node-Prüflauf, noch keine n8n-Ausführung.** Temporäre Testdaten werden anschließend entfernt.

## Den echten n8n-Workflow prüfen

Voraussetzung für den nativen Lauf: **Node.js 24 oder neuer**. Getestet mit n8n **2.44.7** und Node.js **24.22.1**; die Versionsdaten stehen auch im Prüfbericht. Die Installation benötigt Internet; die Beispiele benötigen danach keine Shop- oder Versandzugänge. Im Repository-Stamm unter Linux/macOS:

```sh
npm ci --prefix automation-demos/order-fulfilment/runtime --legacy-peer-deps --no-audit --no-fund
N8N_BIN="$PWD/automation-demos/order-fulfilment/runtime/node_modules/.bin/n8n" npm run demo:n8n
```

Der Prüflauf importiert den Workflow in eine temporäre, getrennte n8n-Datenbank und führt ihn zweimal über die n8n-CLI aus. Er prüft die tatsächlichen Knotenausgaben, Wiederholungszahlen und das Ledger der HTTP-Attrappe. Ein falsches Ergebnis beendet den Prüflauf mit Fehler. Eine bestehende n8n-Datenbank oder deren Zugangsdaten werden nicht verwendet.

Der [gespeicherte Nachweis](verification.json) enthält die Ergebnisse des lokalen Prüflaufs vom 26. Oktober 2026; die CI wiederholt den nativen Test bei Änderungen. Die [Runtime-Konfiguration](runtime/package.json) und ihr [Lockfile](runtime/package-lock.json) legen n8n samt transitiven Paketversionen fest. `npm ci` verwendet diesen Abhängigkeitsbaum für lokale Läufe und CI. Wegen überlappender optionaler Peer-Anforderungen in den n8n-Paketen verwenden beide denselben Installationsmodus `--legacy-peer-deps`; anschließend prüft der native Lauf den importierten Workflow.

## Im n8n-Editor ansehen

1. `node automation-demos/order-fulfilment/serve.mjs` starten. Die Attrappe hört nur auf `127.0.0.1:8787` und behält ihr Demo-Ledger unter `.demo-state/`.
2. [workflow.json](workflow.json) in einer lokalen n8n-Instanz importieren und manuell ausführen. Der Workflow bleibt inaktiv und enthält keine Credentials.
3. In **Record outcome** die sechs gültigen Eingaben und in **Rejected before HTTP** die zwei abgewiesenen Eingaben ansehen. Die Schleife verarbeitet jeweils eine Bestellung; im Editor gegebenenfalls zwischen den Knotenausführungen wechseln.
4. Erneut ausführen: Die erfolgreichen Fälle liefern dieselben synthetischen Label-IDs mit `replayed: true`.

Die Standardadresse funktioniert, wenn n8n und Attrappe denselben lokalen Netzwerkraum verwenden. In einem Container zeigt `127.0.0.1` auf den Container; für dieses Beispiel ist der native CLI-Prüflauf der einfachste Einstieg. Die Attrappe nicht öffentlich bereitstellen.

## Acht überprüfbare Fälle

| Eingabe | Erwartetes Ergebnis | Was damit geprüft wird |
| --- | --- | --- |
| Bezahlte, gültige Bestellung | `fulfilled` | Bestätigter Verarbeitungserfolg |
| Dasselbe Bestellereignis erneut | `fulfilled`, dieselbe Label-ID | Wiederholung erzeugt keinen zweiten Vorgang |
| Verbindung bricht nach dem Speichern ab | `fulfilled` nach Wiederholung | Ein unbekanntes Ergebnis wird mit derselben Kennung aufgelöst |
| Einmaliger Dienstfehler | `fulfilled` nach zweitem Versuch | Begrenzte Wiederholung |
| Dauerhafter Dienstfehler | `manual_review` nach drei Versuchen | Kein erfundener Erfolg, keine Endlosschleife |
| Gleiche Kennung, veränderte Bestelldaten | `manual_review` | Konflikt wird nicht als Duplikaterfolg ausgegeben |
| Unbezahlte Bestellung | `rejected` vor HTTP | Fachliche Vorbedingung |
| Ungültige Adresse | `rejected` vor HTTP | Eingabeprüfung |

Je Durchlauf ergeben sich vier bestätigte Ergebnisse, zwei Prüfaufträge und zwei Ablehnungen. Vier bestätigte Ereignisse stehen für drei neue synthetische Versandvorgänge, weil eines ein Duplikat ist. Beim zweiten Durchlauf bleibt die Gesamtzahl neuer Labels bei drei. Die Tests prüfen zusätzlich einen Neustart der Attrappe und zwölf gleichzeitig eintreffende Duplikate.

## Technische Entscheidungen und Grenzen

- Die Vorgangskennung ist `tenantId:orderId:shipmentVersion`. Ein Hash der normalisierten Geschäftsdaten erkennt veränderte Nutzdaten unter derselben Kennung. Ereignis-ID und simulierte Fehler gehören nicht zu diesem Hash.
- **Die HTTP-Attrappe besitzt das Ledger.** n8n-Workflow-Static-Data wird nicht als Sperre verwendet. Das lokale JSON-Ledger serialisiert Zugriffe innerhalb eines Prozesses und überlebt einen normalen Neustart. Es ist keine produktive Datenbank und kein Nachweis von Crash-Sicherheit oder verteilter Exactly-once-Verarbeitung.
- Je Bestellung läuft ein eigener HTTP-Schritt mit höchstens drei Versuchen, zwei Sekunden Anfrage-Timeout und einer Sekunde Wiederholungspause. Der erste native Test deckte auf, dass eine gemeinsame Verarbeitung mehrerer Items die Wiederholung späterer Fehler nicht zuverlässig auslöste. Deshalb ist die Schleife mit Batchgröße eins Bestandteil des getesteten Workflows.
- Die Demo wiederholt auch einen Konflikt dreimal. Ein produktiver Adapter sollte permanente 4xx-Konflikte sofort aussteuern, 429/5xx gezielt wiederholen und `Retry-After`, Backoff und eine Gesamtfrist beachten.
- `manual_review` ist hier ein überprüfbares Ergebnis, keine bereits eingerichtete menschliche Bearbeitungswarteschlange. Es werden keine E-Mails gesendet und keine echten Labels gekauft.
- Für einen produktiven Shop fehlen insbesondere authentifizierter Eingang und serverseitige Mandantenzuordnung, transaktionale Speicherung mit Unique Constraints, Berechtigungen, datensparsame Überwachung, eine verantwortete Fehlerwarteschlange sowie Tests gegen die tatsächlichen Anbieter. Die Fixture-Mandantenkennung ist keine Autorisierungsgrenze.
- Bestandsabbuchung, Teilversand, Storno, Erstattung und mehrere Lager sind außerhalb dieses Beispiels. Zeitersparnis, Umsatz und Kundennutzen wurden damit nicht gemessen.

## Dateien und Reproduktion

| Datei | Aufgabe |
| --- | --- |
| `validate.mjs` | Fachliche Eingabeprüfung |
| `fixtures.mjs` | Acht synthetische Eingaben mit Soll-Ergebnissen |
| `mock-api.mjs` | Lokale HTTP-Attrappe mit persistiertem Demo-Ledger |
| `build-workflow.mjs` / `workflow.json` | Generator und importierbarer n8n-Export |
| `native-run.mjs` | Import und zwei echte n8n-Ausführungen mit Assertions |
| `demo.mjs` / `tests/fulfilment.test.mjs` | Abhängigkeitenfreier HTTP-Einstieg und Regressionstests |

Nach Änderungen an Validierung oder Fixtures `npm run workflow:build` ausführen. `npm run workflow:check` verhindert, dass der veröffentlichte Export vom Quellcode abweicht.

[Zurück zum Profil](../../README.md) · [Doctor-K-Fallstudie](../../case-studies/doctor-k.md)
