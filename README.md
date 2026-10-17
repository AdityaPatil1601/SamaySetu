
# 🏛️ SamaySetu (समयसेतु)
### Autonomous Institutional Timetable Orchestration & Academic Operations Suite

> **Sardar Patel Institute of Technology & Engineering · Central Academic Management System**  
> *Engineered for collegiate scale, zero teacher-room collisions, deterministic constraint optimization, and real-time compensatory class coordination.*

---

## 🌟 Executive Summary

**SamaySetu** is an enterprise-grade academic timetable orchestrator and schedule operations platform designed for multidisciplinary colleges and engineering universities. It automates complex NP-hard scheduling constraints across diverse branches (**Computer Engineering, Information Technology, Electronics & Telecommunication, and Mechanical Engineering**), offering designated portals for **Administrators**, **Faculty Members**, and **Students**.

Unlike conventional rigid timetable viewers, SamaySetu provides dynamic leave substitution workflows, emergency room clash reschedulers, live vacancy locators, printable landscape export engines, and an intelligent **"Schedule a Class"** compensatory scheduler.

---

## 🎨 Visual Identity & Hackathon Design System

SamaySetu is tailored with a bespoke, distraction-free corporate academic palette engineered for clarity, accessibility, and high contrast:

| Color Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Warm Ivory** | `#F6F1E8` | Primary application canvas, calm elevated card backings, clean backgrounds |
| **Forest Green** | `#244B3B` | Institutional primary brand, verified constraint badges, primary headers |
| **Terracotta** | `#C66A4A` | Actionable buttons, alerts, compensatory highlights, priority notices |
| **Soft Sand** | `#E2D5B8` | Structural dividing borders, table grids, period column delineators |
| **Charcoal** | `#22252A` | High-contrast readable typography, tabular period numbers |

> **Design Principles**: Zero generic AI gradients, zero gamification clutter, clean whitespace, intuitive responsive drawers, and high legibility.

---

## 🚀 Key Modules & Architecture

### 1. 🧑‍🏫 Faculty Portal & "Schedule a Class" Feature
- **My Teaching Schedule**: Chronological daily timeline with period numbers, room numbers, class cohorts, and practical batch tags.
- **"Schedule a Class" Assistant**:
  1. **Course & Cohort Selection**: Professors pick from only the classes and subjects they teach.
  2. **Dual-Timetable Conflict Matrix**: Automatically compares the student cohort's weekly matrix against the professor's own schedule.
  3. **Visual Slot Availability**:
     - 🟢 **Available Slot**: Verified conflict-free window where both students and professor are free.
     - 🟠 **"You're Unavailable"**: Flags if the class is free but the professor is booked elsewhere (`"You have CS101 in FY-CMPN Div A"`).
     - ⚪ **Class Occupied**: Displays the conflicting lecture, professor, and classroom.
  4. **1-Click Publishing & Instant Notification**: Automatically commits the session to the master schedule and issues an official broadcast notice directly to all enrolled students of that division.
- **Proxy & Substitution Hub**: Automated peer proxy requests for conference attendance or medical leave, cross-referencing available departmental colleagues in real-time.
- **Slot Preference & Availability Matrix**: Enables faculty to specify weekly hour quotas, preferred time bands, and unavailable slots.

---

### 2. 🏛️ Institutional Administration Command Center
- **Constraint Solver Engine**: Deterministic CSP scheduler and OR-Tools CP-SAT core model enforcing:
  - *Hard Constraints*: No professor double-booking, no classroom/lab overbooking, no cohort overlaps, single practical 2-hour uninterrupted blocks.
  - *Soft Constraints*: Balanced teacher weekly quotas, minimal student schedule gaps, preferred period assignments.
- **Emergency Rescheduler**: Immediate 1-click rescheduler for unexpected faculty leaves or lab maintenance.
- **Conflict Diagnostics**: Live audit engine highlighting room capacity overruns, faculty overload, and multi-slot splits.
- **Academic Governance**: Full CRUD directory for Departments, Divisions, Batches (`A1`, `A2`), Classrooms, Labs, and Courses.
- **Institutional Analytics**: Real-time workload quota distributions and theory-to-practical delivery ratios.

---

### 3. 🎓 Student & Class Portal
- **Division Timetable**: Clean weekly grid filterable by batch (`A1`, `A2`) for lab practicals.
- **Live Vacant Classroom & Lab Locator**: Real-time campus radar revealing vacant lecture halls and computing labs for quiet study.
- **Faculty Directory & Cabin Locator**: Searchable contact repository with cabin numbers, office hours, and departments.
- **Official Notice Board**: Real-time feed of rescheduled classes, room shifts, and compensatory lectures.

---

### 4. 🖨️ Enterprise Reporting & Multi-Format Export
- **Landscape A4 PDF Exporter**: High-resolution print-ready schedules formatted with official institutional letterheads, metadata footers, and color-coded course legends.
- **Excel / CSV Grid Export**: Formatted spreadsheet matrices identical to on-screen layouts with UTF-8 BOM encoding for Microsoft Excel compatibility.
- **Batch Export Engine**: 1-click batch generation of individual timetable PDFs for all classes or all teachers.

---

## 🛠️ Technology Stack

- **Core Framework**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4 with bespoke CSS Design Tokens
- **Icons**: Lucide React
- **Document Generation**: jsPDF, jsPDF-AutoTable
- **State & Storage**: CollegeStorage LocalStorage Engine with deterministic hydration

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or bun

### 1. Installation
Clone the repository and install dependencies:
```powershell
# Using npm with legacy peer deps to ensure smooth bundle resolution
npm install --legacy-peer-deps
```

### 2. Run Development Server
Start the local Vite dev server:
```powershell
npm run dev
```
Once started, navigate to:
**`http://localhost:3000/`** *(or `http://localhost:3001/` if port 3000 is occupied)*

### 3. Verify TypeScript Types
Ensure 100% strict type safety:
```powershell
npm run lint
```

### 4. Build for Production
```powershell
npm run build
```

---

## 👥 Demo Personas & Logins

You can switch roles with 1 click from the top-right switcher:

| Role | Demo Profile | Email | Highlights |
| :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Arvind Kelkar | `admin@samaysetu.edu` | Master Timetable, Generator, Emergency Repair, Diagnostics |
| **Faculty** | Prof. Ramesh Sharma | `sharma@samaysetu.edu` | Teaching Schedule, Schedule a Class, Proxy Hub |
| **Faculty** | Dr. Ananya Bose | `bose@samaysetu.edu` | AI Research Lab, Dual Cohort Teaching |
| **Student** | Aditya Patil | `aditya.patil@student.samaysetu.edu` | FY CMPN Div A (Batch A1), Vacant Room Locator |

---

## 📄 License & Attribution
Developed for the Institutional Academic Timetable Optimization Challenge.  
© 2026-2027 Sardar Patel Institute of Technology & Engineering · SamaySetu Central Core.
=======
# SamaySetu
Smart Campus Timetable Optimizer with conflict detection and management

