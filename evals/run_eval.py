import json
import urllib.request
import urllib.parse
import time

def run_evaluation():
    print("Starting evaluation harness against local SSE endpoint...")
    dataset_path = "evals/dataset.jsonl"
    
    with open(dataset_path, "r") as f:
        cases = [json.loads(line) for line in f]
        
    results = []
    latencies = []
    
    for case in cases:
        q = urllib.parse.quote(case["query"])
        j = urllib.parse.quote(case["jurisdiction"])
        url = f"http://127.0.0.1:8000/chat/stream?sessionId=eval&role=tester&jurisdiction={j}&q={q}"
        
        start_time = time.time()
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                body = response.read().decode("utf-8")
        except Exception as e:
            print(f"Failed to fetch from API: {e}")
            return
            
        latency = (time.time() - start_time) * 1000
        latencies.append(latency)
        
        # Parse SSE citations
        citations = []
        for line in body.split("\\n"):
            if line.startswith("data:"):
                try:
                    data = json.loads(line[5:])
                    if "items" in data:
                        citations = [c["docId"] for c in data["items"]]
                except:
                    pass
                    
        # Check Recall@1
        expected = case["expected_docs"][0]
        hit = 1 if citations and expected in citations else 0
        results.append(hit)
        print(f"Query: '{case['query']}' -> Expected: {expected} | Retrieved: {citations[:1]} | Latency: {latency:.1f}ms")
        
    recall = sum(results) / len(results) if results else 0
    p50 = sorted(latencies)[len(latencies)//2] if latencies else 0
    
    print("\\n--- Evaluation Results ---")
    print(f"Recall@1 (Keyword Overlap): {recall * 100:.1f}%")
    print(f"P50 Latency: {p50:.1f}ms")
    print("--------------------------")
    print("Note: System currently implements token-overlap search. Dense retrieval is planned.")

if __name__ == "__main__":
    run_evaluation()
