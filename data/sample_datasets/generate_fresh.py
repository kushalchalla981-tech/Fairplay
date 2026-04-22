import pandas as pd
import numpy as np
import os
from datetime import datetime

np.random.seed(datetime.now().microsecond % 1000)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'sample_datasets')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_hiring():
    """Hiring & Recruitment with bias"""
    n = np.random.randint(250, 400)
    data = {
        'candidate_id': [f'H{str(i).zfill(5)}' for i in range(1, n+1)],
        'gender': np.random.choice(['Male', 'Female', 'Other'], n, p=[0.45, 0.45, 0.10]),
        'age': np.random.randint(22, 55),
        'education': np.random.choice(['High School', 'Bachelor', 'Master', 'PhD'], n, p=[0.15, 0.45, 0.30, 0.10]),
        'years_experience': np.random.randint(0, 25),
        'ethnicity': np.random.choice(['White', 'Black', 'Hispanic', 'Asian', 'Other'], n, p=[0.38, 0.18, 0.18, 0.16, 0.10]),
        'region': np.random.choice(['Northeast', 'Southeast', 'Midwest', 'South', 'West']),
        'interview_score': np.random.randint(50, 100),
    }
    
    hired = []
    for i in range(n):
        prob = 0.55
        if data['gender'][i] == 'Female':
            prob -= np.random.uniform(0.15, 0.30)
        if data['ethnicity'][i] in ['Black', 'Hispanic']:
            prob -= np.random.uniform(0.10, 0.25)
        if data['age'] < 25:
            prob -= np.random.uniform(0.05, 0.15)
        if data['interview_score'][i] > 85:
            prob += 0.15
        hired.append(1 if np.random.random() < prob else 0)
    
    data['hired'] = hired
    df = pd.DataFrame(data)
    return df

def generate_loan():
    """Loan & Credit Approval with bias"""
    n = np.random.randint(300, 500)
    data = {
        'loan_id': [f'L{str(i).zfill(5)}' for i in range(1, n+1)],
        'gender': np.random.choice(['Male', 'Female'], n, p=[0.55, 0.45]),
        'age': np.random.randint(21, 70),
        'annual_income': np.random.randint(25000, 200000),
        'credit_score': np.random.randint(500, 850),
        'employment_years': np.random.randint(0, 30),
        'ethnicity': np.random.choice(['White', 'Black', 'Hispanic', 'Asian', 'Other'], n, p=[0.35, 0.20, 0.20, 0.15, 0.10]),
        'zip_code': np.random.choice(['10001', '10002', '20001', '20002', '30001', '30002', '90001', '90002']),
        'loan_purpose': np.random.choice(['home_improvement', 'debt_consolidation', 'business', 'education'], p=[0.35, 0.30, 0.20, 0.15]),
        'debt_to_income': np.round(np.random.uniform(0.1, 0.5), 2),
    }
    
    approved = []
    for i in range(n):
        prob = 0.70
        if data['ethnicity'][i] in ['Black', 'Hispanic']:
            prob -= np.random.uniform(0.20, 0.35)
        if data['credit_score'][i] < 650:
            prob -= 0.20
        if data['credit_score'][i] > 750:
            prob += 0.15
        if data['debt_to_income'][i] > 0.40:
            prob -= 0.15
        approved.append(1 if np.random.random() < prob else 0)
    
    data['approved'] = approved
    df = pd.DataFrame(data)
    return df

def generate_university():
    """University Admissions with bias"""
    n = np.random.randint(300, 450)
    data = {
        'app_id': [f'A{str(i).zfill(5)}' for i in range(1, n+1)],
        'gender': np.random.choice(['Male', 'Female'], n, p=[0.48, 0.52]),
        'sat_score': np.random.randint(900, 1600),
        'gpa': np.round(np.random.uniform(2.5, 4.0), 2),
        'essay_score': np.random.randint(1, 10),
        'ethnicity': np.random.choice(['White', 'Black', 'Hispanic', 'Asian', 'Other'], n, p=[0.32, 0.15, 0.20, 0.23, 0.10]),
        'school_type': np.random.choice(['Public', 'Private', 'Charter', 'Homeschool'], p=[0.40, 0.25, 0.20, 0.15]),
        'first_gen': np.random.choice([0, 1], p=[0.55, 0.45]),
        'legacy': np.random.choice([0, 1], p=[0.80, 0.20]),
    }
    
    admitted = []
    for i in range(n):
        prob = 0.55
        if data['ethnicity'][i] in ['Black', 'Hispanic']:
            prob -= np.random.uniform(0.18, 0.30)
        if data['sat_score'][i] > 1450:
            prob += 0.20
        if data['sat_score'][i] < 1050:
            prob -= 0.15
        if data['gpa'][i] > 3.7:
            prob += 0.15
        if data['essay_score'][i] > 8:
            prob += 0.10
        if data['legacy'][i] == 1:
            prob += 0.12
        admitted.append(1 if np.random.random() < prob else 0)
    
    data['admitted'] = admitted
    df = pd.DataFrame(data)
    return df

def generate_insurance():
    """Insurance Premium with bias"""
    n = np.random.randint(250, 400)
    data = {
        'policy_id': [f'P{str(i).zfill(5)}' for i in range(1, n+1)],
        'gender': np.random.choice(['Male', 'Female'], n, p=[0.52, 0.48]),
        'age': np.random.randint(18, 75),
        'driving_record': np.random.choice(['clean', 'minor_violation', 'major_violation'], p=[0.60, 0.28, 0.12]),
        'car_type': np.random.choice(['Sedan', 'SUV', 'Sports', 'Truck', 'Compact'], p=[0.35, 0.28, 0.12, 0.15, 0.10]),
        'zip_code': np.random.choice(['10001', '10002', '90001', '90002', '60001', '60002', '50001', '50002']),
        'ethnicity': np.random.choice(['White', 'Black', 'Hispanic', 'Asian', 'Other'], n, p=[0.38, 0.18, 0.18, 0.16, 0.10]),
        'credit_score': np.random.randint(500, 850),
    }
    
    premium = []
    for i in range(n):
        base = np.random.uniform(400, 600)
        if data['gender'][i] == 'Male':
            base += np.random.uniform(80, 180)
        if data['age'] < 25:
            base += np.random.uniform(150, 250)
        if data['ethnicity'][i] in ['Black', 'Hispanic']:
            base += np.random.uniform(100, 200)
        if data['driving_record'][i] == 'major_violation':
            base += np.random.uniform(200, 400)
        if data['car_type'][i] == 'Sports':
            base += np.random.uniform(250, 450)
        premium.append(int(base))
    
    data['premium'] = premium
    data['high_risk'] = [1 if p > 800 else 0 for p in premium]
    df = pd.DataFrame(data)
    return df

def generate_criminal():
    """Criminal Justice (COMPAS-style) with bias"""
    n = np.random.randint(350, 500)
    data = {
        'case_id': [f'C{str(i).zfill(5)}' for i in range(1, n+1)],
        'race': np.random.choice(['White', 'Black', 'Hispanic', 'Other'], p=[0.33, 0.33, 0.22, 0.12]),
        'age': np.random.randint(18, 60),
        'gender': np.random.choice(['Male', 'Female'], p=[0.78, 0.22]),
        'prior_felony_count': np.random.randint(0, 8),
        'prior_misdemeanor_count': np.random.randint(0, 12),
        'age_at_first_arrest': np.random.randint(10, 35),
        'employed': np.random.choice([0, 1], p=[0.35, 0.65]),
        'education_years': np.random.randint(6, 14),
    }
    
    risk_score = []
    for i in range(n):
        base = np.random.uniform(0.35, 0.55)
        
        if data['prior_felony_count'][i] > 2:
            base += np.random.uniform(0.10, 0.20)
        if data['prior_misdemeanor_count'][i] > 4:
            base += np.random.uniform(0.05, 0.12)
        if data['employed'][i] == 0:
            base += np.random.uniform(0.08, 0.15)
        if data['age'][i] < 25:
            base += np.random.uniform(0.05, 0.12)
        if data['education_years'][i] < 10:
            base += np.random.uniform(0.03, 0.08)
        
        # PROPUBLICA-STYLE BIAS
        if data['race'][i] in ['Black']:
            base += np.random.uniform(0.15, 0.28)
        if data['race'][i] == 'Hispanic':
            base += np.random.uniform(0.05, 0.12)
        
        risk_score.append(round(min(0.98, max(0.02, base)), 2))
    
    data['risk_score'] = risk_score
    
    actual_recid = []
    for i in range(n):
        prob = 0.25
        if data['prior_felony_count'][i] > 3:
            prob += 0.18
        if data['prior_misdemeanor_count'][i] > 4:
            prob += 0.10
        if data['employed'][i] == 0:
            prob += 0.08
        actual_recid.append(1 if np.random.random() < prob else 0)
    
    data['actual_recidivism'] = actual_recid
    df = pd.DataFrame(data)
    return df

def main():
    print("Generating fresh datasets...")
    
    datasets = {
        'hiring_fresh.csv': generate_hiring,
        'loan_fresh.csv': generate_loan,
        'university_fresh.csv': generate_university,
        'insurance_fresh.csv': generate_insurance,
        'criminal_fresh.csv': generate_criminal,
    }
    
    for filename, generator in datasets.items():
        df = generator()
        filepath = os.path.join(OUTPUT_DIR, filename)
        df.to_csv(filepath, index=False)
        
        print(f"{filename}: {len(df)} rows")
    
    print("\nFresh datasets created in data/sample_datasets/")

if __name__ == '__main__':
    main()