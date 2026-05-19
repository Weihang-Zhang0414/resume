# Smart Eye-Controlled Wheelchair Based on Arduino

**Project Leader** | July 2024 - August 2024

**TL;DR:** Developed an assistive wheelchair system controlled by eye movements, leveraging Matlab algorithms for pupil localization and sending command signals to an Arduino-driven chassis via Bluetooth.

## 🎯 Project Objectives
To design and build an intuitive, low-latency, and safe smart wheelchair control system for individuals with severe physical disabilities, enabling autonomous mobility through simple eye-movement tracking.

## 💻 Tech Stack
Matlab, Viola-Jones Face Detection, Circle Hough Transform (CHT), Bluetooth Communication, Arduino, Embedded C/C++, Sensor Data Fusion

## 🛠️ Core Contributions
* **Real-time Pupil Tracking:** Implemented Matlab Viola-Jones face and eye detection with image cropping and grayscale preprocessing to optimize tracking frame rate. Applied Circle Hough Transform (CHT) for precise pupil boundary detection and gaze direction estimation.
* **Control Signal Mapping:** Built a custom serial command mapping scheme, converting pixel offsets of the pupil into movement vectors (forward, backward, left, right). Engineered Bluetooth-based low-latency transmission between Matlab and the Arduino microcontroller.
* **Microcontroller Integration & Safety Override:** Programmed Arduino firmware to control dual DC motors with differential steering. Integrated ultrasonic distance sensors to implement an automatic emergency stop safety override.

## 🏆 Key Results & Quantified Impact
* Successfully constructed a physical wheelchair prototype controlled entirely by eye movements, with an end-to-end system latency of under 200ms.
* Achieved high classification accuracy for gaze directions under various lighting conditions.
* Received outstanding evaluation and a formal **recommendation letter** from the project academic supervisor at Brunel University London.
