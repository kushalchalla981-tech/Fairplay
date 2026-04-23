<div align="center">
  <h1>⚖️ Fairplay Dashboard</h1>
  <p><b>Detect. Measure. Correct. — AI Bias Ends Here.</b></p>
  <p>The World's First Open Source AI Bias Auditing Engine.</p>
</div>

---

## 🚀 Quick Start

Fairplay is divided into two separate architectures: a highly responsive **React/Vite Frontend** and a powerful **FastAPI Backend**. To run the application locally, you'll need to start both servers.

### 1. Start the Backend

The backend powers the heavy data analytics, fairness metrics calculation, and bias mitigation algorithms.

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# 3. Install the dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn main:app --reload --port 8000
```
*The API will be available at `http://localhost:8000`*

### 2. Start the Frontend

The frontend provides the beautiful, interactive dashboard built with React, Vite, and TailwindCSS.

Open a **new terminal tab/window**, then:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
*The UI will be accessible at `http://localhost:5173`*

---

### 🌟 Features

- **Bias Auditing**: Upload your datasets and automatically calculate the Demographic Parity Ratio and Demographic Parity Difference.
- **Visual Analytics**: Interactive Plotly and Recharts charts comparing protected groups.
- **Automated Mitigation**: Reweight the data to automatically neutralize biased outcomes without throwing away records.
- **Compliance Reporting**: Instantly export a formatted HTML audit report passing global AI compliance benchmarks.

### 🛠️ Tech Stack

**Frontend:** React 19, Vite, TailwindCSS, Framer Motion  
**Backend:** FastAPI, Pandas, Plotly, Scikit-Learn
