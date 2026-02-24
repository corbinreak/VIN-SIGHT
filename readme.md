# 🏎️ VIN-sight: AI-Powered Automotive Spec Utility

**Transforming VINs into actionable service data in seconds.**

## 📋 Overview
In a fast-paced service drive, every minute spent digging through outdated service manuals or clunky DMS systems is a minute lost. **VIN-sight** is a productivity tool built for Service Advisors, Technicians, and DIY enthusiasts. It streamlines the vehicle intake process by providing a unified view of factory specs and AI-generated maintenance data.

## ✨ Key Features
- **Instant VIN Decoding:** Pulls verified Year/Make/Model and engine data directly from the **NHTSA API**.
- **AI-Driven Technical Specs:** Leverages **Google Gemini AI** to predict and retrieve deep technical details:
  - 🛢️ **Oil Capacity & Viscosity**
  - 🔩 **Drain Plug Size & Thread Pitch**
  - ⚡ **Spark Plug Gaps & Filter Part Numbers**
  - 🎡 **Wheel Lug Torque Specs**
- **Persistent Side Panel:** Built with Chrome’s **SidePanel API**, allowing it to stay open while you navigate other service tabs (like Tekmetric or CCC).
- **Clean UI:** A high-contrast "Garage Dark Mode" designed for readability in shop environments.

## 🛠️ Tech Stack
- **Languages:** JavaScript (ES6+), HTML5, CSS3
- **APIs:** NHTSA vPio (Vehicle Identification), Google Gemini 1.5 Flash
- **Architecture:** Chrome Extension Manifest V3 (Service Workers, SidePanel API)
- **Security:** Decoupled API key management via `.gitignore` and `config.js`.

## ⚙️ Installation
1. Clone this repository or download the ZIP.
2. Open Chrome and go to `chrome://extensions`.
3. Insert your own Gemini API key.
3. Enable **Developer Mode** (top right).
4. Click **Load Unpacked** and select the project folder.
5. *Note: You will need your own Gemini API key in a `config.js` file (see `config.example.js` for setup).*

## 💡 Why I Built This
As a Service Advisor, I noticed that intake research was a major bottleneck. I developed VIN-sight to prove that modern AI can be a practical, "blue-collar" tool—not just a chatbot, but a functional assistant that puts the right bolt size in a tech's hand faster.

### ⚠️ Technical Disclaimer
*This tool uses AI to predict maintenance specifications. While highly accurate for common models, users should always verify specs in the official OEM owner's manual before performing service.*