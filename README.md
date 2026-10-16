# SamaySetu
Smart Campus Timetable Optimizer with conflict detection and management

---

## Feature: Emergency Timetable Repair

A standalone, interactive prototype allowing college administrators to handle unexpected faculty absences or classroom unavailabilities by rescheduling affected lectures without scheduling conflicts.

### Key Capabilities

1. **Intelligent Conflict Prevention Matrix:**
   - **Faculty Conflict Prevention:** Verifies that no educator has overlapping lectures across divisions or classrooms.
   - **Room Conflict Prevention:** Ensures no two divisions occupy the same classroom or laboratory at any time slot.
   - **Division Conflict Prevention:** Validates that student divisions have exactly one lecture per time slot.

2. **Automated & Guided Rescheduling:**
   - **Faculty Absence Mode:** Supports instant qualification-matched peer substitution (zero displacement) or rescheduling to open common periods.
   - **Room Unavailability Mode:** Locates vacant classrooms with sufficient capacity at the same hour or resolves to conflict-free alternative time slots.

3. **Side-by-Side Comparison & Audit:**
   - Visual inspection of the original disrupted lecture vs. the proposed conflict-free alternative.
   - Highlights changes (substitute educator, new room, or updated time slot).
   - Real-time constraint verification checks.

4. **One-Click Commitment & Persistence:**
   - "Confirm Repair" button applies changes to the live timetable.
   - Preserves schedule changes via browser `localStorage`.
   - "Reset Timetable" button to easily restart demonstration scenarios.

---

### Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS (Modern minimal dashboard style, rounded cards, subtle shadows)
- **Icons:** Lucide React

---

### Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open http://localhost:5173/ in your browser
```
