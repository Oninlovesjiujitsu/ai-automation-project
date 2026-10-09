# Autonomous Support & Escalation Engine

## 1. Overview
An enterprise-grade, multi-layered customer service automation system. It intercepts customer support tickets, uses an intelligent agent to draft context-aware responses based on internal policies, and programmatically evaluates those drafts for hallucinations and tone. Safe responses are sent automatically; risky responses are escalated to human agents via Slack.

## 2. System Workflow

The architecture is highly decoupled, ensuring immediate UI feedback while maintaining robust, asynchronous backend validation.

```mermaid
graph TD
    A[Customer Form] -->|Server-Sent Events| B(FastAPI Backend)
    
    subgraph Real-Time Streaming (FastAPI)
        B -->|1. RAG| C[Retrieve Policies]
        C -->|2. Drafter| D[Generate Response]
        D -->|3. Yield Tokens| E[Next.js UI Stream]
        D -->|4. Gatekeeper| F[DeepEval Validation]
    end
    
    F -->|Decision Check| G{Pass/Fail or Angry?}
    G -->|Fail or Angry| H[n8n Escalation Webhook]
    H --> I[Slack Alert to Human]
    G -->|Pass & Calm| J[Auto-Resolved / Email]
```

*   **1. Frontend Stream:** A user submits a ticket via the Next.js UI, which opens a real-time SSE (Server-Sent Events) connection to the FastAPI backend.
*   **2. AI Processing (Real-Time):** The backend retrieves company policies via RAG, drafts a personalized response, and streams tokens directly back to the UI for a zero-latency typing experience.
*   **3. Safety Evaluation:** Immediately after the draft finishes, a secondary Gatekeeper LLM acts as an auditor, scoring the draft for hallucinations and strict policy compliance.
*   **4. Orchestration & Escalation:** The backend dynamically checks the evaluation score and the customer sentiment. If the draft fails safety checks or the customer is angry, it triggers an asynchronous n8n webhook to escalate the ticket directly to human agents via a Slack alert.

## 3. Tech Stack
*   **Orchestration:** [n8n](https://n8n.io/) (Handles webhook ingestion, conditional routing, and API communication)
*   **AI Framework:** [LangChain](https://www.langchain.com/) (Manages the Agent logic, tool calling, and RAG pipeline)
*   **Support Agent (Drafter):** Groq `openai/gpt-oss-20b` (Provides extreme speed and high daily request limits for basic logic and drafting)
*   **Evaluator (Gatekeeper):** Groq `openai/gpt-oss-20b` via [DeepEval](https://confident-ai.com/) (Provides complex reasoning as a strict LLM-as-a-judge for QA, keeping costs at $0.00)
*   **Vector Database (Embeddings):** Google `text-embedding-004` (Fast, free semantic search replacing OpenAI embeddings)
*   **Frontend Showcase:** Next.js (Interactive Split-Screen Demo UI)
*   **Human-in-the-Loop (HITL):** Slack / CRM (For manual review of escalated tickets)

## 4. System Architecture

1.  **Ingestion:** The Next.js frontend proxy intercepts support tickets and connects to the FastAPI backend.
2.  **Streaming & Drafting:** 
    *   LangChain Agent converts the query to a vector.
    *   Searches the Vector Database for relevant company policies.
    *   `openai/gpt-oss-20b` drafts a response and streams tokens directly to the client via Server-Sent Events (SSE).
3.  **Evaluation:** DeepEval immediately scores the drafted response against the retrieved context to check for Hallucinations and Answer Relevancy.
4.  **Routing (The Switch):** The FastAPI backend autonomously decides the next step based on the evaluation and sentiment.
    *   *Path A (Pass):* If Score >= 0.85 & Sentiment is safe -> Resolves automatically.
    *   *Path B (Fail/Escalate):* If Score < 0.85 or Sentiment is angry -> FastAPI triggers an n8n webhook, posting the draft and original ticket to a Slack channel for human approval.

## 5. Interactive Split-Screen Demo
To showcase this complex backend orchestration, the project includes an interactive Next.js web application designed for recruiters and clients:

*   **Panel 1 (Customer View):** A mock ticket submission form acting as the trigger for the n8n webhook.
*   **Panel 2 (Admin/Under-the-Hood View):** A real-time terminal UI that visualizes the hidden agentic workflow:
    *   Visualizes the LangChain Agent searching the vector DB.
    *   Displays the Drafted Response.
    *   Features a **DeepEval Scorecard** that flashes pass/fail based on hallucination checks.
    *   Shows the final routing decision (Auto-Reply vs. Slack Escalation).

## 6. Key Value Propositions
*   **Risk Mitigation:** Incorporating DeepEval as a live gatekeeper solves the primary enterprise fear of AI hallucinations.
*   **Human-in-the-Loop:** Demonstrates maturity by not fully automating edge cases, relying on elegant escalation paths instead.
*   **Cost-Efficient AI Engineering:** Showcases advanced AI engineering by using a hybrid **Groq + Gemini API** architecture. We use Llama 3.1 8B (via Groq) for rapid drafting, Llama 3.3 70B for strict evaluation, and Gemini for embeddings, providing state-of-the-art reasoning at exactly $0.00 while avoiding serverless memory limits.
*   **Full-Stack Execution:** Merges highly technical backend AI orchestration with a beautiful, client-facing React frontend.

## 7. Project Structure

This project uses a [Turborepo](https://turbo.build/) monorepo to orchestrate the Next.js frontend, Python FastAPI backend, and n8n Docker container concurrently.

```text
autonomous-support_escalation-engine/
├── apps/
│   ├── frontend/             # Next.js Application (Interactive Demo)
│   ├── backend/              # Python FastAPI (LangChain & DeepEval logic)
│   └── n8n/                  # Orchestration (Docker compose & workflows)
├── packages/                 # Shared configurations
├── turbo.json                # Turborepo pipeline configuration
└── package.json              # Root workspace definition
```
