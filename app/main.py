"""Enterprise RAG Engine — FastAPI service.

Pipeline: ingest -> chunk -> TF-IDF embed -> cosine vector search ->
extractive grounded answer with citations -> evaluation of the actual run.
Run: uvicorn app.main:app --reload   (docs at /docs)
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from .store import VectorStore
from .generation import grounded_answer
from .evaluation import evaluate
app = FastAPI(title="Enterprise RAG Engine", version="1.0.0",
              description="Production-oriented RAG service with evaluation.")
STORE = VectorStore()
class IngestRequest(BaseModel):
    doc_id: str; title: str; text: str = Field(min_length=20)
    chunk_size: int = 600; overlap: int = 80
class QueryRequest(BaseModel):
    query: str = Field(min_length=3); top_k: int = 5
class EvaluateRequest(QueryRequest):
    relevant_doc_ids: list[str] | None = None
@app.get("/health")
def health(): return {"status":"ok", **STORE.stats()}
@app.post("/ingest")
def ingest(req: IngestRequest):
    if req.doc_id in STORE.docs: raise HTTPException(409, "doc_id already ingested; use a new id")
    n=STORE.add_document(req.doc_id, req.title, req.text, req.chunk_size, req.overlap)
    return {"doc_id":req.doc_id,"chunks_created":n, **STORE.stats()}
@app.post("/query")
def query(req: QueryRequest):
    results=STORE.search(req.query, req.top_k)
    ans=grounded_answer(req.query, results)
    return {"query":req.query,"results":results,"answer":ans["answer"],
            "citations":ans["citations"],"grounded":ans["grounded"]}
@app.post("/evaluate")
def run_evaluation(req: EvaluateRequest):
    results=STORE.search(req.query, req.top_k)
    ans=grounded_answer(req.query, results)
    return {"query":req.query,"metrics":evaluate(req.query, results, ans, req.relevant_doc_ids),
            "answer":ans["answer"],"citations":ans["citations"]}
