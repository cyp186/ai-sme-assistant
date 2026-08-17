# REPLIVO — AI Business Assistant

REPLIVO is a full-stack web app that helps small and medium-sized businesses manage customer enquiries and draft AI-assisted replies grounded in their own knowledge base.

Business owners can track customers and enquiries in one place, generate a reply draft with OpenAI, review and edit it, approve it, then email it to the customer.

---

## Features

- **Authentication** — register, email verification, JWT login
- **Business profile** — one business per user (name, industry, contact, description)
- **Customer management** — full CRUD for customer records
- **Enquiry management** — log, update, and track enquiry status (`pending`, `in_progress`, `resolved`)
- **Knowledge base** — store policies, pricing, FAQs, and other business context
- **AI response drafts** — generate replies with OpenAI using enquiry + knowledge base context
- **Tone options** — default, professional, friendly, or concise
- **Human review** — edit drafts, approve, then send by email
- **Dashboard** — counts for customers, enquiries, pending items, and approved AI responses
- **Marketing site** — public home, about, features, and partnership pages

---

## How it works

```text
Register → Verify email → Login
        ↓
Create business profile
        ↓
Add knowledge base + customers
        ↓
Log customer enquiry
        ↓
Generate AI draft (OpenAI + knowledge base)
        ↓
Review / edit → Approve → Email to customer
```

1. User creates an account and verifies their email.
2. They set up a business profile and knowledge base entries.
3. Customers and enquiries are recorded in the app.
4. From an enquiry, the user opens **Review AI response** and generates a draft.
5. The draft can be edited, approved, then emailed to the customer via SMTP.

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite, React Router |
| Backend | FastAPI, SQLAlchemy (async), Alembic, Pydantic |
| Database | PostgreSQL |
| Auth | JWT (python-jose), bcrypt, email verification codes |
| AI | OpenAI API (`gpt-4o-mini`) |
| Email | SMTP (verification codes + customer reply delivery) |

---

## Project structure

```text
ai-sme-assistant/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── models/           # SQLAlchemy models
│   │   ├── routers/          # API routes
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Auth, email, OpenAI
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/
│   │   ├── context/          # Auth context
│   │   ├── pages/
│   │   └── ...
│   ├── .env.example
│   └── package.json
├── docs/                     # Architecture diagrams
└── README.md
```

---

## Prerequisites

- Python 3.11+ (tested with newer versions as well)
- Node.js 18+
- PostgreSQL running locally
- OpenAI API key with billing/credits enabled (required for AI drafting)
- SMTP credentials (optional for local verification codes; required to email customers)

---

## Setup

### 1. Clone and create the database

Create a PostgreSQL database, for example:

```sql
CREATE DATABASE ai_sme_assistant;
```

### 2. Backend

```powershell
cd backend
python -m venv ..\.venv
..\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy environment config:

```powershell
copy .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ai_sme_assistant
SECRET_KEY=change-me-to-a-long-random-string
OPENAI_API_KEY=sk-your-openai-key

# Leave SMTP_HOST empty for local auth testing — verification codes print in the backend console
VERIFICATION_CODE_EXPIRE_MINUTES=15
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@ai-business-assistant.local
SMTP_USE_TLS=true
```

Run migrations:

```powershell
alembic upgrade head
```

Start the API:

```powershell
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000  
- Interactive docs: http://localhost:8000/docs  

### 3. Frontend

In a second terminal:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

App: http://localhost:5173  

`frontend/.env` should point at the API:

```env
VITE_API_URL=http://localhost:8000
```

---

## Local development notes

### Email verification
If `SMTP_HOST` is empty, verification codes are logged in the backend console instead of being emailed. That is enough for local login testing.

### Sending replies to customers
Approve → **Send** needs:
- A customer with an email address
- Working SMTP settings in `backend/.env`

### OpenAI
AI draft generation needs a valid `OPENAI_API_KEY` and API credits. ChatGPT Plus does **not** cover API usage. Without credits, the rest of the app still works; only **Generate draft** fails.

---

## Main API areas

| Prefix | Purpose |
|--------|---------|
| `/auth` | Register, verify email, resend code, login, current user |
| `/business` | Create / get / update business profile |
| `/customers` | Customer CRUD |
| `/enquiries` | Enquiry CRUD |
| `/knowledge-base` | Knowledge base CRUD |
| `/enquiries/{id}/ai-responses` | Generate, list, update, approve, send AI drafts |
| `/ai-responses/stats` | Dashboard approved / total counts |

All business-scoped routes require a JWT bearer token.

---

## Documentation

Additional diagrams are in `/docs`:

- `initial-architecture.png`
- `intial-er-diagram.png`

---

## License

Private 
