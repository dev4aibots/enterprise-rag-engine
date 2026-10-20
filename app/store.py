from dataclasses import dataclass, field
from .chunking import chunk_text
from .embeddings import TfidfEmbedder
@dataclass
class Chunk:
    doc_id: str; title: str; index: int; text: str
@dataclass
class VectorStore:
    chunks: list = field(default_factory=list)
    embedder: TfidfEmbedder = field(default_factory=TfidfEmbedder)
    vectors: list = field(default_factory=list)
    docs: dict = field(default_factory=dict)
    def add_document(self, doc_id, title, text, chunk_size=600, overlap=80):
        pieces=chunk_text(text, chunk_size, overlap)
        self.docs[doc_id]={"title":title,"chunks":len(pieces)}
        for i,p in enumerate(pieces): self.chunks.append(Chunk(doc_id,title,i,p))
        self._rebuild(); return len(pieces)
    def _rebuild(self):
        self.embedder.fit([c.text for c in self.chunks])
        self.vectors=[self.embedder.transform(c.text) for c in self.chunks]
    def search(self, query, top_k=5):
        qv=self.embedder.transform(query); scored=[]
        for c,v in zip(self.chunks,self.vectors):
            s=TfidfEmbedder.cosine(qv,v)
            if s>0: scored.append((s,c))
        scored.sort(key=lambda x:-x[0])
        return [{"score":round(s,4),"doc_id":c.doc_id,"title":c.title,"chunk_index":c.index,"text":c.text} for s,c in scored[:top_k]]
    def stats(self): return {"documents":len(self.docs),"chunks":len(self.chunks),"vocabulary":len(self.embedder.vocab)}
