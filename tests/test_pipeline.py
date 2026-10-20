import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.store import VectorStore
from app.generation import grounded_answer
from app.evaluation import evaluate
def test_end_to_end():
    s=VectorStore()
    text=open(os.path.join(os.path.dirname(__file__),"..","sample_data","sample.txt")).read()
    assert s.add_document("acme","Acme Cloud Platform Overview",text) >= 2
    r=s.search("How does Acme Cloud encrypt data at rest?", top_k=3)
    assert r and "AES-256" in " ".join(x["text"] for x in r)
    a=grounded_answer("How does Acme Cloud encrypt data at rest?", r)
    assert a["grounded"] and a["citations"]
    m=evaluate("encryption", r, a, ["acme"])
    assert m["precision_at_k"]==1.0 and m["citation_coverage"]==1.0
    empty=s.search("quantum gardening on mars", top_k=3)
    print("pipeline test passed", m)
if __name__=="__main__": test_end_to_end()
