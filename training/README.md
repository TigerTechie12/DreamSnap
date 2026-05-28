# Free pipeline (Colab / Kaggle)

DreamSnap can run **fully free** on notebook GPUs instead of the paid Fal.ai API —
training, single-image generation, and packs.

**These workers are run by you, the operator — not by your users.** Users just
upload images and click *Train* / *Generate*; the app queues the work and the
worker notebooks you keep running pick it up. Keep both workers running (ideally on
two separate GPU sessions — a single T4 can't hold both at once).

| Notebook | Purpose | How it runs |
| --- | --- | --- |
| [`flux_train_worker_colab.ipynb`](./flux_train_worker_colab.ipynb) | Train queued models (LoRAs) | **Operator worker** — keep running |
| [`flux_worker_colab.ipynb`](./flux_worker_colab.ipynb) | Generate images & packs | **Operator worker** — keep running |
| [`flux_lora_colab.ipynb`](./flux_lora_colab.ipynb) | Train one specific model by hand | Optional, run once per model |

## Enabling free mode

Set on Render, then redeploy:

```
TRAINING_MODE=manual
WORKER_SECRET=<any long random string>   # required for generation worker
```

With `TRAINING_MODE=manual` (or no `FAL_KEY`), the backend queues jobs instead of
calling Fal: `/ai/training` creates a `TRAINING` model, `/ai/generate` and
`/ai/pack/generate` create `PENDING` rows — the workers pick them up.

---

## Training (automatic — the training worker)

Clicking *Train* queues a model. The training worker polls for queued models,
trains each LoRA, uploads the weights, and marks the model `COMPLETED`. Users never
open a notebook.

### How it works

```
App (Train button)                Training worker (running)              Backend
─────────────────────             ─────────────────────────              ───────
POST /ai/training         ──────────────────────────────────────────▶  Model (status TRAINING)

                          GET  /worker/training-jobs   ──────────────▶  models needing training + image URLs
                          download images, train Flux LoRA
                          POST /api/get-upload-url      ─────────────▶  presigned S3 URL
                          PUT weights to S3
                          POST /worker/training/:id/complete  ───────▶  Model.trainingImagesUrl = [loraUrl]
                                                                        Model.status = COMPLETED
```

### Running the training worker

1. Open [`flux_train_worker_colab.ipynb`](./flux_train_worker_colab.ipynb) in Colab (GPU runtime).
2. Set `BACKEND_URL`, `WORKER_SECRET`, `HF_TOKEN`. Run all cells.
3. Leave it running. Each queued model is trained in turn (~1–3 h each on a free T4).

> Training is **serial** on one GPU — a queue of users waits its turn. For more
> throughput, run the worker on a beefier/always-on GPU, or fall back to Fal.

### Training one model by hand (optional)

[`flux_lora_colab.ipynb`](./flux_lora_colab.ipynb) trains a single model you specify
by `MODEL_ID` — handy for testing or re-training one model without the queue.
Set `BACKEND_URL`, `MODEL_ID` (from the Models page), and `HF_TOKEN`, then run all
cells. It uses `GET /ai/training/:modelId/data` + `POST /ai/training/complete`.

---

## Generation & packs (the worker)

Generation can't be a "run once" notebook — users generate on demand. Instead the
worker notebook stays running and processes a job queue.

### How it works

```
App (Generate / Create pack)          Worker notebook (running)              Backend
────────────────────────────         ─────────────────────────              ───────
POST /ai/generate          ──────────────────────────────────────────────▶  OutputImages (PENDING)
POST /ai/pack/generate     ──────────────────────────────────────────────▶  Pack + PackImages (PENDING)

                            GET  /worker/jobs            ──────────────────▶  pending jobs + LoRA url
                            render with Flux + LoRA
                            POST /api/get-upload-url     ──────────────────▶  presigned S3 URL
                            PUT image to S3
                            POST /worker/jobs/.../complete ────────────────▶  imageUrl set, status COMPLETED
```

All `/worker/*` endpoints require the header `x-worker-secret: <WORKER_SECRET>`.

### Running the worker

1. Open [`flux_worker_colab.ipynb`](./flux_worker_colab.ipynb) in Colab (GPU runtime).
2. Set `BACKEND_URL`, `WORKER_SECRET`, `HF_TOKEN`. Run all cells.
3. Leave the tab open. Every *Generate* / *Create pack* in the app now gets rendered
   by this worker; images appear in the app when each job finishes.
4. If the session dies, jobs stay `PENDING` — just re-run the notebook to resume.

> Single worker assumed. The notebook de-dupes in memory; don't run two workers
> against the same backend or they'll both grab the same `PENDING` jobs.

## Caveats

- **Hugging Face token required.** `FLUX.1-dev` is gated — accept its license and
  create a token first.
- **VRAM.** Free T4 (16 GB) is tight for a 12B model. The config uses 8-bit
  quantization + `low_vram` + gradient checkpointing. If you still OOM, lower
  `STEPS`, drop `RESOLUTION` to `[512]`, or use Kaggle (P100/2×T4).
- **Worker must be running to generate.** With `TRAINING_MODE=manual`, generation
  jobs sit `PENDING` until the worker notebook picks them up. No worker = no images.
- **Throughput.** A single free T4 worker renders ~1 image/1–3 min. A 10-image pack
  takes a while. That's the trade-off for $0.
- The `ai-toolkit` / `diffusers` APIs can drift between versions; if a cell errors on
  an unknown key, check the [ai-toolkit](https://github.com/ostris/ai-toolkit) /
  [diffusers](https://huggingface.co/docs/diffusers) docs and adjust.
- LoRAs trained by `ai-toolkit` load into `diffusers` via `load_lora_weights`; if a
  specific file fails to load, it's almost always a format/key-naming mismatch worth
  checking first.
