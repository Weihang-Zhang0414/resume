# 2025 Mathematical Contest in Modeling (MCM) - Problem C (Olympic Medal Prediction)

**Core Team Member** | 2025

**TL;DR:** Built a multi-dimensional prediction and evaluation framework for predicting the 2028 Los Angeles Olympics medal table by integrating time-series analysis, machine learning, and causal inference.

## 🎯 Project Objectives

Predict the medal counts of various nations at the 2028 Los Angeles Olympics based on historical summer Olympic medal datasets, athlete profiles, and event distributions. Additionally, quantitatively assess the impact of host-country advantages, specific sports events, and the "star coach" effect on medal distributions.

## 💻 Tech Stack

Python, ARIMA, GM(1,1) Grey Forecasting, Logistic Regression, Random Forest, Bayesian Ridge, Analytic Hierarchy Process (AHP), Difference-in-Differences (DID)

## 🛠️ Core Contributions

* **Time-Series Data Mining & Forecasting:** Applied ARIMA models to compute annualized growth rates for countries with abundant historical data. Independently constructed a GM(1,1) grey prediction model for countries with sparse or discontinuous historical records to address data sparsity.
* **First-Medal Probability Assessment:** Developed a logistic regression model using cross-entropy as the loss function, combined with Maximum Likelihood Estimation (MLE), to quantitatively predict the probability of 77 non-medal-winning nations achieving their "first breakthrough" in 2028.
* **Multi-Factor Regression & Machine Learning:** Extracted the number of athletes and events as features, comparing linear regression, random forest, and Bayesian ridge in predicting gold, silver, and bronze counts, and conducted feature normalization.
* **Causal Inference & Policy Quantification:** Innovatively integrated the Analytic Hierarchy Process (AHP) and Difference-in-Differences (DID) model to quantify the net effect of "star coaches" on national team performance, offering quantitative investment advice for specific vulnerable projects in Japan, France, and the UK.

## 🏆 Key Results & Quantified Impact

* Successfully generated the complete predicted medal table for the 2028 Los Angeles Olympics with confidence intervals and precisely located the top 10 potential "first-medal" winning nations.
* Proved through Ordinary Least Squares (OLS) that host country status has a significant positive impact, bringing an average of approximately 2.69 additional medals.
* Validated the predictive models using MAE, MSE, and R² (coefficient of determination) to ensure robustness, generalizability, and stability on unseen test datasets.
