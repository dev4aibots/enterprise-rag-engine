# Enterprise RAG Engine

A production-oriented Retrieval-Augmented Generation (RAG) system with
evaluation: a FastAPI service that ingests documents, chunks and indexes
them, retrieves the most relevant chunks with numeric scores, composes an
answer grounded in those chunks with citations, and reports evaluation
metrics computed from the actual run.

**Live demo:** https://enterprise-rag-engine-demo.vercel.app — a fully
client-side version of the same pipeline (in `demo/`), running entirely in
the browser with no backend.

Tags: `rag` · `vector-search` · `fastapi` · `python`

## Pipeline

1. **Ingest** — `POST /ingest` accepts a document (`doc_id`, `title`,
   `text`) and stores it in the corpus.
2. **Chunking** — documents are split on sentence and paragraph boundaries
   with configurable chunk size and overlap (`app/chunking.py`).
3. **Embeddings & vector search** — chunks are vectorised with TF-IDF
   (`app/embeddings.py`, standard library only — no model downloads) and
   ranked against a query by cosine similarity in an in-memory vector
   store (`app/store.py`). Every result carries its numeric score, source
   document, and chunk index. The store's interface is deliberately small
   so a dense embedding model can replace TF-IDF behind the same API.
4. **Grounded answer** — `POST /query` composes an extractive answer from
   the retrieved chunks only, with inline citations (`[1]`, `[2]`, …)
   mapped to their source chunks (`app/generation.py`). When retrieval
   finds no coverage, the service says so plainly instead of inventing an
   answer.
5. **Evaluation** — `POST /evaluate` runs the same query and reports
   metrics computed from that run (`app/evaluation.py`): retrieved count,
   mean and top-1 similarity, **faithfulness** (share of answer sentences
   whose key terms appear in the chunk they cite), **citation coverage**
   (share of answer sentences carrying a citation), and — when labelled
   relevant document ids are supplied — **precision@k** and **recall@k**.

## Run it

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# interactive API docs: http://127.0.0.1:8000/docs
```

Quick smoke test:

```bash
curl -s localhost:8000/health
curl -s -X POST localhost:8000/ingest -H 'Content-Type: application/json' \
  -d "{\"doc_id\":\"acme\",\"title\":\"Acme Cloud\",\"text\":\"$(cat sample_data/sample.txt | tr '\n' ' ' | sed 's/\"//g')\"}"
curl -s -X POST localhost:8000/query -H 'Content-Type: application/json' \
  -d '{"query":"How does Acme Cloud encrypt data at rest?"}'
curl -s -X POST localhost:8000/evaluate -H 'Content-Type: application/json' \
  -d '{"query":"How does Acme Cloud encrypt data at rest?","relevant_doc_ids":["acme"]}'
```

Or run the pipeline test directly (no server needed):

```bash
python3 tests/test_pipeline.py
```

## Layout

- `app/main.py` — FastAPI service (`/health`, `/ingest`, `/query`, `/evaluate`)
- `app/chunking.py` — sentence/paragraph-aware chunking
- `app/embeddings.py` — TF-IDF embeddings + cosine similarity
- `app/store.py` — in-memory vector store
- `app/generation.py` — extractive grounded answering with citations
- `app/evaluation.py` — faithfulness / citation-coverage / precision@k metrics
- `sample_data/sample.txt` — sample document for the smoke test
- `tests/test_pipeline.py` — end-to-end pipeline test
- `demo/` — the client-side demo (plain HTML/CSS/JS, no build step);
  see `demo/README.md`

## Repository history note

This repository previously held a misplaced copy of the PRAMAAN v2
codebase (which lives canonically in
[dev4aibots/Pramaan](https://github.com/dev4aibots/Pramaan)). That copy is
preserved unchanged on the `backup/pramaan-v2-copy-20261021` branch. The
FastAPI service in this repository is this project's own implementation
of the Enterprise RAG Engine spec, written for this restoration; the
`demo/` folder is the project's genuine client-side demo artifact.
