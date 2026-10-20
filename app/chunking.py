"""Sentence/paragraph-aware chunking with configurable size and overlap."""
import re
def split_sentences(text: str):
    parts = re.split(r'(?<=[.!?])\s+', text.strip())
    return [p.strip() for p in parts if p.strip()]
def chunk_text(text: str, chunk_size: int = 600, overlap: int = 80):
    if chunk_size <= 0: raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size: raise ValueError("overlap must be in [0, chunk_size)")
    chunks, cur = [], ""
    for para in [p.strip() for p in text.split("\n\n") if p.strip()]:
        for sent in split_sentences(para):
            cand = (cur + " " + sent).strip() if cur else sent
            if len(cand) <= chunk_size:
                cur = cand
            else:
                if cur: chunks.append(cur)
                while len(sent) > chunk_size:
                    chunks.append(sent[:chunk_size]); sent = sent[chunk_size-overlap:] if overlap else sent[chunk_size:]
                cur = sent
        if cur and len(cur) >= chunk_size * 0.9:
            chunks.append(cur); cur = ""
    if cur: chunks.append(cur)
    if overlap and len(chunks) > 1:
        out=[chunks[0]]
        for c in chunks[1:]:
            prev=out[-1]; out.append((prev[-overlap:] + " " + c).strip() if len(c)+overlap<=chunk_size*1.5 else c)
        return out
    return chunks
