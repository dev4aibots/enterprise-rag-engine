"use strict";

/* ============================================================
   Enterprise RAG Engine — fully client-side demo
   Pipeline: documents -> sentence-aware chunking -> TF-IDF index
   -> cosine-similarity retrieval -> extractive grounded answer
   -> evaluation computed from the actual last run.
   No network calls. No external dependencies.
   ============================================================ */

var SAMPLE_DOCS = [
  {
    id: "doc-remote-work",
    title: "Remote Work Policy 2026",
    text: [
      "Remote Work Policy 2026. This policy sets out how employees of the company may work remotely, what is expected of them, and what support the company provides. It applies to all full-time and part-time employees whose role has been approved for remote or hybrid working. The policy replaces the 2024 flexible working guidance and takes effect from 1 January 2026. Managers are responsible for applying this policy consistently across their teams and for reviewing remote working arrangements at least once every six months.",
      "Eligibility. Employees become eligible to apply for regular remote working after completing their probationary period, normally three months after their start date. Roles that require physical presence, such as laboratory, warehouse, and facilities roles, are not eligible for full remote working but may be eligible for one remote day per week where duties allow. Applications are made through the people portal and are normally decided within ten working days. Where an application is refused, the manager must give the business reason in writing, and the employee may appeal to the head of department.",
      "Core hours and availability. Remote employees must be available and responsive during core hours from 10:00 to 16:00 in their local time zone, Monday to Friday, excluding public holidays and approved leave. Outside core hours, employees may organise their working time flexibly provided they complete their contracted hours and meet agreed deadlines. Employees are expected to keep their calendar up to date, to show their working location, and to respond to direct messages within two hours during core hours. Team meetings should be scheduled inside core hours wherever participants span multiple time zones.",
      "Annual leave entitlement. Every full-time employee receives 24 days of paid annual leave per calendar year, in addition to public holidays. Part-time employees receive a pro-rata entitlement based on their contracted days. Annual leave must be requested through the people portal at least two weeks in advance for absences of three days or more, and it requires written approval from the line manager before travel is booked. Employees may carry over up to five unused days of annual leave into the next calendar year, and any carried-over days must be used by 31 March or they are lost. Employees may not carry over more than five days under any circumstances, and leave cannot be exchanged for payment except on leaving the company.",
      "Sick leave and other leave. Employees receive up to 12 days of paid sick leave per year, and a medical certificate is required for absences longer than three consecutive days. Parental leave, compassionate leave, and study leave are covered by separate policies published on the people portal. Employees who are unwell but able to work lightly may agree a temporary adjusted schedule with their manager instead of taking sick leave, provided the arrangement is recorded in writing.",
      "Equipment and expenses. The company provides each remote employee with a laptop, an external monitor, a headset, and an ergonomic chair allowance of up to 250 dollars in local equivalent during the first year of remote working. Employees receive a monthly home-working stipend of 50 dollars to contribute toward broadband and electricity costs, paid through payroll. Additional equipment, such as a standing desk, requires manager approval and a short business case. All company equipment remains company property and must be returned when employment ends or when the employee moves to a fully office-based role.",
      "Security requirements. Remote employees must work only on company-managed devices, must keep full-disk encryption and automatic updates enabled, and must use the company virtual private network when accessing internal systems. Multi-factor authentication is mandatory for all company accounts. Employees must never store customer data on personal devices, personal cloud storage, or removable media. Suspected security incidents, including lost devices and suspicious messages, must be reported to the information security team within one hour of discovery.",
      "Performance and review. Remote working is a continuing arrangement based on trust and results, not an automatic right. Managers review output, availability, and collaboration during regular one-to-one meetings. If performance concerns arise, the manager may agree an improvement plan, increase office attendance temporarily, or, as a last step, withdraw the remote working arrangement with four weeks of written notice. Employees may also end their remote arrangement voluntarily by written notice to their manager.",
      "Health, safety, and wellbeing. Employees must complete the online workstation assessment every year and must report any work-related injury or hazard promptly. The company encourages regular breaks, and meetings longer than 50 minutes should include a short pause. No employee is expected to answer messages outside their working hours except under a separately agreed on-call rota, which is paid under the on-call allowance scheme."
    ].join("\n\n")
  },
  {
    id: "doc-atlas-launch",
    title: "Product Launch Brief — Atlas",
    text: [
      "Product Launch Brief: Atlas. Atlas is our new workflow automation platform for operations teams in mid-sized companies. It connects the tools a business already uses, automates repetitive approvals, data entry, and reporting, and gives managers a live view of work in progress. This brief is the single source of truth for the launch: it records the launch date, the target customers, the pricing, the feature set for version one, the marketing plan, and the risks the launch team is managing. Any change to the launch date or pricing must be approved by the product steering group and recorded in an updated version of this brief.",
      "Launch date and timeline. Atlas will launch publicly on 15 September 2026. A closed beta with 25 design-partner customers begins on 1 June 2026, and the feature freeze for version one is 14 August 2026. The launch event will be a live online keynote on the launch date, followed by a two-week programme of webinars, partner announcements, and customer stories. General availability in the European Union and the United Kingdom follows on 29 September 2026, two weeks after the initial launch, to allow time for localisation and data-residency checks.",
      "Target customers. The primary audience is operations managers and heads of operations in companies with between 50 and 1,000 employees, particularly in logistics, healthcare administration, and professional services. These customers typically run approvals over email and spreadsheets, lose time to manual status chasing, and cannot easily prove who approved what. Atlas is not aimed at individual consumers or at very large enterprises in version one, because enterprise procurement, custom security reviews, and on-premise deployment are explicitly out of scope for the launch release.",
      "Pricing. Atlas pricing has three tiers. The Starter tier costs 29 dollars per user per month when billed annually, or 35 dollars per user per month when billed monthly, and includes up to ten active workflows. The Professional tier costs 59 dollars per user per month when billed annually and includes unlimited workflows, advanced reporting, and priority support. The Enterprise tier starts at 99 dollars per user per month, is billed annually only, and adds single sign-on, audit logs, and a dedicated customer success manager. A free 14-day trial of the Professional tier is available to every new workspace, and no credit card is required to start the trial. Non-profit organisations and registered charities receive a 30 percent discount on all tiers.",
      "Version one features. The launch release includes a drag-and-drop workflow builder, more than 120 pre-built integrations, approval chains with delegation, scheduled and event-based triggers, a real-time operations dashboard, and a full audit trail of every automated action. Every workflow can be tested in a sandbox before it goes live, and changes are versioned so a team can roll back to an earlier version in one click. Mobile applications for iOS and Android are included at launch for approvals and notifications, although workflow editing remains desktop-only in version one.",
      "Go-to-market plan. Marketing will spend the launch quarter budget of 400,000 dollars across content, partner co-marketing, webinars, and targeted advertising. The sales team will work a named list of 800 target accounts, and design partners who convert to paid plans before 31 October 2026 receive a 20 percent first-year discount. The public launch target is 1,500 paying workspaces and 250,000 dollars of new annual recurring revenue by the end of December 2026. Weekly launch reporting will track trial starts, trial-to-paid conversion, and activation, defined as a workspace running at least three live workflows.",
      "Support and readiness. Customer support will offer live chat and email support from 07:00 to 22:00 on weekdays during the first launch month, with a target first response time of under 30 minutes for Professional and Enterprise customers. A public status page, a searchable help centre with 90 launch articles, and in-product guided tours must all be live one week before the launch date. The engineering team will run a launch freeze on non-essential changes from 8 September to 22 September 2026 and will staff an incident rota throughout launch week.",
      "Risks and mitigations. The largest launch risk is integration reliability, because a failed connector damages trust quickly, so the top 30 integrations are being load-tested and monitored with automated alerts before the beta opens. The second risk is support volume exceeding capacity, mitigated by the help centre, guided tours, and a hiring plan for four additional support specialists before August. The third risk is a competitor announcing a similar product in the same window, mitigated by the design-partner stories and the launch event, which emphasise auditability and ease of adoption rather than feature count."
    ].join("\n\n")
  },
  {
    id: "doc-support-handbook",
    title: "Customer Support Handbook",
    text: [
      "Customer Support Handbook. This handbook explains how our support team helps customers, what service levels we promise, and how issues are escalated when a first response is not enough. It applies to every support specialist, team lead, and duty manager. The goal of the support organisation is simple: every customer gets a fast, accurate, and kind answer, and every recurring problem is fed back to the product and engineering teams so the same question does not need to be asked twice.",
      "Channels and hours. Customers can reach support through in-product live chat, email, and the help centre contact form. Live chat is staffed from 07:00 to 22:00 local time, Monday to Friday, and email is monitored during the same hours with reduced weekend cover from 09:00 to 17:00 on Saturdays. Emergency cover for priority one incidents operates 24 hours a day, seven days a week, through the duty manager rota. Phone support is offered only to Enterprise plan customers and is booked through their account manager.",
      "Response time targets. Our service level targets are measured monthly and published on the internal quality dashboard. For live chat, the target first response time is under 5 minutes during staffed hours. For email, the target first response time is under 4 business hours for standard customers and under 1 business hour for Professional and Enterprise customers. A first response must acknowledge the problem, state what happens next, and give a realistic time for the following update; an automated acknowledgement does not count as a first response.",
      "Severity and prioritisation. Every issue is assigned a severity. Severity one means the service is unavailable or data is at risk for many customers; the target resolution time is 4 hours and a duty manager must be informed immediately. Severity two means a major feature is broken with no workaround; the target resolution time is two business days. Severity three covers minor defects and how-to questions with a workaround available, and severity four covers documentation requests and feature suggestions. When severities compete, specialists work the highest severity first, then the oldest issue.",
      "Escalation path. If a specialist cannot resolve an issue within the target time, or the customer asks for a manager, the issue escalates first to the support team lead, then to the duty manager, and then to engineering on-call for technical defects. Every escalation must include a summary of what has been tried, the exact error messages, the affected account, and the customer impact. Specialists must never promise a fix date on behalf of engineering; they may share the current status and the next update time instead.",
      "Refunds and billing. Support specialists may approve refunds of up to 100 dollars per account without additional approval where our service has clearly failed or a duplicate charge has occurred. Refunds above 100 dollars and up to 1,000 dollars require team lead approval, and anything above 1,000 dollars requires finance approval. Annual plan customers may receive a full refund within the first 30 days of purchase. Refunds are processed to the original payment method within five business days, and the customer must always be told the amount and the expected timing in writing.",
      "Tone and quality. Write like a helpful human: short sentences, plain language, no internal jargon, and no blaming the customer or another team. Every reply should answer the question asked, explain the reason when the answer is no, and offer the best available alternative. Quality is reviewed weekly: team leads score a sample of conversations for accuracy, tone, and completeness, and the team target is an average quality score of at least 90 percent and a customer satisfaction score of at least 92 percent.",
      "Knowledge base duties. When a specialist solves a problem that is not documented, they draft a help centre article or update the existing one before closing the ticket. Articles must include the symptom the customer sees, the cause in plain language, and numbered steps for the fix. The knowledge base is reviewed every quarter, and articles that have not been viewed or have fallen below a helpfulness rating of 70 percent are rewritten or retired.",
      "Difficult conversations and safety. If a customer becomes abusive, the specialist should warn once, politely, and may end the conversation if the behaviour continues, recording the reason in the ticket. Threats of harm are reported to the duty manager immediately. Specialists never share another customer\u2019s data, internal system details, or employee personal information, and they verify identity before discussing billing or account access changes."
    ].join("\n\n")
  },
  {
    id: "doc-cloud-costs",
    title: "Cloud Infrastructure Cost Report",
    text: [
      "Cloud Infrastructure Cost Report. This report reviews what the company spent on cloud infrastructure in the last financial year, where the money went, and where the platform team believes savings can be made without harming reliability. Total cloud infrastructure spending was 1,184,000 dollars for the year, an increase of 18 percent over the previous year, while traffic grew 31 percent, so cost per request fell even as the total bill rose. The report covers our two public cloud providers and excludes software-as-a-service subscriptions, which are reported separately by finance.",
      "Cost breakdown by category. Compute was the largest category at 545,000 dollars, which is 46 percent of total cloud spending. Storage cost 213,000 dollars, or 18 percent of the total, driven mainly by growing object storage for customer uploads and backups. Databases and managed data services cost 189,000 dollars, networking and data transfer cost 118,000 dollars, and monitoring, security tooling, and other services accounted for the remaining 119,000 dollars. The single largest line item was the production application fleet, at 312,000 dollars across the year.",
      "Growth drivers. Three factors explain most of the increase. First, the launch of the analytics product doubled the size of the data processing fleet. Second, we began retaining backups for 90 days instead of 30 days after the March incident review, which increased storage costs by roughly 41,000 dollars per year. Third, staging environments were left running outside working hours for much of the year; an audit in October found that non-production systems accounted for 14 percent of compute spending, although they are only needed during development hours.",
      "Compute savings opportunities. The platform team estimates that rightsizing over-provisioned instances can save about 96,000 dollars per year, because the top 20 production instances average only 23 percent CPU utilisation. Committing to reserved capacity for the stable production fleet can save a further 122,000 dollars per year compared with on-demand pricing, based on a one-year commitment. Together, rightsizing and reserved capacity represent an estimated 218,000 dollars of annual savings on compute, with no change to application architecture. Savings are estimates, not guarantees, and will be tracked monthly against the actual bill after each change is made.",
      "Storage and database savings. Moving infrequently accessed backups and logs older than 30 days to archive storage tiers is expected to save about 38,000 dollars per year. Consolidating four under-used database clusters into two, and reducing replica counts in non-production environments, is expected to save about 29,000 dollars per year. Switching staging environments to an automatic schedule that shuts them down overnight and at weekends is expected to save about 47,000 dollars per year in compute costs and is the fastest saving to implement.",
      "Reliability guardrails. Savings must not be made by weakening reliability. Production systems keep at least two availability zones, backups remain retained for 90 days, and any rightsizing change must pass a load test and a two-week observation period before it is considered permanent. The platform team will review cost and reliability together every month, and any month where error rates or page load times worsen after a cost change will trigger a rollback review.",
      "Recommendations and targets. The report recommends three actions for the next financial year: adopt reserved capacity for the stable production fleet, complete the instance rightsizing programme by the end of the second quarter, and automate the shutdown schedule for all non-production environments. The combined target is to reduce annual cloud infrastructure spending by 15 percent at constant traffic, which is roughly 178,000 dollars, while keeping availability at or above 99.95 percent. Finance and the platform team will publish a short monthly update comparing actual spending against this target.",
      "Risks and open questions. Committing to reserved capacity reduces flexibility if traffic falls or the architecture changes, so the commitment should cover no more than 70 percent of the current stable fleet. Data transfer costs rose faster than expected late in the year and need a dedicated review, because cross-region traffic from the new analytics product may change the networking forecast. Finally, cost allocation tags are missing on about 9 percent of resources, which limits how precisely spending can be assigned to product teams; fixing tagging is a prerequisite for team-level budgets next year."
    ].join("\n\n")
  }
];

var STOPWORDS = {};
("a,an,the,and,or,of,to,in,on,for,with,by,at,from,as,is,are,was,were,be,been,being,am,do,does,did,have,has,had,will,would,can,could,should,may,might,must,shall,it,its,this,that,these,those,i,you,he,she,we,they,my,your,his,her,our,their,me,him,us,them,what,when,where,who,whom,which,how,why,if,then,than,so,such,into,about,over,under,per,each,any,all,not,no,yes,also,more,most,other,into,onto,about,between,through,during,before,after,up,down,out,off,again,once,here,there,now,just,only,very,too,get,gets,got,make,makes,made,use,used,using").split(",").forEach(function (w) { STOPWORDS[w] = true; });

var state = {
  documents: [],
  chunks: [],          // {id, docId, docTitle, indexInDoc, text, charCount, vector, norm}
  vocabulary: {},      // term -> index not needed; we keep idf map
  idf: {},             // term -> idf weight
  vocabSize: 0,
  indexBuilt: false,
  lastRetrieval: null, // {query, results:[{chunk, score}], latencyMs, topK}
  lastAnswer: null     // {sentences:[{text, rank, chunkId}], noCoverage:boolean}
};

function $(id) { return document.getElementById(id); }

function cloneSampleDocs() {
  return SAMPLE_DOCS.map(function (d) { return { id: d.id, title: d.title, text: d.text }; });
}

function wordCount(text) {
  var m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

function tokenize(text) {
  var raw = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  return raw.filter(function (t) { return t.length > 1 && !STOPWORDS[t]; });
}

function splitSentences(text) {
  var parts = text.replace(/\s+/g, " ").match(/[^.!?]+(?:[.!?]+|$)/g) || [];
  return parts.map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
}

/* ---------------- Documents ---------------- */

function renderDocuments() {
  var list = $("doc-list");
  list.innerHTML = "";
  state.documents.forEach(function (doc) {
    var li = document.createElement("li");
    li.className = "doc-item";
    var info = document.createElement("div");
    var title = document.createElement("strong");
    title.textContent = doc.title;
    var meta = document.createElement("span");
    meta.className = "doc-meta";
    meta.textContent = wordCount(doc.text) + " words · " + doc.text.length + " characters";
    info.appendChild(title);
    info.appendChild(meta);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "remove-doc-btn";
    btn.textContent = "Remove";
    btn.setAttribute("aria-label", "Remove document " + doc.title);
    btn.addEventListener("click", function () { removeDocument(doc.id); });
    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  });
  if (state.documents.length === 0) {
    var empty = document.createElement("li");
    empty.className = "doc-item";
    empty.textContent = "No documents. Add one below or load the sample set.";
    list.appendChild(empty);
  }
  setStep("step-documents", state.documents.length > 0);
}

function invalidateIndex(reason) {
  state.chunks = [];
  state.idf = {};
  state.vocabSize = 0;
  state.indexBuilt = false;
  state.lastRetrieval = null;
  state.lastAnswer = null;
  $("chunk-list").innerHTML = "";
  $("index-stats").innerHTML = "<span>" + reason + "</span>";
  $("retrieval-results").innerHTML = "<p class=\"empty-state\">No retrieval run yet. Build the index, then run a query.</p>";
  $("retrieval-error").textContent = "";
  $("answer-output").innerHTML = "<p class=\"empty-state\">No answer yet. Run retrieval first, then generate a grounded answer.</p>";
  $("answer-error").textContent = "";
  renderEvaluationPlaceholder();
  setStep("step-chunks", false);
  setStep("step-index", false);
  setStep("step-retrieval", false);
  setStep("step-answer", false);
  setStep("step-evaluation", false);
}

function removeDocument(id) {
  state.documents = state.documents.filter(function (d) { return d.id !== id; });
  renderDocuments();
  invalidateIndex("Documents changed. Click Build index to rebuild the index from the current documents.");
}

function addDocument() {
  var title = $("custom-doc-title").value.trim();
  var text = $("custom-doc-text").value.trim();
  var err = $("doc-form-error");
  if (!title) { err.textContent = "Please give the document a title."; return; }
  if (!text) { err.textContent = "Please paste some document text — an empty document cannot be indexed."; return; }
  if (wordCount(text) < 10) { err.textContent = "That document is very short (under 10 words). Paste a fuller document so chunking and retrieval have something to work with."; return; }
  err.textContent = "";
  state.documents.push({ id: "doc-custom-" + Date.now(), title: title, text: text });
  $("custom-doc-title").value = "";
  $("custom-doc-text").value = "";
  renderDocuments();
  invalidateIndex("Document added. Click Build index to rebuild the index including the new document.");
}

function resetDocuments() {
  state.documents = cloneSampleDocs();
  $("doc-form-error").textContent = "";
  renderDocuments();
  invalidateIndex("Sample set restored (" + state.documents.length + " documents). Click Build index to chunk and index them.");
}

/* ---------------- Chunking + TF-IDF index ---------------- */

function chunkText(text, chunkSize, overlap) {
  var sentences = splitSentences(text);
  var chunks = [];
  var current = "";
  function pushCurrent() { if (current.trim()) { chunks.push(current.trim()); } }
  sentences.forEach(function (rawSentence) {
    var sentence = rawSentence.trim();
    if (!sentence) { return; }
    if (sentence.length > chunkSize) {
      pushCurrent(); current = "";
      var start = 0;
      while (start < sentence.length) {
        var end = Math.min(start + chunkSize, sentence.length);
        chunks.push(sentence.slice(start, end).trim());
        if (end >= sentence.length) { break; }
        start = Math.max(end - overlap, start + 1);
      }
      return;
    }
    var candidate = current ? current + " " + sentence : sentence;
    if (candidate.length <= chunkSize) {
      current = candidate;
    } else {
      pushCurrent();
      if (overlap > 0 && chunks.length > 0) {
        var prev = chunks[chunks.length - 1];
        var seed = prev.slice(-overlap);
        var sp = seed.indexOf(" ");
        if (sp > 0) { seed = seed.slice(sp + 1); }
        current = seed ? seed + " " + sentence : sentence;
        if (current.length > chunkSize) { current = sentence; }
      } else {
        current = sentence;
      }
    }
  });
  pushCurrent();
  return chunks;
}

function buildIndex() {
  var chunkSize = parseInt($("chunk-size").value, 10);
  var overlap = parseInt($("overlap").value, 10);
  if (overlap >= chunkSize) { overlap = Math.max(0, chunkSize - 10); }
  state.chunks = [];
  var globalIdx = 0;
  state.documents.forEach(function (doc) {
    var pieces = chunkText(doc.text, chunkSize, overlap);
    pieces.forEach(function (piece, i) {
      globalIdx += 1;
      state.chunks.push({
        id: "chunk-" + globalIdx,
        docId: doc.id,
        docTitle: doc.title,
        indexInDoc: i + 1,
        text: piece,
        charCount: piece.length,
        vector: null,
        norm: 0
      });
    });
  });

  // TF-IDF: document frequency across chunks, then per-chunk vectors.
  var df = {};
  var perChunkCounts = state.chunks.map(function (chunk) {
    var counts = {};
    tokenize(chunk.text).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    Object.keys(counts).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
    return counts;
  });
  var n = state.chunks.length;
  state.idf = {};
  state.vocabulary = df;
  Object.keys(df).forEach(function (t) {
    state.idf[t] = Math.log((n + 1) / (df[t] + 1)) + 1;
  });
  state.vocabSize = Object.keys(df).length;
  state.chunks.forEach(function (chunk, i) {
    var vec = {};
    var normSq = 0;
    Object.keys(perChunkCounts[i]).forEach(function (t) {
      var w = perChunkCounts[i][t] * state.idf[t];
      vec[t] = w;
      normSq += w * w;
    });
    chunk.vector = vec;
    chunk.norm = Math.sqrt(normSq);
  });

  state.indexBuilt = state.chunks.length > 0;
  state.lastRetrieval = null;
  state.lastAnswer = null;
  renderChunks();
  renderIndexStats();
  $("retrieval-results").innerHTML = "<p class=\"empty-state\">Index built. Run a query to retrieve ranked chunks.</p>";
  $("answer-output").innerHTML = "<p class=\"empty-state\">No answer yet. Run retrieval first, then generate a grounded answer.</p>";
  renderEvaluationPlaceholder();
  setStep("step-chunks", state.indexBuilt);
  setStep("step-index", state.indexBuilt);
  setStep("step-retrieval", false);
  setStep("step-answer", false);
  setStep("step-evaluation", false);
}

function renderIndexStats() {
  var el = $("index-stats");
  if (!state.indexBuilt) {
    el.innerHTML = "<span>No index yet. Click <strong>Build index</strong> to chunk the current documents.</span>";
    return;
  }
  el.innerHTML = "";
  var strong = function (label, value) {
    var span = document.createElement("span");
    span.innerHTML = "";
    var b = document.createElement("strong");
    b.textContent = value;
    span.appendChild(document.createTextNode(label + ": "));
    span.appendChild(b);
    span.appendChild(document.createTextNode("  ·  "));
    return span;
  };
  el.appendChild(strong("Documents", String(state.documents.length)));
  el.appendChild(strong("Chunks", String(state.chunks.length)));
  el.appendChild(strong("Vocabulary size", String(state.vocabSize)));
  var note = document.createElement("span");
  note.textContent = "TF-IDF vectors computed for every chunk.";
  el.appendChild(note);
}

function renderChunks() {
  var wrap = $("chunk-list");
  wrap.innerHTML = "";
  state.chunks.forEach(function (chunk) {
    var card = document.createElement("div");
    card.className = "chunk-card";
    card.id = "chunk-card-" + chunk.id;
    var head = document.createElement("div");
    head.className = "chunk-head";
    head.textContent = chunk.docTitle + " · Chunk #" + chunk.indexInDoc + " · " + chunk.charCount + " chars";
    var body = document.createElement("div");
    body.className = "chunk-text";
    body.textContent = chunk.text.slice(0, 90) + (chunk.text.length > 90 ? "…" : "");
    card.appendChild(head);
    card.appendChild(body);
    wrap.appendChild(card);
  });
}

function highlightChunk(chunkId) {
  var cards = document.querySelectorAll(".chunk-card.highlighted, .result-card.highlighted");
  cards.forEach(function (c) { c.classList.remove("highlighted"); });
  var el = $("chunk-card-" + chunkId);
  if (el) {
    el.classList.add("highlighted");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  var res = $("result-card-" + chunkId);
  if (res) { res.classList.add("highlighted"); }
}

/* ---------------- Retrieval ---------------- */

function vectorizeQuery(query) {
  var counts = {};
  tokenize(query).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
  var vec = {};
  var normSq = 0;
  Object.keys(counts).forEach(function (t) {
    if (state.idf[t]) {
      var w = counts[t] * state.idf[t];
      vec[t] = w;
      normSq += w * w;
    }
  });
  return { vector: vec, norm: Math.sqrt(normSq) };
}

function cosine(q, chunk) {
  if (!q.norm || !chunk.norm) { return 0; }
  var dot = 0;
  Object.keys(q.vector).forEach(function (t) {
    if (chunk.vector[t]) { dot += q.vector[t] * chunk.vector[t]; }
  });
  return dot / (q.norm * chunk.norm);
}

function runRetrieval() {
  var err = $("retrieval-error");
  var query = $("query-input").value.trim();
  if (!state.indexBuilt) { err.textContent = "Build the index first (panel 2), then run retrieval."; return; }
  if (!query) { err.textContent = "Enter a query, or pick one of the sample questions above."; return; }
  err.textContent = "";
  var topK = parseInt($("topk-select").value, 10) || 5;
  var q = vectorizeQuery(query);
  var started = performance.now();
  var scored = state.chunks.map(function (chunk) {
    return { chunk: chunk, score: cosine(q, chunk) };
  });
  scored.sort(function (a, b) { return b.score - a.score; });
  var results = scored.slice(0, Math.min(topK, scored.length));
  var latency = performance.now() - started;
  state.lastRetrieval = { query: query, results: results, latencyMs: latency, topK: topK };
  state.lastAnswer = null;
  $("answer-output").innerHTML = "<p class=\"empty-state\">Retrieval updated. Click Generate grounded answer to compose an answer from these chunks.</p>";
  renderRetrievalResults();
  renderEvaluation();
  setStep("step-retrieval", true);
  setStep("step-answer", false);
}

function renderRetrievalResults() {
  var wrap = $("retrieval-results");
  wrap.innerHTML = "";
  if (!state.lastRetrieval) {
    wrap.innerHTML = "<p class=\"empty-state\">No retrieval run yet. Build the index, then run a query.</p>";
    return;
  }
  state.lastRetrieval.results.forEach(function (r, i) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "result-card";
    card.id = "result-card-" + r.chunk.id;
    var head = document.createElement("div");
    head.className = "result-head";
    var left = document.createElement("span");
    left.textContent = "#" + (i + 1) + " · " + r.chunk.docTitle + " · Chunk #" + r.chunk.indexInDoc;
    var score = document.createElement("span");
    score.className = "score";
    score.textContent = "Score " + r.score.toFixed(3);
    head.appendChild(left);
    head.appendChild(score);
    var bar = document.createElement("div");
    bar.className = "score-bar";
    var fill = document.createElement("div");
    fill.className = "score-fill";
    fill.style.width = Math.max(0, Math.min(100, r.score * 100)).toFixed(1) + "%";
    bar.appendChild(fill);
    var text = document.createElement("p");
    text.className = "result-text";
    text.textContent = r.chunk.text.slice(0, 220) + (r.chunk.text.length > 220 ? "…" : "");
    card.appendChild(head);
    card.appendChild(bar);
    card.appendChild(text);
    card.addEventListener("click", function () { highlightChunk(r.chunk.id); });
    wrap.appendChild(card);
  });
}

/* ---------------- Grounded answer ---------------- */

function generateAnswer() {
  var err = $("answer-error");
  if (!state.lastRetrieval) { err.textContent = "Run retrieval first (panel 3) — the answer is built only from retrieved chunks."; return; }
  err.textContent = "";
  var results = state.lastRetrieval.results;
  var out = $("answer-output");
  var topScore = results.length ? results[0].score : 0;

  if (!results.length || topScore < 0.03) {
    state.lastAnswer = { sentences: [], noCoverage: true };
    out.innerHTML = "";
    var p = document.createElement("p");
    p.textContent = "The current corpus does not cover this question. The highest retrieval score was " + topScore.toFixed(3) + ", which is effectively no match, so no grounded answer can be composed from the indexed documents. Try rephrasing the question using words from the documents, or add a document that covers the topic.";
    out.appendChild(p);
    renderEvaluation();
    setStep("step-answer", true);
    setStep("step-evaluation", true);
    return;
  }

  var queryTerms = {};
  tokenize(state.lastRetrieval.query).forEach(function (t) { queryTerms[t] = true; });
  var queryTermCount = Object.keys(queryTerms).length || 1;

  var candidates = [];
  results.forEach(function (r, rankIdx) {
    if (r.score < 0.03) { return; }
    splitSentences(r.chunk.text).forEach(function (sentence) {
      if (sentence.length < 40) { return; }
      var terms = tokenize(sentence);
      var hits = 0;
      var seen = {};
      terms.forEach(function (t) { if (queryTerms[t] && !seen[t]) { seen[t] = true; hits += 1; } });
      // A sentence only counts as evidence if it shares at least two distinct
      // query terms (or the only term, for a one-term query). This stops a
      // single incidental word — e.g. "best" in an unrelated document — from
      // producing a spurious "answer" to an off-topic question.
      var minHits = queryTermCount >= 2 ? 2 : 1;
      if (hits < minHits) { return; }
      var sentenceScore = (hits / queryTermCount) + r.score;
      candidates.push({ text: sentence, rank: rankIdx + 1, chunkId: r.chunk.id, chunkScore: r.score, score: sentenceScore });
    });
  });
  candidates.sort(function (a, b) { return b.score - a.score; });

  var chosen = [];
  var usedTexts = {};
  candidates.forEach(function (c) {
    if (chosen.length >= 4) { return; }
    var key = c.text.toLowerCase().slice(0, 80);
    if (usedTexts[key]) { return; }
    usedTexts[key] = true;
    chosen.push(c);
  });
  chosen.sort(function (a, b) { return a.rank - b.rank; });

  if (!chosen.length) {
    state.lastAnswer = { sentences: [], noCoverage: true };
    out.innerHTML = "";
    var p2 = document.createElement("p");
    p2.textContent = "The retrieved chunks are only weakly related to this question and contain no sentence that directly addresses it, so no grounded answer can be composed. Try rephrasing the question using words from the documents.";
    out.appendChild(p2);
    renderEvaluation();
    setStep("step-answer", true);
    setStep("step-evaluation", true);
    return;
  }

  state.lastAnswer = { sentences: chosen, noCoverage: false };
  out.innerHTML = "";
  var para = document.createElement("p");
  chosen.forEach(function (s, idx) {
    para.appendChild(document.createTextNode(s.text + " "));
    var cite = document.createElement("button");
    cite.type = "button";
    cite.className = "citation";
    cite.textContent = "[" + s.rank + "]";
    cite.setAttribute("aria-label", "Highlight source chunk for citation " + s.rank);
    cite.addEventListener("click", function () { highlightChunk(s.chunkId); });
    para.appendChild(cite);
    if (idx < chosen.length - 1) { para.appendChild(document.createTextNode(" ")); }
  });
  out.appendChild(para);
  var note = document.createElement("p");
  note.className = "doc-meta";
  note.textContent = "Composed extractively from the retrieved chunks above. Numbers in brackets refer to the ranked retrieval results; click one to see its source chunk.";
  out.appendChild(note);
  renderEvaluation();
  setStep("step-answer", true);
  setStep("step-evaluation", true);
}

/* ---------------- Evaluation ---------------- */

function renderEvaluationPlaceholder() {
  var wrap = $("eval-tiles");
  wrap.innerHTML = "";
  var tile = document.createElement("div");
  tile.className = "eval-tile";
  var v = document.createElement("span");
  v.className = "eval-value";
  v.textContent = "—";
  var l = document.createElement("span");
  l.className = "eval-label";
  l.textContent = "Run a query to populate";
  tile.appendChild(v);
  tile.appendChild(l);
  wrap.appendChild(tile);
}

function evalTile(value, label) {
  var tile = document.createElement("div");
  tile.className = "eval-tile";
  var v = document.createElement("span");
  v.className = "eval-value";
  v.textContent = value;
  var l = document.createElement("span");
  l.className = "eval-label";
  l.textContent = label;
  tile.appendChild(v);
  tile.appendChild(l);
  return tile;
}

function computeFaithfulness() {
  if (!state.lastAnswer || state.lastAnswer.noCoverage || !state.lastAnswer.sentences.length) { return null; }
  var chunkById = {};
  state.chunks.forEach(function (c) { chunkById[c.id] = c; });
  var faithful = 0;
  state.lastAnswer.sentences.forEach(function (s) {
    var chunk = chunkById[s.chunkId];
    if (!chunk) { return; }
    var chunkTerms = {};
    tokenize(chunk.text).forEach(function (t) { chunkTerms[t] = true; });
    var keyTerms = tokenize(s.text);
    if (!keyTerms.length) { return; }
    var present = 0;
    keyTerms.forEach(function (t) { if (chunkTerms[t]) { present += 1; } });
    if (present / keyTerms.length >= 0.5) { faithful += 1; }
  });
  return faithful / state.lastAnswer.sentences.length;
}

function computeCitationCoverage() {
  if (!state.lastAnswer || state.lastAnswer.noCoverage || !state.lastAnswer.sentences.length) { return null; }
  var cited = state.lastAnswer.sentences.filter(function (s) { return !!s.rank; }).length;
  return cited / state.lastAnswer.sentences.length;
}

function renderEvaluation() {
  if (!state.lastRetrieval) { renderEvaluationPlaceholder(); return; }
  var wrap = $("eval-tiles");
  wrap.innerHTML = "";
  var results = state.lastRetrieval.results;
  var scores = results.map(function (r) { return r.score; });
  var mean = scores.length ? scores.reduce(function (a, b) { return a + b; }, 0) / scores.length : 0;
  var top1 = scores.length ? scores[0] : 0;
  var faith = computeFaithfulness();
  var coverage = computeCitationCoverage();
  wrap.appendChild(evalTile(String(results.length), "Retrieved chunks (top-k run)"));
  wrap.appendChild(evalTile(mean.toFixed(3), "Mean similarity of retrieved chunks"));
  wrap.appendChild(evalTile(top1.toFixed(3), "Top-1 similarity"));
  wrap.appendChild(evalTile(faith === null ? "n/a" : Math.round(faith * 100) + "%", faith === null ? "Answer faithfulness — generate an answer first" : "Answer faithfulness (sentences grounded in cited chunk)"));
  wrap.appendChild(evalTile(coverage === null ? "n/a" : Math.round(coverage * 100) + "%", coverage === null ? "Citation coverage — generate an answer first" : "Citation coverage (answer sentences with a citation)"));
  wrap.appendChild(evalTile(state.lastRetrieval.latencyMs.toFixed(1) + " ms", "Retrieval latency (measured, performance.now)"));
}

/* ---------------- Pipeline strip ---------------- */

function setStep(id, active) {
  var el = $(id);
  if (el) { el.classList.toggle("active", !!active); }
}

/* ---------------- Wiring ---------------- */

function init() {
  state.documents = cloneSampleDocs();
  renderDocuments();
  renderEvaluationPlaceholder();

  $("chunk-size").addEventListener("input", function () { $("chunk-size-val").textContent = $("chunk-size").value; });
  $("overlap").addEventListener("input", function () { $("overlap-val").textContent = $("overlap").value; });
  $("add-doc-btn").addEventListener("click", addDocument);
  $("reset-docs-btn").addEventListener("click", resetDocuments);
  $("build-index-btn").addEventListener("click", buildIndex);
  $("run-retrieval-btn").addEventListener("click", runRetrieval);
  $("generate-answer-btn").addEventListener("click", generateAnswer);
  $("query-input").addEventListener("keydown", function (ev) { if (ev.key === "Enter") { runRetrieval(); } });

  var chips = document.querySelectorAll(".preset-chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      $("query-input").value = chip.getAttribute("data-question") || "";
      $("query-input").focus();
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
