# Fairplay ⚖️

An AI Fairness Auditing Dashboard for detecting and mitigating bias in ML datasets.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI
- **Analysis:** pandas, scikit-learn, fairlearn, aif360

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Setup

```bash
# Install Python dependencies
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install
```

### Run

```bash
./start.sh
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Features

- Upload CSV datasets for fairness analysis
- Compute fairness metrics (four-fifths rule, disparate impact, etc.)
- Visualize bias across demographic groups
- Apply bias mitigation strategies
- Generate compliance reports
