import pytest
import os
import time
from streamlit.testing.v1 import AppTest

DATASETS = [
    ("data/sample_datasets/hiring_data.csv", "gender", "hired"),
    ("data/sample_datasets/loan_approval.csv", "ethnicity", "approved"),
    ("data/sample_datasets/university_admit.csv", "race", "admitted"),
    ("data/sample_datasets/insurance_premium.csv", "ethnicity", "high_risk"),
    ("data/sample_datasets/criminal_recidivism.csv", "race", "actual_recidivism")
]

@pytest.mark.parametrize("csv_file, sensitive_col, target_col", DATASETS)
@pytest.mark.parametrize("run_idx", range(4))
def test_dataset_performance(csv_file, sensitive_col, target_col, run_idx):
    assert os.path.exists(csv_file)

    start_time = time.time()

    # Init AppTest
    at = AppTest.from_file("app.py", default_timeout=30).run()

    # Upload CSV
    with open(csv_file, "rb") as f:
        file_bytes = f.read()
    file_name = os.path.basename(csv_file)

    at.file_uploader[0].set_value([(file_name, file_bytes, "text/csv")])
    at.run()

    assert "File loaded" in at.success[0].value

    # Select columns
    at.selectbox(key="sensitive_select").set_value(sensitive_col)
    at.selectbox(key="target_select").set_value(target_col)

    # Run analysis
    # Find button by label
    run_btn = None
    for btn in at.button:
        if "Run Fairness Analysis" in btn.label:
            run_btn = btn
            break

    assert run_btn is not None
    run_btn.click().run()

    # Verify analysis ran successfully
    assert "Demographic Parity Ratio" in [md.value for md in at.markdown] or any("Demographic Parity Ratio" in md.value for md in at.markdown)

    # Apply mitigation if button exists
    mitigation_checkbox = None
    for cb in at.checkbox:
        if "Apply automatic bias mitigation" in cb.label:
            mitigation_checkbox = cb
            break

    if mitigation_checkbox:
        mitigation_checkbox.set_value(True).run()

        reweigh_btn = None
        for btn in at.button:
            if "Apply Reweighing" in btn.label:
                reweigh_btn = btn
                break

        if reweigh_btn:
            reweigh_btn.click().run()
            assert any("Mitigation complete!" in s.value for s in at.success)
            assert any("Before vs After Comparison" in md.value for md in at.markdown)

    end_time = time.time()
    print(f"[{file_name}] Run {run_idx}: {(end_time - start_time):.2f}s")
