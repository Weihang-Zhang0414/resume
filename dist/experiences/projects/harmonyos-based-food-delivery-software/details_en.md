# HarmonyOS-based Food Delivery Software

**Team Leader** | January 2024 - June 2024

**TL;DR:** Designed and developed a native HarmonyOS food delivery application using DevEco Studio and Java, implementing local state machines for shopping carts and remote MySQL database integration.

## 🎯 Project Objectives
To construct a native, high-performance food delivery mobile client for the HarmonyOS ecosystem, showcasing menu browsing, real-time shopping cart calculation, order creation, and database synchronization.

## 💻 Tech Stack
DevEco Studio, Java (HarmonyOS SDK), MySQL Backend Database, HTTP Client (HttpURLConnection), DevEco Local Emulator

## 🛠️ Core Contributions
* **Network Integration & APIs:** Programmed the network client layer, utilizing async network handlers to communicate with remote REST APIs and fetch shop/menu JSON data from a MySQL-backed server.
* **Shopping Cart State Machine:** Structured the cart management system, supporting quantity increments, differential dynamic pricing calculations, option selections, and local order persistence.
* **Profiling & Emulator Testing:** Led system debugging on DevEco local simulators, resolving memory allocation bottlenecks for smooth list scrolling and optimizing async image rendering.

## 🏆 Key Results & Quantified Impact
* Successfully established the end-to-end data pipeline from app interactions to remote database records.
* Achieved order processing times averaging under 500ms on local testing, ensuring user actions trigger prompt updates.
