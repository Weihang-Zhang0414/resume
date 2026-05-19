# Arduino-based Smart Car

**Team Leader** | September 2023 - December 2023

**TL;DR:** Built and programmed a 4WD robotic vehicle using Arduino Uno, implementing infrared line-tracking, ultrasonic obstacle avoidance, and manual Bluetooth App remote control.

## 🎯 Project Objectives
To develop a multi-functional smart car platform. The vehicle autonomously aligns along track boundaries via IR tracking, performs collision-prevention overrides through ultrasonic ranging, and accepts remote direction steering commands via mobile Bluetooth serial connectivity.

## 💻 Tech Stack
Arduino Uno, C/C++ Embedded Programming, IR Tracking Array (TCRT5000), Ultrasonic Ranging Module (HC-SR04), Bluetooth Transceiver (HC-05), L298N H-Bridge Motor Driver

## 🛠️ Core Contributions
* **Hardware Integration & Power Delivery:** Configured a 4WD chassis with L298N drivers and Arduino Uno. Developed a dual 18650 battery power distribution circuit with voltage regulation.
* **Firmware Development (Line-Tracking & Obstacle Avoidance):** Wrote Arduino control loops in C/C++. Implemented differential PID speed control based on feedback from the TCRT5000 sensor array for smooth turns. Structured HC-SR04 polling logic for reactive distance safety checks.
* **Bluetooth Interface Integration:** Programmed the HC-05 Bluetooth receiver to parse custom control frames (e.g., speed, steering directions) transmitted from an Android application, enabling real-time manual control.

## 🏆 Key Results & Quantified Impact
* Successfully built and demonstrated a responsive, fully operational 4WD robotic car prototype.
* Achieved seamless state switching between autonomous tracking (100% line compliance), safety braking (triggering at exactly 15cm), and remote Bluetooth manual override.
* Obtained top marks in the micro-controller applications lab demonstration.
