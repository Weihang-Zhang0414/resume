# Hyperlipidemia Risk Warning and Intervention System Based on LASSO-SHAP and Dynamic Programming

**Team Leader / Core Algorithm Engineer** | The 16th MathorCup Mathematical Application Challenge (2026)

**TL;DR:** Led the team to win the National Second Prize. Responsible for core algorithm design and Python implementation. Integrated machine learning with operations research to construct a closed-loop decision system for chronic disease management integrating traditional Chinese and Western medicine ("Feature Identification - Risk Stratification - Dynamic Intervention").

## 🎯 Situation & Task

Problem C of the 2026 MathorCup required participants to address the precise prevention, control, and intervention of hyperlipidemia based on physical examination data, Traditional Chinese Medicine (TCM) constitution features, and physical activity scores of middle-aged and elderly populations. As the team leader and core modeler, my task was to transform massive, heterogeneous medical datasets into highly interpretable risk assessment models. Under strict constraints (such as physical tolerance and budget limits), I designed an optimal 6-month individualized dynamic intervention path for diagnosed patients.

## 💻 Tech Stack

Python, Ensemble Machine Learning (LASSO / Random Forest / XGBoost), Explainable AI (SHAP), Probability Calibration (Platt Scaling), Lexicographical Multi-Objective Optimization, Finite-Horizon Dynamic Programming

## 🛠️ Core Contributions (Action)

* **Dual-Task Feature Engineering & Interpretability:** To overcome the limitations of single lipid indicators, I designed a joint feature screening algorithm based on LASSO and tree model ensembles. I introduced SHAP values to quantify the non-linear contribution of features, validated the stability using bootstrapping, and controlled collinearity with VIF. We identified a core variable system centered on TG, TC, and BMI, supplemented by blood uric acid and physical activity. We also quantitatively measured the contribution of the "phlegm-dampness constitution" to high onset risk from a medical mechanism perspective.


* **Continuous Risk Assessment & Rule Extraction:** Moving away from binary classification, I developed a LASSO-Logistic continuous risk probability model and applied Platt scaling for probability calibration, ensuring the predicted probability matches the actual prevalence. Using the CART decision tree algorithm, we extracted visual high-risk rules, establishing clear low, medium (confirmed prevalence ~75.0%), and high (confirmed prevalence ~98.9%) risk stratification thresholds.


* **Finite-Horizon Dynamic Programming Optimization:** For high-risk diagnosed patients, I constructed a monthly dynamic intervention model. Under strict constraints including TCM conditioning levels, maximum activity intensity, and a 6-month budget limit of $\le 2000$ RMB, I designed a state-transition equation for the "phlegm-dampness score". Using lexicographical multi-objective optimization (minimizing scores first, controlling costs second, and maintaining stability last), I solved for the optimal intervention path under various patient profiles using finite-horizon dynamic programming (DP).



## 🏆 Results & Impact

* Led the team to win the **National Second Prize** in the MathorCup competition.
* Wrote robust, automated Python pipelines integrating data cleaning, feature screening, and dynamic intervention path generation, ensuring statistical precision and clinical interpretability.


* Provided customized 6-month intervention sheets (showing a dynamic progression of "initial consolidation and later maintenance") for specific patients in the sample pool, demonstrating high clinical value for personalized smart medicine.
