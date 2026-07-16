<div align="center">

# 🛰️ NetWatch Pro

### ⚡ Premium Local Website & Target Monitoring Platform

<p>
  <strong>Scan. Monitor. Analyze. Control.</strong>
</p>

<p>
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Mobile-Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" />
</p>

<p>
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-android-build">Android Build</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

</div>

---

## 🌌 Overview

**NetWatch Pro** is a modern, privacy-focused website and target monitoring platform designed to scan, track, organize, and analyze large collections of user-provided targets through a premium Android interface.

The project combines a futuristic dashboard experience with a local-first architecture, allowing users to manage targets and scan results directly on their device.

NetWatch Pro is designed to evolve from a simple website checker into a complete monitoring and analysis platform.

> **Scan smarter. Monitor locally. Keep control of your data.**

---

# ✨ Why NetWatch Pro?

Most monitoring tools are built around remote servers, complicated dashboards, and external data storage.

NetWatch Pro takes a different approach.

### 🧠 Local-First Architecture

Target data, scan history, and monitoring results are stored locally using SQLite.

### ⚡ Performance-Oriented Scanning

The scanner is designed around concurrency, configurable timeouts, progress tracking, and efficient database operations.

### 📱 Mobile-First Experience

The entire application is designed to run as a modern Android application through Capacitor.

### 🎨 Premium User Interface

NetWatch Pro uses a futuristic dark interface designed for a clean, focused, and professional monitoring experience.

---
<div align="center">🚀 NETWATCH PRO

⚡ Advanced Local-First Network Monitoring for Android

<br><table>
<tr>
<td align="center">📦 LATEST ANDROID BUILD

Take control of your monitoring workflow.

<br><a href="https://github.com/danyalasadpoor/cyber-net-probe/releases/download/Netwatch-pro/Netwatch-pro.zip">
<img src="https://img.shields.io/badge/⬇️%20DOWNLOAD%20NOW-00D4FF?style=for-the-badge&logo=android&logoColor=white" alt="Download NetWatch Pro">
</a><br><br>

<img src="https://img.shields.io/badge/RELEASE-v0.1.0-7C3AED?style=flat-square">
<img src="https://img.shields.io/badge/PLATFORM-ANDROID-3DDC84?style=flat-square&logo=android&logoColor=white">
<img src="https://img.shields.io/badge/STATUS-PRE--RELEASE-FFB000?style=flat-square"><br><br>

⬇️ Download the latest NetWatch Pro Android build

<br><a href="https://github.com/danyalasadpoor/cyber-net-probe/releases/download/Netwatch-pro/Netwatch-pro.zip">
<strong>👉 GET NETWATCH PRO</strong>
</a></td>
</tr>
</table><br>«🛡️ Local-first. Private. Powerful.

Your monitoring data stays on your device.»

<br>✨ WHAT'S INSIDE

🔍 Scanner| 📊 Analytics| 🗃️ Local Database
Configurable scanning| Real-time statistics| SQLite-powered storage

🎯 Target Management| 📥 Import & Export| 📱 Android Ready
Organize your targets| Backup & restore| Built with Capacitor

</div>
---
# 🚀 Features

## 🔍 Advanced Scanner

NetWatch Pro allows users to define exactly how many targets should be processed during a scan.

Example scan sizes:

```text
10 targets
100 targets
1,000 targets
5,000 targets
20,000+ targets
The scanner is designed to support:
Configurable scan counts
Concurrent workers
Configurable request timeout
Progress tracking
Online/offline classification
Latency measurement
Scan speed calculation
ETA estimation
Scan cancellation support
Persistent scan history
Database-backed results
⚙️ Configurable Scanner
Users can customize scanner behavior through the Settings panel.
Request Timeout
Controls how long the scanner waits for a target response.
Minimum: 500 ms
Maximum: 60,000 ms
Concurrency
Controls the number of simultaneous scan workers.
Range: 1 - 64 concurrent workers
This allows users to balance between performance and device resource usage.
📊 Real-Time Scan Statistics
During scanning, NetWatch Pro is designed to track:
Total targets
Completed targets
Online targets
Offline targets
Current target
Scan speed
Estimated remaining time
Scan status
Start time
Completion time
Example:
Total:     5,000
Completed: 2,450
Online:    1,920
Offline:   530
Speed:     42 targets/sec
ETA:       60 seconds
🗃️ Local SQLite Database
NetWatch Pro uses SQLite for local data storage.
The database contains tables for:
targets
Stores monitored targets and their current state.
id
name
address
category
tags
notes
favorite
status
latency
availability
last_checked
created_at
scans
Stores scan sessions.
id
started_at
finished_at
total
online
offline
avg_latency
status
scan_samples
Stores individual target results from scans.
id
scan_id
target_id
status
latency
ts
This structure allows NetWatch Pro to maintain historical scan information while keeping the data local.
📈 Dashboard Analytics
The dashboard is designed to provide a clear overview of the monitoring environment.
Planned and supported statistics include:
Total targets
Online targets
Offline targets
Recent scan activity
Average latency
Target categories
Scan trends
Recent results
🎯 Target Management
Targets can be organized using:
Name
Address
Category
Tags
Notes
Favorite status
Current availability
Latency
Last check time
This allows users to manage large collections of targets without relying on external services.
🏷️ Categories & Tags
Targets can be organized into categories such as:
General
Production
Development
Monitoring
Infrastructure
Websites
Services
Custom
Tags can be used to create flexible custom organization systems.
⭐ Favorites
Important targets can be marked as favorites.
Favorites can be used to:
Quickly identify important targets
Filter target lists
Prioritize important services
Organize large target collections
📥 Import & Export
NetWatch Pro supports local data management workflows.
The application is designed to support:
Backup creation
Restore from backup
Target import
Data export
CSV workflows
JSON backup workflows
Example backup structure:
{
  "targets": [],
  "scans": []
}
All data processing is designed to happen locally on the device.
💾 Backup & Restore
Users can create a complete local backup of application data.
A backup can contain:
Targets
Scan history
Monitoring results
This makes it possible to migrate or restore application data without requiring a cloud backend.
🧹 Database Management
The application includes database management tools such as:
Backup all data
Restore from backup
Wipe database
Reset local data
The database wipe action is intentionally protected by a confirmation prompt.
🛰️ Monitoring Workflow
The general workflow is:
┌─────────────────────┐
│   Add / Import      │
│      Targets        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Store in SQLite   │
│    Local Database   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Start Scan        │
│  Configure Count    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Concurrent Workers  │
│   Process Targets   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Collect Results    │
│ Status + Latency    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Save Scan History  │
│   to SQLite         │
└─────────────────────┘
🏗️ Architecture
NetWatch Pro follows a modular architecture.
NetWatch Pro
│
├── React
│   └── User Interface
│
├── TypeScript
│   └── Type Safety
│
├── Vite
│   └── Build System
│
├── Capacitor
│   └── Android Runtime
│
├── SQLite
│   └── Local Data Storage
│
└── Scanner Engine
    ├── Concurrency
    ├── Timeout Management
    ├── Progress Tracking
    ├── Latency Measurement
    └── Result Persistence
📁 Project Structure
netwatch-pro/
│
├── android/
│   └── Android native project
│
├── public/
│   └── Static assets
│
├── src/
│   │
│   ├── components/
│   │   └── Reusable UI components
│   │
│   ├── data/
│   │   └── Target data sources
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── scanner.ts
│   │   ├── logger.ts
│   │   ├── export.ts
│   │   └── utils.ts
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Scanner.tsx
│   │   ├── Targets.tsx
│   │   ├── Results.tsx
│   │   └── Settings.tsx
│   │
│   ├── store/
│   │   └── Application state
│   │
│   ├── types/
│   │   └── TypeScript definitions
│   │
│   └── App.tsx
│
├── capacitor.config.ts
├── package.json
├── vite.config.ts
└── README.md
🛠️ Tech Stack
Frontend
React
TypeScript
Tailwind CSS
Lucide Icons
Build System
Vite
TypeScript Compiler
Mobile
Capacitor
Android
Database
SQLite
@capacitor-community/sqlite
State Management
Zustand-based application stores
⚡ Installation
1. Clone the Repository
git clone https://github.com/danyalasa/cyber-net-probe.git
cd cyber-net-probe
2. Install Dependencies
npm install
3. Start Development Server
npm run dev
The development server will then be available through the Vite development environment.
4. Build the Web Application
npm run build
📱 Android Build
NetWatch Pro uses Capacitor to package the web application as an Android application.
Build the Web Project
npm run build
Synchronize Capacitor
npx cap sync android
Open Android Project
npx cap open android
The Android project can then be built using Android Studio.
🔄 Development Workflow
A typical development workflow:
npm install
npm run dev
After making changes:
npm run build
Then synchronize Android:
npx cap sync android
🔐 Privacy
NetWatch Pro is designed around a local-first data model.
The core application is designed so that:
Target data can remain on-device
Scan history can remain on-device
SQLite data is stored locally
No external server is required for the core local workflow
Privacy and local data ownership are central design goals of the project.
⚖️ Responsible Use
NetWatch Pro is intended for legitimate monitoring, testing, administration, and research of targets that the user owns or has explicit permission to monitor.
Users are responsible for complying with:
Applicable laws
Terms of service
Network policies
Authorization requirements
Only scan systems and targets that you are authorized to monitor.
🗺️ Roadmap
✅ Current Direction
[x] Premium dark dashboard
[x] React-based UI
[x] TypeScript architecture
[x] SQLite local database
[x] Target management
[x] Scan history
[x] Configurable scan settings
[x] Android integration through Capacitor
[x] Backup and restore workflows
🚧 In Development
[ ] Improved target import system
[ ] More advanced scan analytics
[ ] Improved real-time logging
[ ] Better large-dataset performance
[ ] Advanced filtering
[ ] More detailed scan history
[ ] Improved mobile optimization
[ ] Better database migration system
🔮 Future Ideas
[ ] Scheduled monitoring
[ ] Notification system
[ ] Historical latency charts
[ ] Availability reports
[ ] Advanced target groups
[ ] Custom monitoring profiles
[ ] More detailed analytics
[ ] Exportable reports
[ ] Multi-device synchronization
🧪 Project Status
NetWatch Pro is an actively evolving project.
The architecture is being continuously improved to support:
More targets
More efficient scanning
Better analytics
Better mobile performance
Better data management
The project is currently focused on building a strong foundation for a scalable local monitoring platform.
🤝 Contributing
Contributions, ideas, bug reports, and improvements are welcome.
If you have an idea for improving NetWatch Pro:
Fork the repository
Create a feature branch
Make your changes
Test the project
Open a Pull Request
Example:
git checkout -b feature/my-improvement
🐛 Bug Reports
When reporting a bug, please include:
Device model
Android version
Application version
Steps to reproduce
Expected behavior
Actual behavior
Relevant error messages
This makes debugging significantly easier.
⭐ Support the Project
If you find NetWatch Pro interesting, consider:
⭐ Starring the repository
🐛 Reporting bugs
💡 Suggesting features
🔧 Contributing improvements
📢 Sharing the project
�

🛰️ NetWatch Pro
Scan Smarter. Monitor Locally. Stay in Control.
Built with ❤️ using React, TypeScript, SQLite, Vite, and Capacitor.
```
