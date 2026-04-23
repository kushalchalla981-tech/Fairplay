import pandas as pd
import numpy as np
np.random.seed(42)

print("Creating datasets...")

# ============================================
# 1. HIRING DATA
# ============================================
n = 300
genders = ['Male']*150 + ['Female']*100 + ['Other']*50
np.random.shuffle(genders)
hiring_data = {
    'candidate_id': [f'CAND_{i:04d}' for i in range(1, n+1)],
    'gender': genders,
    'age_group': np.random.choice(['18-25', '26-35', '36-45', '46-55'], n),
    'education': np.random.choice(['High School', 'Bachelor', 'Master', 'PhD'], n, p=[0.2, 0.4, 0.3, 0.1]),
    'experience_years': np.random.randint(0, 20, n),
    'ethnicity': np.random.choice(['White', 'Black', 'Hispanic', 'Asian', 'Other'], n, p=[0.4, 0.2, 0.15, 0.15, 0.1]),
}
hired = []
for i in range(n):
    prob = 0.7
    if hiring_data['gender'][i] == 'Female':
        prob -= 0.25
    if hiring_data['ethnicity'][i] == 'Black':
        prob -= 0.20
    if hiring_data['ethnicity'][i] == 'Hispanic':
        prob -= 0.15
    if hiring_data['age_group'][i] == '46-55':
        prob -= 0.15
    hired.append(1 if np.random.random() < prob else 0)
hiring_data['hired'] = hired
df_hiring = pd.DataFrame(hiring_data)
df_hiring.to_csv('data/sample_datasets/hiring_data.csv', index=False)
m_rate = df_hiring[df_hiring['gender']=='Male']['hired'].mean()
f_rate = df_hiring[df_hiring['gender']=='Female']['hired'].mean()
print(f"1. Hiring: {len(df_hiring)} rows, Male: {m_rate:.0%}, Female: {f_rate:.0%}")

# ============================================
# 2. LOAN APPROVAL
# ============================================
n = 400
loan_data = {
    'application_id': [f'LOAN_{i:05d}' for i in range(1, n+1)],
    'gender': np.random.choice(['Male', 'Female'], n, p=[0.6, 0.4]),
    'age': np.random.randint(21, 65, n),
    'ethnicity': np.random.choice(['White', 'Black', 'Hispanic', 'Asian', 'Other'], n, p=[0.35, 0.2, 0.2, 0.15, 0.1]),
    'zip_code': np.random.choice(['10001', '10002', '10003', '48213', '48214', '90210', '90211'], n),
    'annual_income': np.random.randint(30000, 150000, n),
    'credit_score': np.random.randint(500, 850, n),
    'loan_amount': np.random.randint(5000, 50000, n),
}
approved = []
for i in range(n):
    prob = 0.75
    if loan_data['ethnicity'][i] == 'Black':
        prob -= 0.30
    if loan_data['ethnicity'][i] == 'Hispanic':
        prob -= 0.25
    if loan_data['zip_code'][i] == '48213':
        prob -= 0.20
    if loan_data['gender'][i] == 'Female':
        prob -= 0.10
    if loan_data['credit_score'][i] < 650:
        prob -= 0.15
    approved.append(1 if np.random.random() < prob else 0)
loan_data['approved'] = approved
df_loan = pd.DataFrame(loan_data)
df_loan.to_csv('data/sample_datasets/loan_approval.csv', index=False)
w_rate = df_loan[df_loan['ethnicity']=='White']['approved'].mean()
b_rate = df_loan[df_loan['ethnicity']=='Black']['approved'].mean()
print(f"2. Loan: {len(df_loan)} rows, White: {w_rate:.0%}, Black: {b_rate:.0%}")

# ============================================
# 3. UNIVERSITY ADMISSIONS
# ============================================
n = 350
admit_data = {
    'application_id': [f'APP_{i:05d}' for i in range(1, n+1)],
    'gender': np.random.choice(['Male', 'Female'], n, p=[0.5, 0.5]),
    'sat_score': np.random.randint(1000, 1600, n),
    'gpa': np.round(np.random.uniform(2.5, 4.0, n), 2),
    'school_type': np.random.choice(['Public', 'Private', 'Charter', 'Home'], n, p=[0.4, 0.25, 0.2, 0.15]),
    'region': np.random.choice(['Northeast', 'Southeast', 'Midwest', 'West', 'South'], n),
    'first_generation': np.random.choice([0, 1], n, p=[0.6, 0.4]),
    'race': np.random.choice(['White', 'Black', 'Hispanic', 'Asian', 'Other'], n, p=[0.35, 0.15, 0.2, 0.2, 0.1]),
}
admitted = []
for i in range(n):
    prob = 0.6
    if admit_data['sat_score'][i] > 1400:
        prob += 0.15
    if admit_data['gpa'][i] > 3.5:
        prob += 0.10
    if admit_data['race'][i] == 'Black':
        prob -= 0.25
    if admit_data['race'][i] == 'Hispanic':
        prob -= 0.20
    if admit_data['school_type'][i] == 'Home':
        prob += 0.10
    if admit_data['first_generation'][i] == 1:
        prob -= 0.10
    admitted.append(1 if np.random.random() < prob else 0)
admit_data['admitted'] = admitted
df_admit = pd.DataFrame(admit_data)
df_admit.to_csv('data/sample_datasets/university_admit.csv', index=False)
w_rate = df_admit[df_admit['race']=='White']['admitted'].mean()
b_rate = df_admit[df_admit['race']=='Black']['admitted'].mean()
print(f"3. University: {len(df_admit)} rows, White: {w_rate:.0%}, Black: {b_rate:.0%}")

# ============================================
# 4. INSURANCE PREMIUM
# ============================================
n = 300
insure_data = {
    'policy_id': [f'POL_{i:05d}' for i in range(1, n+1)],
    'gender': np.random.choice(['Male', 'Female'], n, p=[0.55, 0.45]),
    'age': np.random.randint(18, 70, n),
    'driving_experience': np.random.randint(0, 40, n),
    'zip_code': np.random.choice(['10001', '10002', '90001', '90002', '60001', '60002'], n),
    'car_type': np.random.choice(['Sedan', 'SUV', 'Sports', 'Truck'], n, p=[0.4, 0.3, 0.15, 0.15]),
    'ethnicity': np.random.choice(['White', 'Black', 'Hispanic', 'Asian', 'Other'], n, p=[0.4, 0.2, 0.15, 0.15, 0.1]),
}
premium_risk = []
for i in range(n):
    base = 500
    if insure_data['gender'][i] == 'Male':
        base += 150
    if insure_data['age'][i] < 25:
        base += 200
    if insure_data['ethnicity'][i] == 'Black':
        base += 180
    if insure_data['ethnicity'][i] == 'Hispanic':
        base += 150
    if insure_data['zip_code'][i] in ['90001', '90002']:
        base += 100
    if insure_data['car_type'][i] == 'Sports':
        base += 300
    premium_risk.append(base)
insure_data['premium_amount'] = premium_risk
insure_data['high_risk'] = [1 if p > 800 else 0 for p in premium_risk]
df_insure = pd.DataFrame(insure_data)
df_insure.to_csv('data/sample_datasets/insurance_premium.csv', index=False)
m_rate = df_insure[df_insure['gender']=='Male']['high_risk'].mean()
f_rate = df_insure[df_insure['gender']=='Female']['high_risk'].mean()
print(f"4. Insurance: {len(df_insure)} rows, Male high-risk: {m_rate:.0%}, Female high-risk: {f_rate:.0%}")

# ============================================
# 5. CRIMINAL RECIDIVISM
# ============================================
n = 400
crime_data = {
    'case_id': [f'CASE_{i:05d}' for i in range(1, n+1)],
    'race': np.random.choice(['White', 'Black', 'Hispanic', 'Other'], n, p=[0.35, 0.35, 0.2, 0.1]),
    'age': np.random.randint(18, 55, n),
    'gender': np.random.choice(['Male', 'Female'], n, p=[0.8, 0.2]),
    'prior_convictions': np.random.randint(0, 10, n),
    'prior_arrests': np.random.randint(0, 15, n),
    'age_at_first_offense': np.random.randint(12, 30, n),
    'employment': np.random.choice([0, 1], n, p=[0.4, 0.6]),
    'education_level': np.random.randint(6, 12, n),
    'married': np.random.choice([0, 1], n, p=[0.7, 0.3]),
}
risk_score = []
for i in range(n):
    base = 0.5
    if crime_data['prior_convictions'][i] > 3:
        base += 0.15
    if crime_data['prior_arrests'][i] > 5:
        base += 0.10
    if crime_data['employment'][i] == 0:
        base += 0.10
    if crime_data['age'][i] < 25:
        base += 0.10
    # COMPAS-style BIAS (ProPublica finding)
    if crime_data['race'][i] == 'Black':
        base += 0.20
    if crime_data['race'][i] == 'Hispanic':
        base += 0.10
    risk_score.append(min(1.0, max(0.0, base)))
crime_data['risk_score'] = risk_score

actual_recidivism = []
for i in range(n):
    prob = 0.3
    if crime_data['prior_convictions'][i] > 5:
        prob += 0.20
    if crime_data['prior_convictions'][i] > 2:
        prob += 0.10
    actual_recidivism.append(1 if np.random.random() < prob else 0)
crime_data['actual_recidivism'] = actual_recidivism

df_crime = pd.DataFrame(crime_data)
df_crime.to_csv('data/sample_datasets/criminal_recidivism.csv', index=False)
w_score = df_crime[df_crime['race']=='White']['risk_score'].mean()
b_score = df_crime[df_crime['race']=='Black']['risk_score'].mean()
w_act = df_crime[df_crime['race']=='White']['actual_recidivism'].mean()
b_act = df_crime[df_crime['race']=='Black']['actual_recidivism'].mean()
print(f"5. Criminal: {len(df_crime)} rows, White risk: {w_score:.2f}, Black risk: {b_score:.2f}")
print(f"   Actual: White: {w_act:.0%}, Black: {b_act:.0%}")

print("\nDONE - All 5 datasets created!")