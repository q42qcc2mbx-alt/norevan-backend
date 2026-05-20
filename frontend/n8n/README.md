# Norevan · n8n Agent-Team

Fünf Claude-Sonnet-Agents die in n8n leben und automatisch für die Boutique arbeiten.

## Die Agents

| # | Agent | Datei | Trigger |
|---|---|---|---|
| 1 | **Concierge** — schreibt Bestellbestätigungen im Norevan-Editorial-Ton | `01-order-pipeline.json` | Webhook `/norevan-order` |
| 2 | **Stylist** — empfiehlt 2 passende Artikel + Styling-Tipp | `01-order-pipeline.json` | nach Concierge |
| 3 | **Ops** — interne Slack-Nachricht, eskaliert ab 300€ | `01-order-pipeline.json` | nach Concierge |
| 4 | **Trend Scout** — täglicher Trend-Brief 9:00 morgens | `02-marketing-studio.json` | Cron |
| 5 | **Copywriter** — schreibt 3 Social-Drafts aus Scout's Input | `02-marketing-studio.json` | nach Scout |
| 6 | **Classifier** — kategorisiert Support-Anfragen | `03-support-triage.json` | Webhook `/norevan-support` |
| 7 | **Responder** — verfasst Antwort-Draft mit Confidence-Level | `03-support-triage.json` | nach Classifier |

(„Team" sind 5 spezialisierte Rollen — 7 Agents weil Klassifizierer und Responder als Tandem zählen.)

## Setup

### 1. Anthropic API-Key (einmalig)

Geh auf https://console.anthropic.com/settings/keys → „Create Key" → kopier den `sk-ant-…` Key.

Öffne dann n8n http://localhost:5678 → links unten **Credentials** → **+ Add credential** → suche „Anthropic" → API-Key einfügen → speichern als z.B. „Anthropic — Norevan".

### 2. Workflows importieren

In n8n im Browser:

1. Oben rechts auf **+ Add workflow** (Plus-Icon)
2. Dann auf das **„…"-Menü** rechts neben „Save" → **Import from File**
3. Wähle nacheinander die drei Dateien aus diesem Ordner:
   - `01-order-pipeline.json`
   - `02-marketing-studio.json`
   - `03-support-triage.json`

Für jeden Workflow:
- Beim ersten Öffnen werden die **Claude-Nodes** rot („Credentials needed") sein → klick rein → wähle die in Schritt 1 angelegte Anthropic-Credential aus → speichern.
- **Aktiviere den Workflow** mit dem Toggle oben rechts (sonst feuern Webhook/Cron nicht).

### 3. Webhook-URL in Norevan eintragen

Sobald Workflow 1 aktiv ist, hat n8n eine Production-URL für den Webhook generiert. Sieht aus wie:

```
http://localhost:5678/webhook/norevan-order
```

(Im Webhook-Node oben siehst du die genaue URL.)

Lege im Projekt-Root `.env.local` an (falls noch nicht da) und füge ein:

```
N8N_ORDER_WEBHOOK_URL=http://localhost:5678/webhook/norevan-order
```

Dann Next.js-Server neu starten — fertig.

### 4. Testen

Trigger eine Demo-Bestellung über `/de/checkout` → Bestellung speichern → die `/api/checkout` route POSTet automatisch an n8n → die drei Agents (Concierge, Stylist, Ops) laufen nacheinander → du siehst das Resultat in n8n unter „Executions" links im Sidebar.

Für den Support-Workflow kannst du manuell testen mit:

```bash
curl -X POST http://localhost:5678/webhook/norevan-support \
  -H "content-type: application/json" \
  -d '{
    "email": "kunde@example.com",
    "name": "Maria",
    "message": "Mein Paket sollte gestern da sein, ist aber nicht angekommen. Was nun?",
    "orderId": "ord-12345",
    "locale": "de"
  }'
```

Du bekommst zurück: Klassifikation (category/urgency/requires_human) + Antwort-Entwurf + Confidence.

## Cost-Awareness

Jeder Workflow-Run kostet API-Tokens. Grobe Schätzung pro Trigger:

| Workflow | Calls/Run | Approx. Tokens | Approx. Cost |
|---|---|---|---|
| Order Pipeline | 3 (Concierge + Stylist + Ops) | ~2k in / 1.5k out | ~$0.025 |
| Marketing Studio | 2 (Scout + Copywriter) | ~1k in / 2k out | ~$0.030 |
| Support Triage | 2 (Classifier + Responder) | ~1k in / 1k out | ~$0.018 |

Bei 50 Bestellungen + 1 daily Marketing-Run + 20 Support-Anfragen pro Tag: **ca. $2.20/Tag** = $66/Monat.

Falls dir das zu viel wird:
- Tausche im LM-Chat-Anthropic-Node `claude-sonnet-4-5` gegen `claude-haiku-4-5` (≈ 10x billiger, leicht schwächere Prosa).
- Oder schalte einzelne Workflows einfach off.

## Erweiterungen die du dazubauen kannst

- **Email-Send-Node** nach `Compose Output` im Order-Pipeline → schickt die Concierge-Mail direkt raus (SMTP-Credential nötig, z.B. Resend, Brevo, oder dein eigener SMTP).
- **Slack-Node** nach `Compose Output` → postet Ops-Message in deinen Channel (Slack-Webhook-URL oder OAuth).
- **Notion-Node** in `02-marketing-studio` → das Daily Brief landet automatisch als Page in deinem Notion.
- **Google Sheets** im Order-Pipeline → jede Bestellung als Row für Buchhaltung.
- **WebSearch-Tool** für den Trend Scout → echte aktuelle News statt nur „aus dem Training".

## Debugging

- **Workflow läuft nicht** → ist der Toggle oben rechts auf „Active"? Im Inactive-Modus feuern Webhooks nicht.
- **Claude-Node failed mit 401** → Credential nicht ausgewählt im Node, oder API-Key abgelaufen.
- **Parser-Error** → Claude hat unstrukturiert geantwortet. Im LM-Node `temperature` runter (0.2-0.4) oder im Parser den `inputSchema` lockern.
- **Webhook hängt** → eine Output-Parser-Schleife. Check die Execution-History links → roter Node ist der Übeltäter.
