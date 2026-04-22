# AI Fairness Auditing Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/Streamlit-1.28+-red.svg" alt="Streamlit">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

A production-grade AI Fairness Auditing Dashboard for detecting, visualizing, and mitigating bias in machine learning datasets and model outputs. Built for compliance officers and non-technical stakeholders.

## Features

- **Data Ingestion** - Upload CSV files with automatic detection of sensitive attributes and target columns
- **Fairness Metrics** - Calculate Demographic Parity Ratio (Four-Fifths Rule) and Demographic Parity Difference
- **Interactive Visualization** - Plotly bar charts with 0.8 threshold line
- **Bias Detection** - PASS/FAIL compliance cards with risk levels
- **Bias Mitigation** - Apply reweighting algorithm to reduce bias
- **Before/After Comparison** - Side-by-side metrics comparison
- **Export** - Download reweighted datasets and HTML compliance reports

## Regulatory Compliance

- EU AI Act (High-Risk Systems)
- India DPDPA (Non-Discrimination)
- US EEOC Four-Fifths Rule (80% threshold)

## Tech Stack

- **Frontend**: Streamlit + Plotly
- **Backend**: Python 3.10+
- **Core Libraries**: pandas, numpy, fairlearn, aif360, scikit-learn

## Installation

```bash
# Clone the repository
git clone https://github.com/kushalchalla981-tech/Fairplay.git
cd Fairplay

# Install dependencies
pip install -r requirements.txt

# Run the application
streamlit run app.py
```

## Usage

1. **Upload Dataset** - Click "Choose a CSV file" to upload your data
2. **Select Columns** - Choose the sensitive attribute (e.g., gender) and target column (e.g., approved)
3. **Run Analysis** - Click "Run Fairness Analysis" to calculate metrics
4. **View Results** - See PASS/FAIL status, charts, and detailed metrics
5. **Apply Mitigation** - If bias is detected, apply reweighing algorithm
6. **Export** - Download the reweighted dataset and compliance report

## Project Structure

```
fairness-dashboard/
├── app.py                      # Main Streamlit application
├── requirements.txt            # Python dependencies
├── utils/
│   ├── data_loader.py         # CSV upload and column detection
│   ├── metrics.py             # Fairness metric calculations
│   ├── visualization.py       # Plotly chart generators
│   ├── mitigation.py          # Reweighting algorithm
│   └── report_generator.py    # PDF/HTML report generation
└── data/
    └── sample_datasets/       # Sample data for testing
        ├── balanced_sample.csv
        └── unbalanced_sample.csv
```

## Demo

The dashboard includes sample datasets:
- `balanced_sample.csv` - Dataset that passes Four-Fifths Rule (DPR ≈ 0.96)
- `unbalanced_sample.csv` - Dataset that fails Four-Fifths Rule (DPR = 0.31)

## Understanding the Metrics

### Demographic Parity Ratio (Disparate Impact)
- **Formula**: Minority group positive rate / Majority group positive rate
- **Four-Fifths Rule**: Pass if ratio ≥ 0.8 (80%)
- **Risk Levels**:
  - Low: ≥ 0.8 (Compliant)
  - Medium: 0.65 - 0.8
  - High: < 0.65

### Demographic Parity Difference
- **Formula**: Minority positive rate - Majority positive rate
- **Threshold**: ±10% (0.1)

## Screenshots

| Component | Description |
|-----------|-------------|
| Upload Section | Drag & drop CSV files |
| Results Card | PASS/FAIL with color coding |
| Bar Chart | Group comparison with threshold line |
| Comparison | Before/after metrics side-by-side |

## License

MIT License - See LICENSE file for details

## Contributors

- Built for the Cepheus 2.0 2026 Hackathon

## Acknowledgments

- [Fairlearn](https://fairlearn.org/) - Fairness metrics
- [AIF360](https://aif360.readthedocs.io/) - Bias mitigation algorithms
- [Streamlit](https://streamlit.io/) - Web framework