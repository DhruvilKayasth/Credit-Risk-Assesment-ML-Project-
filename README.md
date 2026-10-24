# LoanLens — Credit Risk Assessment System

A Machine Learning-based web application that estimates the probability of loan default using customer financial information and credit history.

Website link : https://credit-risk-assesment-ml-project-1.onrender.com/

## 📌 Project Overview

LoanLens is a Credit Risk Assessment System designed to help evaluate the risk associated with lending money to a borrower. It analyzes applicant details such as age, annual income, employment length, home ownership, loan amount, interest rate, loan grade, and credit history.

The trained Machine Learning model predicts the probability of loan default and classifies the applicant into a **Low Risk** or **High Risk** category based on a selected decision threshold.

The application provides an interactive web interface where users can enter applicant information and view the prediction results.

## 🎯 Objectives

- Predict the probability of loan default using Machine Learning.
- Analyze financial and credit-related applicant features.
- Classify loan applications into low-risk and high-risk categories.
- Deploy the trained model through a REST API.
- Display prediction results through a user-friendly web interface.

## ✨ Features

- **Loan Default Prediction:** Estimates the probability of a borrower defaulting on a loan.
- **Risk Classification:** Classifies applicants as Low Risk or High Risk using a decision threshold.
- **Interactive Dashboard:** Displays the estimated default probability and risk category.
- **REST API Integration:** Connects the frontend to the ML model using FastAPI.
- **Input Validation:** Validates submitted applicant information before prediction.

## 🛠️ Technologies Used

- Python
- Pandas and NumPy
- Scikit-learn
- FastAPI
- Uvicorn
- HTML
- CSS
- JavaScript
- Joblib

## 📊 Input Features

The model uses 11 applicant features:

| Feature | Description |
|---|---|
| `person_age` | Applicant's age |
| `person_income` | Applicant's annual income |
| `person_home_ownership` | Home ownership status |
| `person_emp_length` | Length of employment |
| `loan_intent` | Purpose of the loan |
| `loan_grade` | Loan grade |
| `loan_amnt` | Loan amount requested |
| `loan_int_rate` | Loan interest rate |
| `loan_percent_income` | Loan amount as a proportion of annual income |
| `cb_person_default_on_file` | Historical default indicator |
| `cb_person_cred_hist_length` | Length of credit history |

## ⚙️ How It Works

1. The user enters the applicant's financial and credit information.
2. The frontend sends the information to the FastAPI `/predict` endpoint in JSON format.
3. The backend validates the input and prepares it for the trained model.
4. The Machine Learning model estimates the probability of loan default.
5. The probability is compared with the configured decision threshold.
6. The application displays the estimated probability and the corresponding risk category.

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd "Credit Risk ML Project"
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Install dependencies

```bash
pip install fastapi uvicorn pandas numpy scikit-learn joblib
```

Install any additional dependencies required by your project.

### 3. Start the application

```bash
uvicorn main:app --reload
```

### 4. Open the application

- **Web Interface:** http://127.0.0.1:8000/
- **API Documentation:** http://127.0.0.1:8000/docs

Make sure your saved model files and required frontend files are available in their expected locations.

## 🔮 Example Output

The application displays:

- Estimated probability of loan default
- Configured decision threshold
- Risk classification: Low Risk or High Risk

For example, if the estimated default probability is 95.2% and the decision threshold is 52.4%, the application classifies the applicant as High Risk.

*This is an illustrative example. Actual results depend on the submitted applicant details and the trained model.*

## 📁 Project Structure

```text
Credit Risk ML Project/
├── main.py
├── static/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── ml_model.pkl
├── best_threshold.pkl
└── README.md
```

The filenames shown for the saved model files are examples; adjust the structure to match your actual repository.

## 🎓 Learning Outcomes

This project demonstrates the practical application of:

- Machine Learning model training and prediction
- Data preprocessing and feature handling
- Probability-based risk assessment
- Model serialization and loading
- Frontend and backend integration

## ⚠️ Disclaimer

This project is intended for educational and demonstration purposes. Its predictions are estimates, not guarantees of future borrower behavior. The risk classification should not be treated as an automatic loan approval or rejection decision.

## 👨‍💻 Author

**Dhruvil Kayasth**

IT Student | Machine Learning and Data Science Enthusiast
