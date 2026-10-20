"""Evaluation metrics computed from an actual run — no canned numbers.

- faithfulness: share of answer sentences whose key terms appear in the chunk they cite
- citation_coverage: share of answer sentences carrying a citation
- precision_at_k: with labelled relevant doc_ids, share of retrieved results that are relevant
- mean / top-1 similarity and retrieved count from the run itself
"""
import re
from .embeddings import tokenize
from .chunking import split_sentences
def evaluate(query, results, answer_obj, relevant_doc_ids=None):
    raw=answer_obj.get("answer","")
    # segment on sentence end followed by a capital letter, so a trailing "[n]" citation stays attached to its sentence
    sents=[x.strip() for x in re.split(r"(?<=[.!?])\s+(?=[A-Z])", raw) if x.strip()] if answer_obj.get("grounded") else []
    cited={c["marker"] for c in answer_obj.get("citations",[])}
    by_rank={i+1:r for i,r in enumerate(results)}
    faith=0; covered=0
    for s in sents:
        m=re.findall(r"\[(\d+)\]", s)
        if m: covered+=1
        if m and int(m[0]) in by_rank:
            terms=set(tokenize(re.sub(r"\[\d+\]","",s)))
            chunk_terms=set(tokenize(by_rank[int(m[0])]["text"]))
            if terms and len(terms & chunk_terms)/len(terms) >= 0.6: faith+=1
    scores=[r["score"] for r in results]
    out={"retrieved":len(results),
         "mean_similarity":round(sum(scores)/len(scores),4) if scores else 0.0,
         "top1_similarity":scores[0] if scores else 0.0,
         "faithfulness":round(faith/len(sents),4) if sents else 0.0,
         "citation_coverage":round(covered/len(sents),4) if sents else 0.0}
    if relevant_doc_ids is not None:
        rel=set(relevant_doc_ids)
        hits=sum(1 for r in results if r["doc_id"] in rel)
        out["precision_at_k"]=round(hits/len(results),4) if results else 0.0
        found={r["doc_id"] for r in results} & rel
        out["recall_at_k"]=round(len(found)/len(rel),4) if rel else 0.0
    return out
