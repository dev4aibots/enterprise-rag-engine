"""TF-IDF embeddings (standard library only).

Deterministic, dependency-free vectorisation: each chunk becomes a sparse
TF-IDF vector over the corpus vocabulary. Cosine similarity over these
vectors is the retrieval score. This keeps the service runnable anywhere
with zero model downloads; the VectorStore interface is deliberately small
so a dense embedding model can be dropped in behind the same API.
"""
import math, re
from collections import Counter
TOKEN = re.compile(r"[a-z0-9]+")
STOPWORDS={"what","is","the","a","an","for","of","how","does","do","are","was","were","in","on","at","to","and","or","it","this","that","with","can","you","your","be","by","as","from","has","have","had","not","but","they","their","them","then","than","so","if","when","which","who","whom","into","about","over","under","between"}
def tokenize(text: str): return [t for t in TOKEN.findall(text.lower()) if t not in STOPWORDS]
class TfidfEmbedder:
    def __init__(self): self.vocab={}; self.idf={}
    def fit(self, docs):
        df=Counter()
        for d in docs:
            for t in set(tokenize(d)): df[t]+=1
        n=max(len(docs),1)
        self.vocab={t:i for i,t in enumerate(sorted(df))}
        self.idf={t: math.log((1+n)/(1+c))+1.0 for t,c in df.items()}
        return self
    def transform(self, text):
        counts=Counter(tokenize(text)); vec={}
        for t,c in counts.items():
            if t in self.vocab: vec[self.vocab[t]]=(1+math.log(c))*self.idf[t]
        norm=math.sqrt(sum(v*v for v in vec.values())) or 1.0
        return {k:v/norm for k,v in vec.items()}
    @staticmethod
    def cosine(a,b):
        if len(a)>len(b): a,b=b,a
        return sum(v*b.get(k,0.0) for k,v in a.items())
