# Kuaishou (Beijing Dajia Internet Information Technology Co., Ltd.)

**Recommendation Algorithm Intern - [E-commerce] (AI Search Strategy)** | August 2026 - November 2026

**TL;DR:** Focused on evaluation and algorithmic optimization for Kuaishou's E-commerce AI Search. Established an end-to-end badcase attribution system identifying intent recognition and planning bottlenecks; constructed 210K model-spec samples and executed two-stage model training (430M pre-train + 3M fine-tune) with hierarchical intent outputs; redesigned the Planning Agent taxonomy to 7 classes, fine-tuned Qwen3-0.6B with 205K SFT samples, and automated GPT-4o active learning badcase loops, achieving +1.619% in e-commerce intent queries and +2.616% in product intent queries.

## 🎯 Objectives
Conduct comprehensive benchmark evaluation and algorithmic tuning across Kuaishou's AI Search pipeline. Mitigate core production bottlenecks including omitted product models, misclassified aggregation keywords ("all-in-one", "top recommendations"), and query drifting caused by over-rewriting highly constrained queries, thereby boosting search relevancy, click-through, and conversion rates.

## 💻 Tech Stack
Qwen3.8-27B, Qwen3-0.6B (SFT), GPT-4o, BERT, Intent Recognition, NER, Planning Agent, RAG Knowledge Base, Active Learning, A/B Testing, Python

## 🛠️ Core Contributions

### 1. Competitive Benchmarking & Full-Pipeline Badcase Attribution
* **Multi-Dimensional Benchmark Metrics:** Defined standardized evaluation criteria across query understanding, merchandise supply, summary generation, recommendation copy, follow-up quality, latency, and downstream user behaviors based on 500 daily inspection badcases.
* **First-Error Attribution System:** Established a full-pipeline attribution methodology covering "Intent Recognition → Query Rewriting → Multi-Source Recall → Filtering & Verification → Summary Generation → Transition & Conversion", pinpointing Intent Recognition and Planning as the primary performance bottlenecks.

### 2. Intent Recognition & NER Model Fine-Tuning (Core Focus)
* **Production Problem Diagnosis:** Identified two critical issues: 1) Omission of product model/spec entities, removing crucial constraints from downstream retrieval and rewriting; 2) Misclassification of aggregation phrases (e.g., "collection of XX", "XX recommendations") into weak commercial or lifestyle intent, causing volatile recall.
* **Data Engineering at Scale:** Mined and verified 210,000 product model entities via NER and Qwen3.8-27B cross-verification. Manually labeled 100,000 samples (including 6,000 hard samples cross-validated across human annotators, BERT, and GPT), and corrected 370,000 aggregation keyword labels.
* **Two-Stage Training Strategy:**
  * **Step 1 (Boundary Learning):** Trained on 430M large-scale queries to generalize broad intent boundaries.
  * **Step 2 (Refinement):** Fine-tuned on ~3M highly accurate, clean samples for precise boundary calibration.
* **Hierarchical Intent & RAG Integration:** Upgraded model output from binary classification to a rich hierarchical schema (Primary Intent + Fine-Grained Task + Comprehensive NER), shared across downstream rewriting, filtering, and summary modules. Integrated multi-turn dialogue context and RAG knowledge bases to drastically enhance navigational queries for brands and live streamers.

### 3. Planning Agent Redesign & Pipeline Decoupling (Core Focus)
* **Taxonomy Expansion & Direct-Recall Routing:** Expanded the Planning Agent classification from 6 to 7 categories by introducing a "High Constraint" tag. Highly specific queries containing brand, model, and detailed specifications bypass over-aggressive rewriting directly to multi-source recall, eliminating query drift and empty recall.
* **SFT Model Training:** Re-annotated 181K historical training samples and integrated 50K online real queries to create a curated dataset of 205,383 samples, completing Supervised Fine-Tuning (SFT) on Qwen3-0.6B.
* **Automated Badcase Active Learning Loop:** Sampled 430 query rewriting badcases and re-labeled them using GPT-4o to build a 5K+ hard-sample pool; established a daily automated badcase extraction and feedback loop for continuous iterations.
* **Decoupled Summary Generation:** Restructured 6,406 summary training instances, shifting from end-to-end generation to a staged pipeline generating summary, recommendation copy, and follow-up prompts separately, mitigating parsing errors and off-topic follow-ups.

## 🏆 Key Results & Quantified Impact

### 1. Offline Performance Improvements
* **Metrics:** Intent recognition Precision jumped from 0.8802 to 0.8880 (**+0.78pp**) while keeping Recall steady at 0.9109.
* **Targeted Badcase Resolution:** Resolved 10 out of 14 key specialized badcase categories (**71% resolution rate**), largely eliminating aggregation query misclassification.

### 2. Online A/B Testing Gains (Two Iterations)
* **Iteration 1:** E-commerce intent search frequency increased by **+1.354%**.
* **Iteration 2:**
  * E-commerce intent search frequency expanded to **+1.619%**;
  * Product intent search volume surged by **+2.616%**;
  * Live-stream showcase card impressions with e-commerce intent grew by **+0.422%**;
  * Live-stream showcase card impressions with product intent grew by **+0.600%**;
  * Overall e-commerce result impressions grew by **+0.288%**;
  * Successfully submitted to GSB evaluation with excellent feedback.
