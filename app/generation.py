"""Extractive grounded answering: sentences are selected ONLY from retrieved
chunks, ranked by query-term overlap and retrieval score, and every sentence
carries a citation to its source chunk. If retrieval is empty the service
says so plainly instead of inventing an answer."""
import re
from .embeddings import tokenize
STOPWORDS={"what","is","the","a","an","for","of","how","does","do","are","was","were","best","in","on","at","to","and","or","it","this","that","with","can","you","your"}
from .chunking import split_sentences
def grounded_answer(query, results, max_sentences=3):
    if not results:
        return {"answer":"The indexed documents do not cover this question.","citations":[],"grounded":False}
    qterms=set(tokenize(query))-STOPWORDS; sents=[]
    for rank,r in enumerate(results, start=1):
        for s in split_sentences(r["text"]):
            overlap=len(qterms & (set(tokenize(s))-STOPWORDS))
            if overlap: sents.append((overlap, r["score"], rank, s, r))
    sents.sort(key=lambda x:(-x[0],-x[1]))
    chosen=sents[:max_sentences]; parts=[]; cites=[]
    for _,_,rank,s,r in chosen:
        parts.append(f"{s} [{rank}]")
        cites.append({"marker":rank,"doc_id":r["doc_id"],"title":r["title"],"chunk_index":r["chunk_index"],"score":r["score"]})
    if not parts:
        return {"answer":"The indexed documents do not cover this question.","citations":[],"grounded":False}
    return {"answer":" ".join(parts),"citations":cites,"grounded":True}
