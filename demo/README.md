# Enterprise RAG Engine — Live Demo

A fully client-side, genuinely functional Retrieval-Augmented Generation (RAG)
demo. Open `index.html` in a browser — there is no backend, no build step, and
no network dependency. All files are plain HTML, CSS, and vanilla JavaScript.

## What it does

1. **Documents** — Four bundled sample documents (Remote Work Policy 2026,
   Product Launch Brief — Atlas, Customer Support Handbook, and Cloud
   Infrastructure Cost Report), each listed with its word count and a working
   remove button. You can paste your own document with a title and add it to
   the corpus (empty or near-empty input is rejected), or restore the original
   sample set with “Load sample set”. Changing the corpus invalidates the old
   index honestly instead of silently searching stale data.
2. **Chunking & indexing** — Chunk size (100–500 chars) and overlap (0–100
   chars) sliders with live values. “Build index” performs real chunking that
   splits on sentence/paragraph boundaries while respecting the size and
   overlap settings, renders every chunk (document title, chunk number,
   character count, text preview), and computes TF-IDF vectors over the
   chunks. Index statistics (documents, chunks, vocabulary size) are counted
   from the actual build.
3. **Retrieval** — A query is vectorised with the same TF-IDF scheme and ranked
   against every chunk by cosine similarity. Three preset question chips fill
   the query box with questions that genuinely match the sample documents.
   Results show the numeric score, a score bar, the document title and chunk
   number, and clicking a result highlights the corresponding chunk in the
   chunking view.
4. **Grounded answer** — “Generate grounded answer” composes an answer
   extractively: it selects sentences from the retrieved chunks only, ranked
   by query-term overlap and chunk score, and attaches inline citations
   `[1]`, `[2]`, … mapped to the ranked results. Clicking a citation
   highlights its source chunk. If every retrieval score is effectively zero,
   the panel states plainly that the corpus does not cover the question —
   it never invents an answer.
5. **Evaluation** — Metrics are computed from the actual last run: retrieved
   count, mean similarity, top-1 similarity, answer faithfulness (share of
   answer sentences whose key terms appear in their cited chunk), citation
   coverage (share of answer sentences carrying a citation), and retrieval
   latency measured with `performance.now()`. Before any run, the panel shows
   an honest “run a query to populate” state.

A pipeline status strip (Documents → Chunks → Index → Retrieval → Answer →
Evaluation) lights up as each stage actually completes.

## Why it is “real”

Nothing is mocked: chunking, TF-IDF weighting, cosine ranking, extractive
answering, and every evaluation number are computed in the page from whatever
documents are currently loaded — including documents you paste in yourself.
Try adding a document about a new topic, rebuilding the index, and asking
about it; then remove it, rebuild, and ask again to see the honest
no-coverage answer.

## Files

- `index.html` — page structure and all panels
- `styles.css` — light, responsive, professional styling (system font stack)
- `app.js` — the complete RAG pipeline in vanilla JavaScript
- `README.md` — this file
