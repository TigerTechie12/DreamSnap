# DreamSnap

**Personalized AI photo generation** — users upload selfies, the app fine-tunes a
Flux LoRA on them, then generates new images and themed multi-prompt packs of
themselves on demand.

DreamSnap runs in two execution modes from the same product code:

- **Hosted** — training and inference go to [Fal.ai](https://fal.ai).
- **Self-hosted (free)** — a single env flag flips the backend to a job-queue
  model served by GPU notebook workers running on Colab / Kaggle. Same product,
  $0 cloud bill, operator-run.

---

## Features

- Personal LoRA fine-tuning on top of `black-forest-labs/FLUX.1-dev`.
- Single-image generation from text prompts using your trained model.
- Themed image packs — one parent pack with N prompts, rendered into N images.
- Browser-direct uploads to S3 via presigned URLs (server never proxies file bytes).
- Auto-refreshing UI for training / generation / pack progress.
- Clerk-based authentication and per-user data scoping.
- OpenAPI/Swagger docs at `/api-docs`.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind v4, Radix UI, react-router, Clerk React, Axios |
| Backend | Node.js, Express, TypeScript, Clerk Express middleware, Zod (via shared package) |
| Data | Prisma ORM, PostgreSQL (Neon) |
| Storage | AWS S3 (presigned PUT) |
| ML — hosted | Fal.ai (`flux-lora-fast-training`, `flux-lora`) + webhook callbacks |
| ML — self-hosted | Flux.1-dev + [ai-toolkit](https://github.com/ostris/ai-toolkit) (training) and Hugging Face Diffusers (inference) on Colab/Kaggle GPU notebooks |
| Infra | Vercel (frontend), Render (backend), Neon (Postgres), Hugging Face Hub |

## Architecture

```
┌──────────────┐                ┌──────────────────┐                ┌──────────────┐
│   Frontend   │   REST + JWT   │     Backend      │   Prisma       │   Postgres   │
│  React/Vite  │ ─────────────▶ │ Express + TS     │ ─────────────▶ │    (Neon)    │
└──────────────┘                └──────────────────┘                └──────────────┘
                                        │
            presigned PUT               │
   ┌────────────────────────────────────┼────────────────────────┐
   │                                    │                        │
   ▼                                    ▼                        ▼
┌──────────┐                ┌──────────────────────┐   ┌──────────────────────┐
│  AWS S3  │                │  HOSTED MODE         │   │  SELF-HOSTED MODE    │
│ uploads, │                │  Fal.ai queue +      │   │  Postgres job queue  │
│ LoRAs,   │                │  webhook callbacks   │   │  +                   │
│ outputs  │                │                      │   │  Colab GPU workers   │
└──────────┘                └──────────────────────┘   │  (training + gen)    │
                                                       └──────────────────────┘
```

The backend picks a mode at startup:
`SELF_HOSTED = process.env.TRAINING_MODE === 'manual' || !process.env.FAL_KEY`.
Both modes produce identical product behavior — only the execution path differs.

## Repo layout

```
.
├── backend/                      Express + TS API
│   └── src/index.ts              all routes
├── frontend/vite-project/        React + Vite + Tailwind app
├── packages/
│   ├── common/                   Zod schemas shared by FE + BE (dreamsnap-common)
│   └── db/                       Prisma schema + client (dreamsnap-db)
├── training/                     Colab notebooks for the self-hosted GPU workers
│   ├── flux_train_worker_colab.ipynb
│   ├── flux_worker_colab.ipynb
│   ├── flux_lora_colab.ipynb     (optional, manual per-model)
│   └── README.md
└── render.yaml                   Render deploy config
```

## Getting started

### Prerequisites

- Node.js 18+
- A Postgres database (Neon, local, anything)
- An AWS S3 bucket
- A Clerk app (publishable key for FE, secret key for BE)
- One of: a Fal.ai API key (hosted mode) **or** a Hugging Face token with
  `FLUX.1-dev` access (self-hosted mode)

### 1. Install

```bash
git clone <your-repo-url> dreamsnap
cd dreamsnap

# the db package needs to build first so the others can use it
cd packages/db && npm install && cd ../..
cd backend && npm install && cd ..
cd frontend/vite-project && npm install && cd ../..
```

### 2. Environment

**`backend/.env`**

```ini
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

DATABASE_URL=postgresql://user:password@host:5432/dreamsnap
CLERK_SECRET_KEY=sk_test_...

# S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
S3_BUCKET_NAME=...

# --- choose one execution mode ---

# Hosted mode (Fal.ai)
FAL_KEY=...

# Self-hosted mode (Colab worker)
TRAINING_MODE=manual          # forces queue mode even if FAL_KEY is set
WORKER_SECRET=<long random>   # shared with the worker notebooks
BACKEND_URL=https://<your-deploy>.onrender.com  # used in Fal webhook URLs
```

**`frontend/vite-project/.env`**

```ini
VITE_API_URL=http://localhost:8080
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**`packages/db/.env`** — Prisma reads its own `.env` for migrations.

```ini
DATABASE_URL=postgresql://user:password@host:5432/dreamsnap
```

### 3. Database

```bash
cd packages/db
npx prisma migrate deploy
npx prisma generate
```

### 4. Run

```bash
# backend
cd backend && npm run dev

# frontend (in another terminal)
cd frontend/vite-project && npm run dev
```

Open `http://localhost:5173`, sign in via Clerk, and you're up.

## Self-hosted (free) pipeline

If you set `TRAINING_MODE=manual` + `WORKER_SECRET`, training and generation are
queued in Postgres and served by Colab/Kaggle GPU worker notebooks instead of
Fal.ai. Users keep using the app exactly the same way — the difference is purely
operational (you keep two worker notebooks running on free GPUs).

See **[training/README.md](./training/README.md)** for setup.

## API surface (high-level)

| Group | Endpoint(s) | Purpose |
| --- | --- | --- |
| Auth | `GET /protected` | Resolve / lazily create the DB user from a Clerk session |
| Uploads | `POST /api/get-upload-url` | Get a presigned S3 PUT URL for the browser or workers |
| Training | `POST /ai/training` | Queue a model for training (auto-detects mode) |
|   | `GET /ai/training/:modelId/data` | Worker: fetch training images for one model |
|   | `POST /ai/training/complete` | Mark a model trained (LoRA URL in the body) |
| Generation | `POST /ai/generate` | Single image: queue (self-hosted) or submit to Fal (hosted) |
|   | `POST /ai/pack/generate` | Themed pack with N prompts |
| Worker queue (self-hosted) | `GET /worker/training-jobs` | Models awaiting training |
|   | `POST /worker/training/:id/complete` | Worker reports a finished training job |
|   | `GET /worker/jobs` | Pending image + pack-image render jobs |
|   | `POST /worker/jobs/image/:id/complete` | Worker reports a finished single image |
|   | `POST /worker/jobs/packimage/:id/complete` | Worker reports a finished pack image |
| Read | `GET /models/bulk`, `GET /models/:id` | List / fetch the current user's models |
|   | `GET /images/bulk`, `GET /images/:id` | List / fetch generated images |
|   | `GET /packs/bulk`, `GET /pack/:id` | List / fetch packs (with progress) |
| Mutate | `PUT /update/pack/:id` | Add more prompts/images to a pack |
|   | `DELETE /image/:id`, `/pack/:id`, `/packimage/:id` | Delete resources |
| Docs | `GET /api-docs`, `GET /openapi.json` | Swagger UI + OpenAPI spec |

`/worker/*` endpoints require a `x-worker-secret` header matching `WORKER_SECRET`.

## Deployment

- **Frontend** — Vercel from `frontend/vite-project`. Set `VITE_API_URL` to the
  deployed backend and `VITE_CLERK_PUBLISHABLE_KEY` to your Clerk publishable key.
- **Backend** — Render, config in [`render.yaml`](./render.yaml). Set all backend
  env vars in the Render dashboard (they're declared `sync: false`).
- **Database** — Neon (free tier auto-suspends after idle — fine for low traffic,
  cold-start adds a few seconds).
- **GPU workers (self-hosted mode)** — Colab/Kaggle notebooks in `training/`.
  Keep both running on separate GPU sessions; a single T4 can't hold the training
  subprocess and the inference pipeline at once.

## License & model usage

- **This repo**: MIT.
- **FLUX.1-dev** is gated and licensed under the
  [FLUX.1-dev Non-Commercial License](https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/LICENSE.md).
  Fine for portfolio / personal / research use. **Not allowed for commercial
  deployment**; switch to `FLUX.1-schnell` (Apache 2.0) or get a commercial Flux
  license before monetizing.

## Roadmap

- Persistent worker on a cheap always-on GPU to remove the "keep the Colab tab
  open" operational cost.
- Model versioning + retraining.
- Public / shared models.
- Credit-based pricing.
- Image editing / variations.
