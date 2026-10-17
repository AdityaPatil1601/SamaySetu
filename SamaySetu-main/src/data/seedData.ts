import {
  Branch,
  Division,
  StudentBatch,
  Faculty,
  Subject,
  Room,
  CollegeSettings,
  User,
  Student,
  Announcement,
  SubstitutionRequest,
  ScheduleAssignment,
  ScheduleVersion,
} from '../types';

export const INITIAL_SETTINGS: CollegeSettings = {
  collegeName: 'Shree L.R. Tiwari College of Engineering',
  academicTerm: 'Academic Term 2026-27 (Odd Semester)',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  operatingStartTime: '09:00',
  operatingEndTime: '17:00',
  lectureDurationMinutes: 60,
  practicalDurationMinutes: 120,
  lunchBreakSlotIndex: 3, // Lunch after slot 3 (13:15 - 14:00)
  teaBreakSlotIndex: 1,   // Tea break after slot 1 (11:00 - 11:15)
  slots: [
    { slotIndex: 0, startTime: '09:00', endTime: '10:00', label: '09:00 - 10:00' },
    { slotIndex: 1, startTime: '10:00', endTime: '11:00', label: '10:00 - 11:00' },
    { slotIndex: 2, startTime: '11:15', endTime: '12:15', label: '11:15 - 12:15' },
    { slotIndex: 3, startTime: '12:15', endTime: '13:15', label: '12:15 - 13:15' },
    { slotIndex: 4, startTime: '14:00', endTime: '15:00', label: '14:00 - 15:00' },
    { slotIndex: 5, startTime: '15:00', endTime: '16:00', label: '15:00 - 16:00' },
    { slotIndex: 6, startTime: '16:00', endTime: '17:00', label: '16:00 - 17:00' },
  ],
};

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'branch-cmpn', code: 'CMPN', name: 'Computer Engineering', department: 'Computer Science', active: true },
  { id: 'branch-it', code: 'IT', name: 'Information Technology', department: 'Information Technology', active: true },
  { id: 'branch-extc', code: 'EXTC', name: 'Electronics & Telecommunication', department: 'Electronics', active: true },
  { id: 'branch-mech', code: 'MECH', name: 'Mechanical Engineering', department: 'Mechanical Sciences', active: true },
];

export const INITIAL_DIVISIONS: Division[] = [
  // CMPN
  { id: 'div-cmpn-fy-a', branchId: 'branch-cmpn', academicYear: 'FY', name: 'FY-CMPN Div A', studentCount: 60, active: true },
  { id: 'div-cmpn-fy-b', branchId: 'branch-cmpn', academicYear: 'FY', name: 'FY-CMPN Div B', studentCount: 60, active: true },
  { id: 'div-cmpn-sy-a', branchId: 'branch-cmpn', academicYear: 'SY', name: 'SY-CMPN Div A', studentCount: 60, active: true },
  { id: 'div-cmpn-ty-a', branchId: 'branch-cmpn', academicYear: 'TY', name: 'TY-CMPN Div A', studentCount: 60, active: true },
  // IT
  { id: 'div-it-fy-a', branchId: 'branch-it', academicYear: 'FY', name: 'FY-IT Div A', studentCount: 60, active: true },
  { id: 'div-it-sy-a', branchId: 'branch-it', academicYear: 'SY', name: 'SY-IT Div A', studentCount: 60, active: true },
  { id: 'div-it-ty-a', branchId: 'branch-it', academicYear: 'TY', name: 'TY-IT Div A', studentCount: 60, active: true },
  // EXTC
  { id: 'div-extc-sy-a', branchId: 'branch-extc', academicYear: 'SY', name: 'SY-EXTC Div A', studentCount: 50, active: true },
  // MECH
  { id: 'div-mech-sy-a', branchId: 'branch-mech', academicYear: 'SY', name: 'SY-MECH Div A', studentCount: 50, active: true },
];

export const INITIAL_BATCHES: StudentBatch[] = [
  { id: 'batch-cmpn-fy-a-1', divisionId: 'div-cmpn-fy-a', name: 'A1', studentCount: 30 },
  { id: 'batch-cmpn-fy-a-2', divisionId: 'div-cmpn-fy-a', name: 'A2', studentCount: 30 },
  { id: 'batch-cmpn-fy-b-1', divisionId: 'div-cmpn-fy-b', name: 'B1', studentCount: 30 },
  { id: 'batch-cmpn-fy-b-2', divisionId: 'div-cmpn-fy-b', name: 'B2', studentCount: 30 },
  { id: 'batch-cmpn-sy-a-1', divisionId: 'div-cmpn-sy-a', name: 'A1', studentCount: 30 },
  { id: 'batch-cmpn-sy-a-2', divisionId: 'div-cmpn-sy-a', name: 'A2', studentCount: 30 },
  { id: 'batch-cmpn-ty-a-1', divisionId: 'div-cmpn-ty-a', name: 'A1', studentCount: 30 },
  { id: 'batch-cmpn-ty-a-2', divisionId: 'div-cmpn-ty-a', name: 'A2', studentCount: 30 },
  { id: 'batch-it-fy-a-1', divisionId: 'div-it-fy-a', name: 'A1', studentCount: 30 },
  { id: 'batch-it-fy-a-2', divisionId: 'div-it-fy-a', name: 'A2', studentCount: 30 },
  { id: 'batch-it-sy-a-1', divisionId: 'div-it-sy-a', name: 'A1', studentCount: 30 },
  { id: 'batch-it-sy-a-2', divisionId: 'div-it-sy-a', name: 'A2', studentCount: 30 },
  { id: 'batch-it-ty-a-1', divisionId: 'div-it-ty-a', name: 'A1', studentCount: 30 },
  { id: 'batch-it-ty-a-2', divisionId: 'div-it-ty-a', name: 'A2', studentCount: 30 },
  { id: 'batch-extc-sy-a-1', divisionId: 'div-extc-sy-a', name: 'A1', studentCount: 25 },
  { id: 'batch-extc-sy-a-2', divisionId: 'div-extc-sy-a', name: 'A2', studentCount: 25 },
  { id: 'batch-mech-sy-a-1', divisionId: 'div-mech-sy-a', name: 'A1', studentCount: 25 },
  { id: 'batch-mech-sy-a-2', divisionId: 'div-mech-sy-a', name: 'A2', studentCount: 25 },
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-201',
    roomNumber: 'CR-201',
    name: 'Smart Lecture Hall 201',
    type: 'Classroom',
    capacity: 70,
    equipment: ['Interactive 4K Display', 'Acoustic Sound Bar', 'Wi-Fi 6 Access Point'],
    permittedSessionTypes: ['Theory'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'room-202',
    roomNumber: 'CR-202',
    name: 'Lecture Hall 202',
    type: 'Classroom',
    capacity: 70,
    equipment: ['Laser Projector', 'Motorized Screen', 'Document Camera'],
    permittedSessionTypes: ['Theory'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'room-203',
    roomNumber: 'CR-203',
    name: 'Lecture Hall 203',
    type: 'Classroom',
    capacity: 70,
    equipment: ['Laser Projector', 'Whiteboard', 'Microphone Array'],
    permittedSessionTypes: ['Theory'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'room-204',
    roomNumber: 'CR-204',
    name: 'Lecture Hall 204',
    type: 'Classroom',
    capacity: 70,
    equipment: ['Ceiling Projector', 'Double Ceramic Whiteboard'],
    permittedSessionTypes: ['Theory'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'room-205',
    roomNumber: 'CR-205',
    name: 'Lecture Hall 205',
    type: 'Classroom',
    capacity: 70,
    equipment: ['Interactive Screen', 'Lapel Mic System'],
    permittedSessionTypes: ['Theory'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'room-206',
    roomNumber: 'CR-206',
    name: 'Lecture Hall 206',
    type: 'Classroom',
    capacity: 70,
    equipment: ['Digital Smart Board', 'High Lumen Projector'],
    permittedSessionTypes: ['Theory'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'room-301-aud',
    roomNumber: 'LH-301',
    name: 'Tiered Auditorium 301',
    type: 'Seminar Hall',
    capacity: 160,
    equipment: ['Dual Laser Projectors', 'Wireless Mic Array', 'Stage Podium'],
    permittedSessionTypes: ['Theory'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'lab-101',
    roomNumber: 'LAB-101',
    name: 'Advanced Computing Lab 1',
    type: 'Computer Lab',
    capacity: 35,
    equipment: ['35 Linux Workstations', 'GPU Cluster Access', 'Gigabit Switch'],
    permittedSessionTypes: ['Practical'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'lab-102',
    roomNumber: 'LAB-102',
    name: 'Software Engineering & AI Lab 2',
    type: 'Computer Lab',
    capacity: 35,
    equipment: ['35 Intel i7 PCs', 'VS Code & PyTorch Suite', 'Testing Server'],
    permittedSessionTypes: ['Practical'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'lab-103',
    roomNumber: 'LAB-103',
    name: 'Microprocessor & Embedded Systems Lab',
    type: 'Electronics Lab',
    capacity: 35,
    equipment: ['DSO Oscilloscopes', '8086/ARM Trainer Kits', 'Logic Analyzers'],
    permittedSessionTypes: ['Practical'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'lab-104',
    roomNumber: 'LAB-104',
    name: 'Mechanical CAD/CAM Simulation Lab',
    type: 'Mechanical Lab',
    capacity: 35,
    equipment: ['32 High-Spec CAD Stations', 'ANSYS & SolidWorks Licenses'],
    permittedSessionTypes: ['Practical'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'lab-105',
    roomNumber: 'LAB-105',
    name: 'Networks & Cyber Security Lab',
    type: 'Computer Lab',
    capacity: 35,
    equipment: ['Cisco Routers & Managed Switches', 'Wireshark & Snort Bench'],
    permittedSessionTypes: ['Practical'],
    unavailableSlots: [],
    active: true,
  },
  {
    id: 'lab-106',
    roomNumber: 'LAB-106',
    name: 'Database & Cloud Systems Lab',
    type: 'Computer Lab',
    capacity: 35,
    equipment: ['35 High-RAM Dell Desktops', 'PostgreSQL & Docker Local Cloud'],
    permittedSessionTypes: ['Practical'],
    unavailableSlots: [],
    active: true,
  },
];

export const INITIAL_FACULTY: Faculty[] = [
  {
    id: 'fac-sharma',
    employeeId: 'FAC-001',
    name: 'Prof. Ramesh Sharma',
    email: 'sharma@samaysetu.edu',
    department: 'Computer Science',
    cabin: 'CS-301 (Faculty Block B)',
    phone: '+91 98200 11001',
    qualifiedSubjectCodes: ['CS101', 'CS201', 'CS301', 'IT301'],
    eligibleAssignments: [
      { branchId: 'branch-cmpn', academicYear: 'FY' },
      { branchId: 'branch-cmpn', academicYear: 'SY' },
      { branchId: 'branch-cmpn', academicYear: 'TY' },
      { branchId: 'branch-it', academicYear: 'TY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [
      { day: 'Monday', slotIndex: 0 },
      { day: 'Wednesday', slotIndex: 1 },
      { day: 'Friday', slotIndex: 2 },
    ],
    active: true,
  },
  {
    id: 'fac-mehta',
    employeeId: 'FAC-002',
    name: 'Prof. Priya Mehta',
    email: 'mehta@samaysetu.edu',
    department: 'Computer Science',
    cabin: 'CS-302 (Faculty Block B)',
    phone: '+91 98200 11002',
    qualifiedSubjectCodes: ['CS102', 'CS202', 'CS302'],
    eligibleAssignments: [
      { branchId: 'branch-cmpn', academicYear: 'FY' },
      { branchId: 'branch-cmpn', academicYear: 'SY' },
      { branchId: 'branch-cmpn', academicYear: 'TY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [{ day: 'Tuesday', slotIndex: 1 }],
    active: true,
  },
  {
    id: 'fac-kulkarni',
    employeeId: 'FAC-003',
    name: 'Dr. Rajesh Kulkarni',
    email: 'kulkarni@samaysetu.edu',
    department: 'Information Technology',
    cabin: 'IT-201 (IT Wing Floor 2)',
    phone: '+91 98200 11003',
    qualifiedSubjectCodes: ['IT101', 'IT201', 'IT301', 'IT302'],
    eligibleAssignments: [
      { branchId: 'branch-it', academicYear: 'FY' },
      { branchId: 'branch-it', academicYear: 'SY' },
      { branchId: 'branch-it', academicYear: 'TY' },
    ],
    maxWeeklyHours: 16,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [{ day: 'Monday', slotIndex: 1 }],
    active: true,
  },
  {
    id: 'fac-deshmukh',
    employeeId: 'FAC-004',
    name: 'Prof. Sunita Deshmukh',
    email: 'deshmukh@samaysetu.edu',
    department: 'Computer Science',
    cabin: 'CS-304 (Faculty Block B)',
    phone: '+91 98200 11004',
    qualifiedSubjectCodes: ['CS103', 'CS203', 'CS303'],
    eligibleAssignments: [
      { branchId: 'branch-cmpn', academicYear: 'FY' },
      { branchId: 'branch-cmpn', academicYear: 'SY' },
      { branchId: 'branch-cmpn', academicYear: 'TY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-patil',
    employeeId: 'FAC-005',
    name: 'Prof. Rohan Patil',
    email: 'patil@samaysetu.edu',
    department: 'Information Technology',
    cabin: 'IT-204 (IT Wing Floor 2)',
    phone: '+91 98200 11005',
    qualifiedSubjectCodes: ['IT102', 'IT202', 'IT303'],
    eligibleAssignments: [
      { branchId: 'branch-it', academicYear: 'FY' },
      { branchId: 'branch-it', academicYear: 'SY' },
      { branchId: 'branch-it', academicYear: 'TY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-verma',
    employeeId: 'FAC-006',
    name: 'Prof. Amit Verma',
    email: 'verma@samaysetu.edu',
    department: 'Electronics',
    cabin: 'EC-101 (Electronics Block)',
    phone: '+91 98200 11006',
    qualifiedSubjectCodes: ['EC201', 'EC202', 'CS102'],
    eligibleAssignments: [
      { branchId: 'branch-extc', academicYear: 'SY' },
      { branchId: 'branch-cmpn', academicYear: 'FY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-iyer',
    employeeId: 'FAC-007',
    name: 'Prof. Sneha Iyer',
    email: 'iyer@samaysetu.edu',
    department: 'Applied Mathematics',
    cabin: 'BS-102 (Basic Sciences Wing)',
    phone: '+91 98200 11007',
    qualifiedSubjectCodes: ['MA101', 'MA102', 'CS204'],
    eligibleAssignments: [
      { branchId: 'branch-cmpn', academicYear: 'FY' },
      { branchId: 'branch-it', academicYear: 'FY' },
      { branchId: 'branch-cmpn', academicYear: 'SY' },
    ],
    maxWeeklyHours: 20,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-joshi',
    employeeId: 'FAC-008',
    name: 'Prof. Vikram Joshi',
    email: 'joshi@samaysetu.edu',
    department: 'Mechanical Sciences',
    cabin: 'ME-205 (Mechanical Block)',
    phone: '+91 98200 11008',
    qualifiedSubjectCodes: ['ME201', 'ME202', 'ME203'],
    eligibleAssignments: [{ branchId: 'branch-mech', academicYear: 'SY' }],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-bose',
    employeeId: 'FAC-009',
    name: 'Dr. Ananya Bose',
    email: 'bose@samaysetu.edu',
    department: 'Computer Science',
    cabin: 'CS-305 (AI Research Lab)',
    phone: '+91 98200 11009',
    qualifiedSubjectCodes: ['CS301', 'CS101', 'CS205'],
    eligibleAssignments: [
      { branchId: 'branch-cmpn', academicYear: 'TY' },
      { branchId: 'branch-cmpn', academicYear: 'SY' },
      { branchId: 'branch-cmpn', academicYear: 'FY' },
    ],
    maxWeeklyHours: 16,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-nair',
    employeeId: 'FAC-010',
    name: 'Prof. Siddharth Nair',
    email: 'nair@samaysetu.edu',
    department: 'Information Technology',
    cabin: 'IT-205 (Cloud Systems Suite)',
    phone: '+91 98200 11010',
    qualifiedSubjectCodes: ['IT304', 'IT204', 'IT103'],
    eligibleAssignments: [
      { branchId: 'branch-it', academicYear: 'TY' },
      { branchId: 'branch-it', academicYear: 'SY' },
      { branchId: 'branch-it', academicYear: 'FY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-reddy',
    employeeId: 'FAC-011',
    name: 'Prof. Kavita Reddy',
    email: 'reddy@samaysetu.edu',
    department: 'Computer Science',
    cabin: 'CS-306 (Faculty Block B)',
    phone: '+91 98200 11011',
    qualifiedSubjectCodes: ['CS303', 'CS203', 'CS305'],
    eligibleAssignments: [
      { branchId: 'branch-cmpn', academicYear: 'TY' },
      { branchId: 'branch-cmpn', academicYear: 'SY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-choudhury',
    employeeId: 'FAC-012',
    name: 'Dr. Arpan Choudhury',
    email: 'choudhury@samaysetu.edu',
    department: 'Electronics',
    cabin: 'EC-103 (Embedded Systems Wing)',
    phone: '+91 98200 11012',
    qualifiedSubjectCodes: ['EC203', 'EC204', 'EC201'],
    eligibleAssignments: [{ branchId: 'branch-extc', academicYear: 'SY' }],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-sen',
    employeeId: 'FAC-013',
    name: 'Prof. Tanvi Sen',
    email: 'sen@samaysetu.edu',
    department: 'Information Technology',
    cabin: 'IT-206 (Web Systems Lab)',
    phone: '+91 98200 11013',
    qualifiedSubjectCodes: ['IT204', 'IT101', 'IT305'],
    eligibleAssignments: [
      { branchId: 'branch-it', academicYear: 'SY' },
      { branchId: 'branch-it', academicYear: 'FY' },
      { branchId: 'branch-it', academicYear: 'TY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-bhat',
    employeeId: 'FAC-014',
    name: 'Prof. Manoj Bhat',
    email: 'bhat@samaysetu.edu',
    department: 'Computer Science',
    cabin: 'CS-307 (Data Infrastructure)',
    phone: '+91 98200 11014',
    qualifiedSubjectCodes: ['CS201', 'CS304', 'CS103'],
    eligibleAssignments: [
      { branchId: 'branch-cmpn', academicYear: 'SY' },
      { branchId: 'branch-cmpn', academicYear: 'TY' },
      { branchId: 'branch-cmpn', academicYear: 'FY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-menon',
    employeeId: 'FAC-015',
    name: 'Dr. Radhika Menon',
    email: 'menon@samaysetu.edu',
    department: 'Basic Sciences',
    cabin: 'BS-104 (Physics Department)',
    phone: '+91 98200 11015',
    qualifiedSubjectCodes: ['CS104', 'IT104', 'CS105'],
    eligibleAssignments: [
      { branchId: 'branch-cmpn', academicYear: 'FY' },
      { branchId: 'branch-it', academicYear: 'FY' },
    ],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
  {
    id: 'fac-gupta',
    employeeId: 'FAC-016',
    name: 'Prof. Alok Gupta',
    email: 'gupta@samaysetu.edu',
    department: 'Mechanical Sciences',
    cabin: 'ME-202 (Thermal Engineering Lab)',
    phone: '+91 98200 11016',
    qualifiedSubjectCodes: ['ME204', 'ME201', 'ME202'],
    eligibleAssignments: [{ branchId: 'branch-mech', academicYear: 'SY' }],
    maxWeeklyHours: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    unavailableSlots: [],
    preferredSlots: [],
    active: true,
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // ================= FY CMPN =================
  {
    id: 'sub-cs101',
    code: 'CS101',
    name: 'Data Structures & Algorithms Foundations',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    divisionIds: ['div-cmpn-fy-a', 'div-cmpn-fy-b'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-sharma', 'fac-bose'],
    permittedRoomIds: ['room-201', 'room-202', 'room-203'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#EEF2FF', // Soft indigo
  },
  {
    id: 'sub-ma101',
    code: 'MA101',
    name: 'Applied Mathematics I (Calculus & Linear Algebra)',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    divisionIds: ['div-cmpn-fy-a', 'div-cmpn-fy-b'],
    theorySessionsPerWeek: 4,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-iyer'],
    permittedRoomIds: ['room-201', 'room-202', 'room-203'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#FEF3C7', // Soft amber
  },
  {
    id: 'sub-cs102',
    code: 'CS102',
    name: 'Digital Logic & Computer Organization',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    divisionIds: ['div-cmpn-fy-a', 'div-cmpn-fy-b'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-mehta', 'fac-verma'],
    permittedRoomIds: ['room-201', 'room-202'],
    requiredRoomType: 'Electronics Lab',
    hasBatches: true,
    isShared: false,
    color: '#ECFDF5', // Soft emerald
  },
  {
    id: 'sub-cs103',
    code: 'CS103',
    name: 'Object Oriented Programming in C++',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    divisionIds: ['div-cmpn-fy-a', 'div-cmpn-fy-b'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-deshmukh', 'fac-bhat'],
    permittedRoomIds: ['room-201', 'room-202'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#F3E8FF', // Soft purple
  },
  {
    id: 'sub-cs104',
    code: 'CS104',
    name: 'Applied Physics & Semiconductor Devices',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    divisionIds: ['div-cmpn-fy-a', 'div-cmpn-fy-b'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-menon'],
    permittedRoomIds: ['room-201', 'room-203'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#E0F2FE', // Soft sky blue
  },
  {
    id: 'sub-cs105',
    code: 'CS105',
    name: 'Professional Communication & Ethics',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    divisionIds: ['div-cmpn-fy-a', 'div-cmpn-fy-b'],
    theorySessionsPerWeek: 2,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-menon'],
    permittedRoomIds: ['room-201', 'room-202'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#FCE7F3', // Soft rose
  },

  // ================= SY CMPN =================
  {
    id: 'sub-cs201',
    code: 'CS201',
    name: 'Database Management Systems',
    branchId: 'branch-cmpn',
    academicYear: 'SY',
    divisionIds: ['div-cmpn-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-bhat', 'fac-sharma'],
    permittedRoomIds: ['room-203', 'room-204'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#FEF3C7', // Soft amber
  },
  {
    id: 'sub-cs202',
    code: 'CS202',
    name: 'Operating Systems & System Programming',
    branchId: 'branch-cmpn',
    academicYear: 'SY',
    divisionIds: ['div-cmpn-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-mehta'],
    permittedRoomIds: ['room-203', 'room-204'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#EEF2FF', // Soft indigo
  },
  {
    id: 'sub-cs203',
    code: 'CS203',
    name: 'Computer Networks & Security Protocols',
    branchId: 'branch-cmpn',
    academicYear: 'SY',
    divisionIds: ['div-cmpn-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-reddy', 'fac-deshmukh'],
    permittedRoomIds: ['room-203', 'room-204'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#ECFDF5', // Soft emerald
  },
  {
    id: 'sub-cs204',
    code: 'CS204',
    name: 'Theory of Computation & Automata',
    branchId: 'branch-cmpn',
    academicYear: 'SY',
    divisionIds: ['div-cmpn-sy-a'],
    theorySessionsPerWeek: 4,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-iyer'],
    permittedRoomIds: ['room-203', 'room-204'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#F3E8FF', // Soft purple
  },
  {
    id: 'sub-cs205',
    code: 'CS205',
    name: 'Software Engineering & Agile Methodologies',
    branchId: 'branch-cmpn',
    academicYear: 'SY',
    divisionIds: ['div-cmpn-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-bose'],
    permittedRoomIds: ['room-203', 'room-204'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#CCFBF1', // Soft teal
  },

  // ================= TY CMPN =================
  {
    id: 'sub-cs301',
    code: 'CS301',
    name: 'Artificial Intelligence & Machine Learning',
    branchId: 'branch-cmpn',
    academicYear: 'TY',
    divisionIds: ['div-cmpn-ty-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-bose', 'fac-sharma'],
    permittedRoomIds: ['room-204', 'room-205'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#EEF2FF', // Soft indigo
  },
  {
    id: 'sub-cs302',
    code: 'CS302',
    name: 'Cloud Computing & Virtualization',
    branchId: 'branch-cmpn',
    academicYear: 'TY',
    divisionIds: ['div-cmpn-ty-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-mehta'],
    permittedRoomIds: ['room-204', 'room-205'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#E0F2FE', // Soft sky blue
  },
  {
    id: 'sub-cs303',
    code: 'CS303',
    name: 'Cryptography & Cyber Security',
    branchId: 'branch-cmpn',
    academicYear: 'TY',
    divisionIds: ['div-cmpn-ty-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-reddy'],
    permittedRoomIds: ['room-204', 'room-205'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#ECFDF5', // Soft emerald
  },
  {
    id: 'sub-cs304',
    code: 'CS304',
    name: 'Distributed Systems & Microservices',
    branchId: 'branch-cmpn',
    academicYear: 'TY',
    divisionIds: ['div-cmpn-ty-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-bhat'],
    permittedRoomIds: ['room-204', 'room-205'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#FEF3C7', // Soft amber
  },
  {
    id: 'sub-cs305',
    code: 'CS305',
    name: 'Mobile Application Architecture & Flutter',
    branchId: 'branch-cmpn',
    academicYear: 'TY',
    divisionIds: ['div-cmpn-ty-a'],
    theorySessionsPerWeek: 2,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-reddy'],
    permittedRoomIds: ['room-204', 'room-205'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#FCE7F3', // Soft rose
  },

  // ================= FY IT =================
  {
    id: 'sub-it101',
    code: 'IT101',
    name: 'Object-Oriented Programming in Java',
    branchId: 'branch-it',
    academicYear: 'FY',
    divisionIds: ['div-it-fy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-kulkarni', 'fac-sen'],
    permittedRoomIds: ['room-202', 'room-205'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#EEF2FF',
  },
  {
    id: 'sub-ma102',
    code: 'MA102',
    name: 'Discrete Mathematics & Graph Theory',
    branchId: 'branch-it',
    academicYear: 'FY',
    divisionIds: ['div-it-fy-a'],
    theorySessionsPerWeek: 4,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-iyer'],
    permittedRoomIds: ['room-202', 'room-205'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#FEF3C7',
  },
  {
    id: 'sub-it102',
    code: 'IT102',
    name: 'Computer Architecture & Organization',
    branchId: 'branch-it',
    academicYear: 'FY',
    divisionIds: ['div-it-fy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-patil'],
    permittedRoomIds: ['room-202', 'room-205'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#ECFDF5',
  },
  {
    id: 'sub-it103',
    code: 'IT103',
    name: 'Python Programming & Scripting',
    branchId: 'branch-it',
    academicYear: 'FY',
    divisionIds: ['div-it-fy-a'],
    theorySessionsPerWeek: 2,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-nair'],
    permittedRoomIds: ['room-202', 'room-205'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#CCFBF1',
  },
  {
    id: 'sub-it104',
    code: 'IT104',
    name: 'Engineering Physics for IT',
    branchId: 'branch-it',
    academicYear: 'FY',
    divisionIds: ['div-it-fy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-menon'],
    permittedRoomIds: ['room-202', 'room-205'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#E0F2FE',
  },

  // ================= SY IT =================
  {
    id: 'sub-it201',
    code: 'IT201',
    name: 'Data Structures with Java Collections',
    branchId: 'branch-it',
    academicYear: 'SY',
    divisionIds: ['div-it-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-kulkarni'],
    permittedRoomIds: ['room-205', 'room-206'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#EEF2FF',
  },
  {
    id: 'sub-it202',
    code: 'IT202',
    name: 'Database Engineering & NoSQL',
    branchId: 'branch-it',
    academicYear: 'SY',
    divisionIds: ['div-it-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-patil'],
    permittedRoomIds: ['room-205', 'room-206'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#FEF3C7',
  },
  {
    id: 'sub-it203',
    code: 'IT203',
    name: 'Data Communication & Networking',
    branchId: 'branch-it',
    academicYear: 'SY',
    divisionIds: ['div-it-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-patil'],
    permittedRoomIds: ['room-205', 'room-206'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#ECFDF5',
  },
  {
    id: 'sub-it204',
    code: 'IT204',
    name: 'Modern Web Development (React & Node)',
    branchId: 'branch-it',
    academicYear: 'SY',
    divisionIds: ['div-it-sy-a'],
    theorySessionsPerWeek: 2,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-sen', 'fac-nair'],
    permittedRoomIds: ['room-205', 'room-206'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#F3E8FF',
  },

  // ================= TY IT =================
  {
    id: 'sub-it301',
    code: 'IT301',
    name: 'Design and Analysis of Algorithms',
    branchId: 'branch-it',
    academicYear: 'TY',
    divisionIds: ['div-it-ty-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-sharma', 'fac-kulkarni'],
    permittedRoomIds: ['room-202', 'room-203'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#ECFDF5',
  },
  {
    id: 'sub-it302',
    code: 'IT302',
    name: 'Distributed Operating Systems',
    branchId: 'branch-it',
    academicYear: 'TY',
    divisionIds: ['div-it-ty-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-kulkarni'],
    permittedRoomIds: ['room-202', 'room-204'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#E0F2FE',
  },
  {
    id: 'sub-it303',
    code: 'IT303',
    name: 'Big Data Analytics & Spark',
    branchId: 'branch-it',
    academicYear: 'TY',
    divisionIds: ['div-it-ty-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-patil'],
    permittedRoomIds: ['room-202', 'room-204'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#FEF3C7',
  },
  {
    id: 'sub-it304',
    code: 'IT304',
    name: 'DevOps & Cloud Native Architecture',
    branchId: 'branch-it',
    academicYear: 'TY',
    divisionIds: ['div-it-ty-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-nair'],
    permittedRoomIds: ['room-202', 'room-204'],
    requiredRoomType: 'Computer Lab',
    hasBatches: true,
    isShared: false,
    color: '#F3E8FF',
  },
  {
    id: 'sub-it305',
    code: 'IT305',
    name: 'Cyber Forensics & Incident Response',
    branchId: 'branch-it',
    academicYear: 'TY',
    divisionIds: ['div-it-ty-a'],
    theorySessionsPerWeek: 2,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-sen'],
    permittedRoomIds: ['room-202', 'room-204'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#FCE7F3',
  },

  // ================= SY EXTC =================
  {
    id: 'sub-ec201',
    code: 'EC201',
    name: 'Microprocessors and Interfacing',
    branchId: 'branch-extc',
    academicYear: 'SY',
    divisionIds: ['div-extc-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-verma', 'fac-choudhury'],
    permittedRoomIds: ['room-203', 'room-204'],
    requiredRoomType: 'Electronics Lab',
    hasBatches: true,
    isShared: false,
    color: '#FFEDD5',
  },
  {
    id: 'sub-ec202',
    code: 'EC202',
    name: 'Signals and Linear Systems',
    branchId: 'branch-extc',
    academicYear: 'SY',
    divisionIds: ['div-extc-sy-a'],
    theorySessionsPerWeek: 4,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-verma'],
    permittedRoomIds: ['room-203', 'room-204'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#FEF3C7',
  },
  {
    id: 'sub-ec203',
    code: 'EC203',
    name: 'Analog Circuit Design',
    branchId: 'branch-extc',
    academicYear: 'SY',
    divisionIds: ['div-extc-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-choudhury'],
    permittedRoomIds: ['room-203', 'room-204'],
    requiredRoomType: 'Electronics Lab',
    hasBatches: true,
    isShared: false,
    color: '#ECFDF5',
  },
  {
    id: 'sub-ec204',
    code: 'EC204',
    name: 'Electromagnetic Engineering',
    branchId: 'branch-extc',
    academicYear: 'SY',
    divisionIds: ['div-extc-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-choudhury'],
    permittedRoomIds: ['room-203', 'room-204'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#E0F2FE',
  },

  // ================= SY MECH =================
  {
    id: 'sub-me201',
    code: 'ME201',
    name: 'Computer-Aided Machine Drawing',
    branchId: 'branch-mech',
    academicYear: 'SY',
    divisionIds: ['div-mech-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-joshi', 'fac-gupta'],
    permittedRoomIds: ['room-201', 'room-204'],
    requiredRoomType: 'Mechanical Lab',
    hasBatches: true,
    isShared: false,
    color: '#CCFBF1',
  },
  {
    id: 'sub-me202',
    code: 'ME202',
    name: 'Thermodynamics & Heat Transfer',
    branchId: 'branch-mech',
    academicYear: 'SY',
    divisionIds: ['div-mech-sy-a'],
    theorySessionsPerWeek: 4,
    practicalSessionsPerWeek: 0,
    practicalSlotDuration: 0,
    eligibleFacultyIds: ['fac-joshi', 'fac-gupta'],
    permittedRoomIds: ['room-201', 'room-204'],
    requiredRoomType: 'Classroom',
    hasBatches: false,
    isShared: false,
    color: '#FEF3C7',
  },
  {
    id: 'sub-me203',
    code: 'ME203',
    name: 'Fluid Mechanics & Machinery',
    branchId: 'branch-mech',
    academicYear: 'SY',
    divisionIds: ['div-mech-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-joshi'],
    permittedRoomIds: ['room-201', 'room-204'],
    requiredRoomType: 'Mechanical Lab',
    hasBatches: true,
    isShared: false,
    color: '#EEF2FF',
  },
  {
    id: 'sub-me204',
    code: 'ME204',
    name: 'Manufacturing Processes & Metallurgy',
    branchId: 'branch-mech',
    academicYear: 'SY',
    divisionIds: ['div-mech-sy-a'],
    theorySessionsPerWeek: 3,
    practicalSessionsPerWeek: 1,
    practicalSlotDuration: 2,
    eligibleFacultyIds: ['fac-gupta'],
    permittedRoomIds: ['room-201', 'room-204'],
    requiredRoomType: 'Mechanical Lab',
    hasBatches: true,
    isShared: false,
    color: '#FFEDD5',
  },
];

export const DEMO_USERS: User[] = [
  // Admin
  {
    id: 'user-admin',
    name: 'Dr. Arvind Rao',
    email: 'admin@samaysetu.edu',
    role: 'admin',
    department: 'Academic Deanery',
  },
  // All 16 Faculty Members with Direct Logins
  {
    id: 'user-teacher-sharma',
    name: 'Prof. Ramesh Sharma',
    email: 'sharma@samaysetu.edu',
    role: 'teacher',
    department: 'Computer Science',
    facultyId: 'fac-sharma',
  },
  {
    id: 'user-teacher-mehta',
    name: 'Prof. Priya Mehta',
    email: 'mehta@samaysetu.edu',
    role: 'teacher',
    department: 'Computer Science',
    facultyId: 'fac-mehta',
  },
  {
    id: 'user-teacher-kulkarni',
    name: 'Dr. Rajesh Kulkarni',
    email: 'kulkarni@samaysetu.edu',
    role: 'teacher',
    department: 'Information Technology',
    facultyId: 'fac-kulkarni',
  },
  {
    id: 'user-teacher-deshmukh',
    name: 'Prof. Sunita Deshmukh',
    email: 'deshmukh@samaysetu.edu',
    role: 'teacher',
    department: 'Computer Science',
    facultyId: 'fac-deshmukh',
  },
  {
    id: 'user-teacher-patil',
    name: 'Prof. Rohan Patil',
    email: 'patil@samaysetu.edu',
    role: 'teacher',
    department: 'Information Technology',
    facultyId: 'fac-patil',
  },
  {
    id: 'user-teacher-verma',
    name: 'Prof. Amit Verma',
    email: 'verma@samaysetu.edu',
    role: 'teacher',
    department: 'Electronics',
    facultyId: 'fac-verma',
  },
  {
    id: 'user-teacher-iyer',
    name: 'Prof. Sneha Iyer',
    email: 'iyer@samaysetu.edu',
    role: 'teacher',
    department: 'Applied Mathematics',
    facultyId: 'fac-iyer',
  },
  {
    id: 'user-teacher-joshi',
    name: 'Prof. Vikram Joshi',
    email: 'joshi@samaysetu.edu',
    role: 'teacher',
    department: 'Mechanical Sciences',
    facultyId: 'fac-joshi',
  },
  {
    id: 'user-teacher-bose',
    name: 'Dr. Ananya Bose',
    email: 'bose@samaysetu.edu',
    role: 'teacher',
    department: 'Computer Science',
    facultyId: 'fac-bose',
  },
  {
    id: 'user-teacher-nair',
    name: 'Prof. Siddharth Nair',
    email: 'nair@samaysetu.edu',
    role: 'teacher',
    department: 'Information Technology',
    facultyId: 'fac-nair',
  },
  {
    id: 'user-teacher-reddy',
    name: 'Prof. Kavita Reddy',
    email: 'reddy@samaysetu.edu',
    role: 'teacher',
    department: 'Computer Science',
    facultyId: 'fac-reddy',
  },
  {
    id: 'user-teacher-choudhury',
    name: 'Dr. Arpan Choudhury',
    email: 'choudhury@samaysetu.edu',
    role: 'teacher',
    department: 'Electronics',
    facultyId: 'fac-choudhury',
  },
  {
    id: 'user-teacher-sen',
    name: 'Prof. Tanvi Sen',
    email: 'sen@samaysetu.edu',
    role: 'teacher',
    department: 'Information Technology',
    facultyId: 'fac-sen',
  },
  {
    id: 'user-teacher-bhat',
    name: 'Prof. Manoj Bhat',
    email: 'bhat@samaysetu.edu',
    role: 'teacher',
    department: 'Computer Science',
    facultyId: 'fac-bhat',
  },
  {
    id: 'user-teacher-menon',
    name: 'Dr. Radhika Menon',
    email: 'menon@samaysetu.edu',
    role: 'teacher',
    department: 'Basic Sciences',
    facultyId: 'fac-menon',
  },
  {
    id: 'user-teacher-gupta',
    name: 'Prof. Alok Gupta',
    email: 'gupta@samaysetu.edu',
    role: 'teacher',
    department: 'Mechanical Sciences',
    facultyId: 'fac-gupta',
  },
  // Students
  {
    id: 'user-student-aarav',
    name: 'Aarav Patel',
    email: 'aarav@student.samaysetu.edu',
    role: 'student',
    studentId: 'stud-101',
    divisionId: 'div-cmpn-fy-a',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    rollNumber: 'FY-CMPN-101',
  },
  {
    id: 'user-student-rohan',
    name: 'Rohan Shah',
    email: 'rohan@student.samaysetu.edu',
    role: 'student',
    studentId: 'stud-201',
    divisionId: 'div-cmpn-sy-a',
    branchId: 'branch-cmpn',
    academicYear: 'SY',
    rollNumber: 'SY-CMPN-201',
  },
  {
    id: 'user-student-neha',
    name: 'Neha Joshi',
    email: 'neha@student.samaysetu.edu',
    role: 'student',
    studentId: 'stud-312',
    divisionId: 'div-it-ty-a',
    branchId: 'branch-it',
    academicYear: 'TY',
    rollNumber: 'TY-IT-312',
  },
  {
    id: 'user-student-priya',
    name: 'Priya Nair',
    email: 'priya@student.samaysetu.edu',
    role: 'student',
    studentId: 'stud-extc-201',
    divisionId: 'div-extc-sy-a',
    branchId: 'branch-extc',
    academicYear: 'SY',
    rollNumber: 'SY-EXTC-201',
  },
  {
    id: 'user-student-karan',
    name: 'Karan Verma',
    email: 'karan@student.samaysetu.edu',
    role: 'student',
    studentId: 'stud-mech-201',
    divisionId: 'div-mech-sy-a',
    branchId: 'branch-mech',
    academicYear: 'SY',
    rollNumber: 'SY-MECH-201',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stud-101',
    rollNumber: 'FY-CMPN-101',
    name: 'Aarav Patel',
    email: 'aarav@student.samaysetu.edu',
    divisionId: 'div-cmpn-fy-a',
    batchId: 'batch-cmpn-fy-a-1',
    batchName: 'A1',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    phone: '+91 98201 44521',
  },
  {
    id: 'stud-102',
    rollNumber: 'FY-CMPN-102',
    name: 'Diya Shenoy',
    email: 'diya@student.samaysetu.edu',
    divisionId: 'div-cmpn-fy-a',
    batchId: 'batch-cmpn-fy-a-1',
    batchName: 'A1',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    phone: '+91 98202 55123',
  },
  {
    id: 'stud-103',
    rollNumber: 'FY-CMPN-103',
    name: 'Kabir Malhotra',
    email: 'kabir@student.samaysetu.edu',
    divisionId: 'div-cmpn-fy-a',
    batchId: 'batch-cmpn-fy-a-2',
    batchName: 'A2',
    branchId: 'branch-cmpn',
    academicYear: 'FY',
    phone: '+91 98203 66789',
  },
  {
    id: 'stud-201',
    rollNumber: 'SY-CMPN-201',
    name: 'Rohan Shah',
    email: 'rohan@student.samaysetu.edu',
    divisionId: 'div-cmpn-sy-a',
    batchId: 'batch-cmpn-sy-a-1',
    batchName: 'A1',
    branchId: 'branch-cmpn',
    academicYear: 'SY',
    phone: '+91 98204 88991',
  },
  {
    id: 'stud-312',
    rollNumber: 'TY-IT-312',
    name: 'Neha Joshi',
    email: 'neha@student.samaysetu.edu',
    divisionId: 'div-it-ty-a',
    batchId: 'batch-it-ty-a-1',
    batchName: 'A1',
    branchId: 'branch-it',
    academicYear: 'TY',
    phone: '+91 98301 22334',
  },
  {
    id: 'stud-extc-201',
    rollNumber: 'SY-EXTC-201',
    name: 'Priya Nair',
    email: 'priya@student.samaysetu.edu',
    divisionId: 'div-extc-sy-a',
    batchId: 'batch-extc-sy-a-1',
    batchName: 'A1',
    branchId: 'branch-extc',
    academicYear: 'SY',
    phone: '+91 98302 33445',
  },
  {
    id: 'stud-mech-201',
    rollNumber: 'SY-MECH-201',
    name: 'Karan Verma',
    email: 'karan@student.samaysetu.edu',
    divisionId: 'div-mech-sy-a',
    batchId: 'batch-mech-sy-a-1',
    batchName: 'A1',
    branchId: 'branch-mech',
    academicYear: 'SY',
    phone: '+91 98303 55667',
  },
];

// Rich, Comprehensive Pre-Seeded Schedule for All Active Divisions & Teachers
// Ensures zero empty timetables across all portals
export function generateFullMasterSchedule(): ScheduleAssignment[] {
  const assignments: ScheduleAssignment[] = [];
  let idCounter = 1;

  const add = (
    subCode: string,
    subName: string,
    type: 'Theory' | 'Practical',
    branchId: string,
    divId: string,
    divName: string,
    facId: string,
    facName: string,
    roomId: string,
    roomNo: string,
    roomName: string,
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday',
    startSlot: number,
    duration: number,
    timeRange: string,
    batchName?: string
  ) => {
    assignments.push({
      id: `asg-${idCounter++}`,
      requiredSessionId: `req-${idCounter}`,
      subjectId: `sub-${subCode.toLowerCase()}`,
      subjectCode: subCode,
      subjectName: subName,
      sessionType: type,
      branchId,
      academicYear: divName.startsWith('FY') ? 'FY' : divName.startsWith('SY') ? 'SY' : 'TY',
      divisionId: divId,
      divisionName: divName,
      participatingDivisionIds: [divId],
      facultyId: facId,
      facultyName: facName,
      roomId,
      roomNumber: roomNo,
      roomName,
      day,
      startSlotIndex: startSlot,
      durationSlots: duration,
      timeRange,
      batchName,
    });
  };

  // ================= 1. FY CMPN Div A =================
  // Mon
  add('CS101', 'Data Structures & Algorithms', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Monday', 0, 1, '09:00 - 10:00');
  add('MA101', 'Applied Mathematics I', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Monday', 1, 1, '10:00 - 11:00');
  add('CS102', 'Digital Logic & Computer Org', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Monday', 2, 1, '11:15 - 12:15');
  add('CS103', 'OOP in C++', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-deshmukh', 'Prof. Sunita Deshmukh', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Monday', 3, 1, '12:15 - 13:15');
  add('CS101', 'Data Structures Lab (A1)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'lab-101', 'LAB-101', 'Advanced Computing Lab 1', 'Monday', 4, 2, '14:00 - 16:00', 'A1');
  add('CS103', 'C++ Programming Lab (A2)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'lab-102', 'LAB-102', 'Software Engineering Lab 2', 'Monday', 4, 2, '14:00 - 16:00', 'A2');
  add('CS105', 'Technical Communication', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-menon', 'Dr. Radhika Menon', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Monday', 6, 1, '16:00 - 17:00');

  // Tue
  add('MA101', 'Applied Mathematics I', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Tuesday', 0, 1, '09:00 - 10:00');
  add('CS104', 'Applied Physics', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-menon', 'Dr. Radhika Menon', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Tuesday', 1, 1, '10:00 - 11:00');
  add('CS101', 'Data Structures & Algorithms', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Tuesday', 2, 1, '11:15 - 12:15');
  add('CS102', 'Digital Logic & Computer Org', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Tuesday', 3, 1, '12:15 - 13:15');
  add('CS102', 'Digital Logic Lab (A1)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'lab-103', 'LAB-103', 'Microprocessor Lab', 'Tuesday', 4, 2, '14:00 - 16:00', 'A1');
  add('CS101', 'Data Structures Lab (A2)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'lab-101', 'LAB-101', 'Advanced Computing Lab 1', 'Tuesday', 4, 2, '14:00 - 16:00', 'A2');

  // Wed
  add('CS103', 'OOP in C++', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-deshmukh', 'Prof. Sunita Deshmukh', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Wednesday', 0, 1, '09:00 - 10:00');
  add('CS104', 'Applied Physics', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-menon', 'Dr. Radhika Menon', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Wednesday', 1, 1, '10:00 - 11:00');
  add('MA101', 'Applied Mathematics I', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Wednesday', 2, 1, '11:15 - 12:15');
  add('CS101', 'Data Structures & Algorithms', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Wednesday', 3, 1, '12:15 - 13:15');
  add('CS103', 'C++ Programming Lab (A1)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'lab-101', 'LAB-101', 'Advanced Computing Lab 1', 'Wednesday', 4, 2, '14:00 - 16:00', 'A1');
  add('CS102', 'Digital Logic Lab (A2)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-verma', 'Prof. Amit Verma', 'lab-103', 'LAB-103', 'Microprocessor Lab', 'Wednesday', 4, 2, '14:00 - 16:00', 'A2');

  // Thu
  add('CS102', 'Digital Logic & Computer Org', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Thursday', 0, 1, '09:00 - 10:00');
  add('CS103', 'OOP in C++', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-deshmukh', 'Prof. Sunita Deshmukh', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Thursday', 1, 1, '10:00 - 11:00');
  add('MA101', 'Applied Mathematics I', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Thursday', 2, 1, '11:15 - 12:15');
  add('CS104', 'Applied Physics', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-menon', 'Dr. Radhika Menon', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Thursday', 3, 1, '12:15 - 13:15');
  add('CS105', 'Technical Communication', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-menon', 'Dr. Radhika Menon', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Thursday', 4, 1, '14:00 - 15:00');

  // Fri
  add('CS101', 'Data Structures & Algorithms', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-bose', 'Dr. Ananya Bose', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Friday', 0, 1, '09:00 - 10:00');
  add('CS102', 'Digital Logic & Computer Org', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Friday', 1, 1, '10:00 - 11:00');
  add('CS103', 'OOP in C++', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-deshmukh', 'Prof. Sunita Deshmukh', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Friday', 2, 1, '11:15 - 12:15');
  add('MA101', 'Applied Mathematics Tutorial', 'Theory', 'branch-cmpn', 'div-cmpn-fy-a', 'FY-CMPN Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-201', 'CR-201', 'Smart Lecture Hall 201', 'Friday', 3, 1, '12:15 - 13:15');

  // ================= 2. FY CMPN Div B =================
  // Mon
  add('CS102', 'Digital Logic & Computer Org', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-verma', 'Prof. Amit Verma', 'room-202', 'CR-202', 'Lecture Hall 202', 'Monday', 0, 1, '09:00 - 10:00');
  add('CS101', 'Data Structures & Algorithms', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-bose', 'Dr. Ananya Bose', 'room-202', 'CR-202', 'Lecture Hall 202', 'Monday', 1, 1, '10:00 - 11:00');
  add('MA101', 'Applied Mathematics I', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-iyer', 'Prof. Sneha Iyer', 'room-202', 'CR-202', 'Lecture Hall 202', 'Monday', 2, 1, '11:15 - 12:15');
  add('CS104', 'Applied Physics', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-menon', 'Dr. Radhika Menon', 'room-202', 'CR-202', 'Lecture Hall 202', 'Monday', 3, 1, '12:15 - 13:15');
  // Tue
  add('CS103', 'OOP in C++', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-bhat', 'Prof. Manoj Bhat', 'room-202', 'CR-202', 'Lecture Hall 202', 'Tuesday', 0, 1, '09:00 - 10:00');
  add('CS101', 'Data Structures & Algorithms', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-bose', 'Dr. Ananya Bose', 'room-202', 'CR-202', 'Lecture Hall 202', 'Tuesday', 1, 1, '10:00 - 11:00');
  add('CS102', 'Digital Logic Lab (B1)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-verma', 'Prof. Amit Verma', 'lab-103', 'LAB-103', 'Microprocessor Lab', 'Tuesday', 4, 2, '14:00 - 16:00', 'B1');
  add('CS101', 'Data Structures Lab (B2)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-bose', 'Dr. Ananya Bose', 'lab-102', 'LAB-102', 'Software Engineering Lab 2', 'Tuesday', 4, 2, '14:00 - 16:00', 'B2');
  // Wed
  add('MA101', 'Applied Mathematics I', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-iyer', 'Prof. Sneha Iyer', 'room-202', 'CR-202', 'Lecture Hall 202', 'Wednesday', 0, 1, '09:00 - 10:00');
  add('CS103', 'OOP in C++', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-bhat', 'Prof. Manoj Bhat', 'room-202', 'CR-202', 'Lecture Hall 202', 'Wednesday', 1, 1, '10:00 - 11:00');
  add('CS104', 'Applied Physics', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-menon', 'Dr. Radhika Menon', 'room-202', 'CR-202', 'Lecture Hall 202', 'Wednesday', 2, 1, '11:15 - 12:15');
  // Thu
  add('CS101', 'Data Structures Lab (B1)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-bose', 'Dr. Ananya Bose', 'lab-101', 'LAB-101', 'Advanced Computing Lab 1', 'Thursday', 4, 2, '14:00 - 16:00', 'B1');
  add('CS103', 'C++ Programming Lab (B2)', 'Practical', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-bhat', 'Prof. Manoj Bhat', 'lab-102', 'LAB-102', 'Software Engineering Lab 2', 'Thursday', 4, 2, '14:00 - 16:00', 'B2');
  // Fri
  add('CS104', 'Applied Physics', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-menon', 'Dr. Radhika Menon', 'room-202', 'CR-202', 'Lecture Hall 202', 'Friday', 0, 1, '09:00 - 10:00');
  add('CS101', 'Data Structures & Algorithms', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-bose', 'Dr. Ananya Bose', 'room-202', 'CR-202', 'Lecture Hall 202', 'Friday', 1, 1, '10:00 - 11:00');
  add('CS105', 'Technical Communication', 'Theory', 'branch-cmpn', 'div-cmpn-fy-b', 'FY-CMPN Div B', 'fac-menon', 'Dr. Radhika Menon', 'room-202', 'CR-202', 'Lecture Hall 202', 'Friday', 2, 1, '11:15 - 12:15');

  // ================= 3. SY CMPN Div A =================
  // Mon
  add('CS201', 'Database Management Systems', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'room-203', 'CR-203', 'Lecture Hall 203', 'Monday', 0, 1, '09:00 - 10:00');
  add('CS202', 'Operating Systems', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-203', 'CR-203', 'Lecture Hall 203', 'Monday', 1, 1, '10:00 - 11:00');
  add('CS203', 'Computer Networks & Security', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'room-203', 'CR-203', 'Lecture Hall 203', 'Monday', 2, 1, '11:15 - 12:15');
  add('CS204', 'Theory of Computation', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-203', 'CR-203', 'Lecture Hall 203', 'Monday', 3, 1, '12:15 - 13:15');
  add('CS201', 'DBMS Practical Lab (A1)', 'Practical', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'lab-106', 'LAB-106', 'Database & Cloud Lab', 'Monday', 4, 2, '14:00 - 16:00', 'A1');
  add('CS202', 'OS Kernel Lab (A2)', 'Practical', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'lab-101', 'LAB-101', 'Advanced Computing Lab 1', 'Monday', 4, 2, '14:00 - 16:00', 'A2');

  // Tue
  add('CS204', 'Theory of Computation', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-203', 'CR-203', 'Lecture Hall 203', 'Tuesday', 0, 1, '09:00 - 10:00');
  add('CS205', 'Software Engineering & Agile', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-bose', 'Dr. Ananya Bose', 'room-203', 'CR-203', 'Lecture Hall 203', 'Tuesday', 1, 1, '10:00 - 11:00');
  add('CS201', 'Database Management Systems', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'room-203', 'CR-203', 'Lecture Hall 203', 'Tuesday', 2, 1, '11:15 - 12:15');
  add('CS203', 'Computer Networks & Security', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'room-203', 'CR-203', 'Lecture Hall 203', 'Tuesday', 3, 1, '12:15 - 13:15');
  add('CS203', 'Networks Wireshark Lab (A1)', 'Practical', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'lab-105', 'LAB-105', 'Networks & Security Lab', 'Tuesday', 4, 2, '14:00 - 16:00', 'A1');
  add('CS201', 'DBMS Practical Lab (A2)', 'Practical', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'lab-106', 'LAB-106', 'Database & Cloud Lab', 'Tuesday', 4, 2, '14:00 - 16:00', 'A2');

  // Wed
  add('CS202', 'Operating Systems', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-203', 'CR-203', 'Lecture Hall 203', 'Wednesday', 0, 1, '09:00 - 10:00');
  add('CS204', 'Theory of Computation', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-203', 'CR-203', 'Lecture Hall 203', 'Wednesday', 1, 1, '10:00 - 11:00');
  add('CS205', 'Software Engineering & Agile', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-bose', 'Dr. Ananya Bose', 'room-203', 'CR-203', 'Lecture Hall 203', 'Wednesday', 2, 1, '11:15 - 12:15');
  add('CS201', 'Database Management Systems', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'room-203', 'CR-203', 'Lecture Hall 203', 'Wednesday', 3, 1, '12:15 - 13:15');

  // Thu
  add('CS203', 'Computer Networks & Security', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'room-203', 'CR-203', 'Lecture Hall 203', 'Thursday', 0, 1, '09:00 - 10:00');
  add('CS202', 'Operating Systems', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-203', 'CR-203', 'Lecture Hall 203', 'Thursday', 1, 1, '10:00 - 11:00');
  add('CS205', 'Software Engineering & Agile', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-bose', 'Dr. Ananya Bose', 'room-203', 'CR-203', 'Lecture Hall 203', 'Thursday', 2, 1, '11:15 - 12:15');
  add('CS204', 'Theory of Computation', 'Theory', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-203', 'CR-203', 'Lecture Hall 203', 'Thursday', 3, 1, '12:15 - 13:15');

  // Fri
  add('CS202', 'OS Kernel Lab (A1)', 'Practical', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'lab-101', 'LAB-101', 'Advanced Computing Lab 1', 'Friday', 4, 2, '14:00 - 16:00', 'A1');
  add('CS203', 'Networks Wireshark Lab (A2)', 'Practical', 'branch-cmpn', 'div-cmpn-sy-a', 'SY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'lab-105', 'LAB-105', 'Networks & Security Lab', 'Friday', 4, 2, '14:00 - 16:00', 'A2');

  // ================= 4. TY CMPN Div A =================
  // Mon
  add('CS301', 'Artificial Intelligence & ML', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-bose', 'Dr. Ananya Bose', 'room-204', 'CR-204', 'Lecture Hall 204', 'Monday', 0, 1, '09:00 - 10:00');
  add('CS302', 'Cloud Computing & Virtualization', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-204', 'CR-204', 'Lecture Hall 204', 'Monday', 1, 1, '10:00 - 11:00');
  add('CS303', 'Cryptography & Security', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'room-204', 'CR-204', 'Lecture Hall 204', 'Monday', 2, 1, '11:15 - 12:15');
  add('CS304', 'Distributed Systems', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'room-204', 'CR-204', 'Lecture Hall 204', 'Monday', 3, 1, '12:15 - 13:15');
  add('CS301', 'AI & PyTorch Lab (A1)', 'Practical', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-bose', 'Dr. Ananya Bose', 'lab-102', 'LAB-102', 'Software Engineering & AI Lab', 'Monday', 4, 2, '14:00 - 16:00', 'A1');
  add('CS302', 'Cloud AWS Lab (A2)', 'Practical', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'lab-105', 'LAB-105', 'Networks & Security Lab', 'Monday', 4, 2, '14:00 - 16:00', 'A2');

  // Tue
  add('CS304', 'Distributed Systems', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'room-204', 'CR-204', 'Lecture Hall 204', 'Tuesday', 0, 1, '09:00 - 10:00');
  add('CS301', 'Artificial Intelligence & ML', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-bose', 'Dr. Ananya Bose', 'room-204', 'CR-204', 'Lecture Hall 204', 'Tuesday', 1, 1, '10:00 - 11:00');
  add('CS305', 'Mobile App Development', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'room-204', 'CR-204', 'Lecture Hall 204', 'Tuesday', 2, 1, '11:15 - 12:15');
  add('CS302', 'Cloud Computing & Virtualization', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-204', 'CR-204', 'Lecture Hall 204', 'Tuesday', 3, 1, '12:15 - 13:15');

  // Wed
  add('CS303', 'Cryptography & Security', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'room-204', 'CR-204', 'Lecture Hall 204', 'Wednesday', 0, 1, '09:00 - 10:00');
  add('CS304', 'Distributed Systems', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-bhat', 'Prof. Manoj Bhat', 'room-204', 'CR-204', 'Lecture Hall 204', 'Wednesday', 1, 1, '10:00 - 11:00');
  add('CS301', 'Artificial Intelligence & ML', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-bose', 'Dr. Ananya Bose', 'room-204', 'CR-204', 'Lecture Hall 204', 'Wednesday', 2, 1, '11:15 - 12:15');
  add('CS305', 'Mobile App Development', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'room-204', 'CR-204', 'Lecture Hall 204', 'Wednesday', 3, 1, '12:15 - 13:15');
  add('CS305', 'Flutter Mobile Lab (A1)', 'Practical', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'lab-102', 'LAB-102', 'Software Engineering & AI Lab', 'Wednesday', 4, 2, '14:00 - 16:00', 'A1');
  add('CS303', 'Security Lab (A2)', 'Practical', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-deshmukh', 'Prof. Sunita Deshmukh', 'lab-105', 'LAB-105', 'Networks & Security Lab', 'Wednesday', 4, 2, '14:00 - 16:00', 'A2');

  // Thu
  add('CS302', 'Cloud Computing & Virtualization', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-mehta', 'Prof. Priya Mehta', 'room-204', 'CR-204', 'Lecture Hall 204', 'Thursday', 2, 1, '11:15 - 12:15');
  add('CS303', 'Cryptography & Security', 'Theory', 'branch-cmpn', 'div-cmpn-ty-a', 'TY-CMPN Div A', 'fac-reddy', 'Prof. Kavita Reddy', 'room-204', 'CR-204', 'Lecture Hall 204', 'Thursday', 3, 1, '12:15 - 13:15');

  // ================= 5. TY IT Div A =================
  // Mon
  add('IT301', 'Design & Analysis of Algorithms', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'room-205', 'CR-205', 'Lecture Hall 205', 'Monday', 0, 1, '09:00 - 10:00');
  add('IT302', 'Distributed Operating Systems', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-kulkarni', 'Dr. Rajesh Kulkarni', 'room-205', 'CR-205', 'Lecture Hall 205', 'Monday', 1, 1, '10:00 - 11:00');
  add('IT303', 'Big Data Analytics', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-patil', 'Prof. Rohan Patil', 'room-205', 'CR-205', 'Lecture Hall 205', 'Monday', 2, 1, '11:15 - 12:15');
  add('IT304', 'DevOps & Cloud Architecture', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-nair', 'Prof. Siddharth Nair', 'room-205', 'CR-205', 'Lecture Hall 205', 'Monday', 3, 1, '12:15 - 13:15');
  add('IT301', 'DAA Lab (A1)', 'Practical', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'lab-101', 'LAB-101', 'Advanced Computing Lab 1', 'Monday', 4, 2, '14:00 - 16:00', 'A1');
  add('IT304', 'DevOps CI/CD Lab (A2)', 'Practical', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-nair', 'Prof. Siddharth Nair', 'lab-106', 'LAB-106', 'Database & Cloud Lab', 'Monday', 4, 2, '14:00 - 16:00', 'A2');

  // Tue
  add('IT303', 'Big Data Analytics', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-patil', 'Prof. Rohan Patil', 'room-205', 'CR-205', 'Lecture Hall 205', 'Tuesday', 0, 1, '09:00 - 10:00');
  add('IT301', 'Design & Analysis of Algorithms', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'room-205', 'CR-205', 'Lecture Hall 205', 'Tuesday', 1, 1, '10:00 - 11:00');
  add('IT302', 'Distributed Operating Systems', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-kulkarni', 'Dr. Rajesh Kulkarni', 'room-205', 'CR-205', 'Lecture Hall 205', 'Tuesday', 2, 1, '11:15 - 12:15');
  add('IT305', 'Cyber Forensics', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-sen', 'Prof. Tanvi Sen', 'room-205', 'CR-205', 'Lecture Hall 205', 'Tuesday', 3, 1, '12:15 - 13:15');
  add('IT303', 'Big Data Lab (A1)', 'Practical', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-patil', 'Prof. Rohan Patil', 'lab-106', 'LAB-106', 'Database & Cloud Lab', 'Tuesday', 4, 2, '14:00 - 16:00', 'A1');
  add('IT301', 'DAA Lab (A2)', 'Practical', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'lab-101', 'LAB-101', 'Advanced Computing Lab 1', 'Tuesday', 4, 2, '14:00 - 16:00', 'A2');

  // Wed
  add('IT304', 'DevOps & Cloud Architecture', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-nair', 'Prof. Siddharth Nair', 'room-205', 'CR-205', 'Lecture Hall 205', 'Wednesday', 0, 1, '09:00 - 10:00');
  add('IT302', 'Distributed Operating Systems', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-kulkarni', 'Dr. Rajesh Kulkarni', 'room-205', 'CR-205', 'Lecture Hall 205', 'Wednesday', 1, 1, '10:00 - 11:00');
  add('IT301', 'Design & Analysis of Algorithms', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-sharma', 'Prof. Ramesh Sharma', 'room-205', 'CR-205', 'Lecture Hall 205', 'Wednesday', 2, 1, '11:15 - 12:15');
  add('IT303', 'Big Data Analytics', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-patil', 'Prof. Rohan Patil', 'room-205', 'CR-205', 'Lecture Hall 205', 'Wednesday', 3, 1, '12:15 - 13:15');

  // Thu
  add('IT305', 'Cyber Forensics', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-sen', 'Prof. Tanvi Sen', 'room-205', 'CR-205', 'Lecture Hall 205', 'Thursday', 0, 1, '09:00 - 10:00');
  add('IT304', 'DevOps & Cloud Architecture', 'Theory', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-nair', 'Prof. Siddharth Nair', 'room-205', 'CR-205', 'Lecture Hall 205', 'Thursday', 1, 1, '10:00 - 11:00');
  add('IT302', 'Distributed OS Lab (A1)', 'Practical', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-kulkarni', 'Dr. Rajesh Kulkarni', 'lab-101', 'LAB-101', 'Advanced Computing Lab 1', 'Thursday', 4, 2, '14:00 - 16:00', 'A1');
  add('IT303', 'Big Data Lab (A2)', 'Practical', 'branch-it', 'div-it-ty-a', 'TY-IT Div A', 'fac-patil', 'Prof. Rohan Patil', 'lab-106', 'LAB-106', 'Database & Cloud Lab', 'Thursday', 4, 2, '14:00 - 16:00', 'A2');

  // ================= 6. FY IT Div A =================
  // Mon - Fri
  add('IT101', 'OOP in Java', 'Theory', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-kulkarni', 'Dr. Rajesh Kulkarni', 'room-206', 'CR-206', 'Lecture Hall 206', 'Monday', 0, 1, '09:00 - 10:00');
  add('MA102', 'Discrete Mathematics', 'Theory', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-206', 'CR-206', 'Lecture Hall 206', 'Monday', 1, 1, '10:00 - 11:00');
  add('IT102', 'Computer Architecture', 'Theory', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-patil', 'Prof. Rohan Patil', 'room-206', 'CR-206', 'Lecture Hall 206', 'Monday', 2, 1, '11:15 - 12:15');
  add('IT103', 'Python Programming', 'Theory', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-nair', 'Prof. Siddharth Nair', 'room-206', 'CR-206', 'Lecture Hall 206', 'Monday', 3, 1, '12:15 - 13:15');
  add('IT101', 'Java Programming Lab (A1)', 'Practical', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-kulkarni', 'Dr. Rajesh Kulkarni', 'lab-102', 'LAB-102', 'Software Engineering Lab 2', 'Monday', 4, 2, '14:00 - 16:00', 'A1');
  add('IT103', 'Python Lab (A2)', 'Practical', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-nair', 'Prof. Siddharth Nair', 'lab-106', 'LAB-106', 'Database & Cloud Lab', 'Monday', 4, 2, '14:00 - 16:00', 'A2');

  add('MA102', 'Discrete Mathematics', 'Theory', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-iyer', 'Prof. Sneha Iyer', 'room-206', 'CR-206', 'Lecture Hall 206', 'Tuesday', 0, 1, '09:00 - 10:00');
  add('IT104', 'Applied Physics for IT', 'Theory', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-menon', 'Dr. Radhika Menon', 'room-206', 'CR-206', 'Lecture Hall 206', 'Tuesday', 1, 1, '10:00 - 11:00');
  add('IT101', 'OOP in Java', 'Theory', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-sen', 'Prof. Tanvi Sen', 'room-206', 'CR-206', 'Lecture Hall 206', 'Tuesday', 2, 1, '11:15 - 12:15');
  add('IT102', 'Computer Architecture', 'Theory', 'branch-it', 'div-it-fy-a', 'FY-IT Div A', 'fac-patil', 'Prof. Rohan Patil', 'room-206', 'CR-206', 'Lecture Hall 206', 'Tuesday', 3, 1, '12:15 - 13:15');

  // ================= 7. SY IT Div A =================
  add('IT201', 'Data Structures with Java', 'Theory', 'branch-it', 'div-it-sy-a', 'SY-IT Div A', 'fac-kulkarni', 'Dr. Rajesh Kulkarni', 'room-206', 'CR-206', 'Lecture Hall 206', 'Wednesday', 0, 1, '09:00 - 10:00');
  add('IT202', 'Database Engineering', 'Theory', 'branch-it', 'div-it-sy-a', 'SY-IT Div A', 'fac-patil', 'Prof. Rohan Patil', 'room-206', 'CR-206', 'Lecture Hall 206', 'Wednesday', 1, 1, '10:00 - 11:00');
  add('IT203', 'Networking Protocols', 'Theory', 'branch-it', 'div-it-sy-a', 'SY-IT Div A', 'fac-patil', 'Prof. Rohan Patil', 'room-206', 'CR-206', 'Lecture Hall 206', 'Wednesday', 2, 1, '11:15 - 12:15');
  add('IT204', 'Modern Web Development', 'Theory', 'branch-it', 'div-it-sy-a', 'SY-IT Div A', 'fac-sen', 'Prof. Tanvi Sen', 'room-206', 'CR-206', 'Lecture Hall 206', 'Wednesday', 3, 1, '12:15 - 13:15');
  add('IT201', 'Java DS Lab (A1)', 'Practical', 'branch-it', 'div-it-sy-a', 'SY-IT Div A', 'fac-kulkarni', 'Dr. Rajesh Kulkarni', 'lab-102', 'LAB-102', 'Software Engineering Lab 2', 'Wednesday', 4, 2, '14:00 - 16:00', 'A1');
  add('IT204', 'React & Web Lab (A2)', 'Practical', 'branch-it', 'div-it-sy-a', 'SY-IT Div A', 'fac-sen', 'Prof. Tanvi Sen', 'lab-106', 'LAB-106', 'Database & Cloud Lab', 'Wednesday', 4, 2, '14:00 - 16:00', 'A2');

  // ================= 8. SY EXTC Div A =================
  add('EC201', 'Microprocessors & Interfacing', 'Theory', 'branch-extc', 'div-extc-sy-a', 'SY-EXTC Div A', 'fac-verma', 'Prof. Amit Verma', 'room-205', 'CR-205', 'Lecture Hall 205', 'Thursday', 0, 1, '09:00 - 10:00');
  add('EC202', 'Signals & Linear Systems', 'Theory', 'branch-extc', 'div-extc-sy-a', 'SY-EXTC Div A', 'fac-verma', 'Prof. Amit Verma', 'room-205', 'CR-205', 'Lecture Hall 205', 'Thursday', 1, 1, '10:00 - 11:00');
  add('EC203', 'Analog Circuit Design', 'Theory', 'branch-extc', 'div-extc-sy-a', 'SY-EXTC Div A', 'fac-choudhury', 'Dr. Arpan Choudhury', 'room-205', 'CR-205', 'Lecture Hall 205', 'Thursday', 2, 1, '11:15 - 12:15');
  add('EC204', 'Electromagnetic Engineering', 'Theory', 'branch-extc', 'div-extc-sy-a', 'SY-EXTC Div A', 'fac-choudhury', 'Dr. Arpan Choudhury', 'room-205', 'CR-205', 'Lecture Hall 205', 'Thursday', 3, 1, '12:15 - 13:15');
  add('EC201', 'Microprocessor Lab (A1)', 'Practical', 'branch-extc', 'div-extc-sy-a', 'SY-EXTC Div A', 'fac-verma', 'Prof. Amit Verma', 'lab-103', 'LAB-103', 'Microprocessor Lab', 'Thursday', 4, 2, '14:00 - 16:00', 'A1');
  add('EC203', 'Analog Circuit Lab (A2)', 'Practical', 'branch-extc', 'div-extc-sy-a', 'SY-EXTC Div A', 'fac-choudhury', 'Dr. Arpan Choudhury', 'lab-103', 'LAB-103', 'Microprocessor Lab', 'Friday', 4, 2, '14:00 - 16:00', 'A2');

  // ================= 9. SY MECH Div A =================
  add('ME201', 'Computer-Aided Machine Drawing', 'Theory', 'branch-mech', 'div-mech-sy-a', 'SY-MECH Div A', 'fac-joshi', 'Prof. Vikram Joshi', 'room-204', 'CR-204', 'Lecture Hall 204', 'Friday', 0, 1, '09:00 - 10:00');
  add('ME202', 'Thermodynamics & Heat Transfer', 'Theory', 'branch-mech', 'div-mech-sy-a', 'SY-MECH Div A', 'fac-gupta', 'Prof. Alok Gupta', 'room-204', 'CR-204', 'Lecture Hall 204', 'Friday', 1, 1, '10:00 - 11:00');
  add('ME203', 'Fluid Mechanics & Machinery', 'Theory', 'branch-mech', 'div-mech-sy-a', 'SY-MECH Div A', 'fac-joshi', 'Prof. Vikram Joshi', 'room-204', 'CR-204', 'Lecture Hall 204', 'Friday', 2, 1, '11:15 - 12:15');
  add('ME204', 'Manufacturing Processes', 'Theory', 'branch-mech', 'div-mech-sy-a', 'SY-MECH Div A', 'fac-gupta', 'Prof. Alok Gupta', 'room-204', 'CR-204', 'Lecture Hall 204', 'Friday', 3, 1, '12:15 - 13:15');
  add('ME201', 'CAD/CAM Lab (A1)', 'Practical', 'branch-mech', 'div-mech-sy-a', 'SY-MECH Div A', 'fac-joshi', 'Prof. Vikram Joshi', 'lab-104', 'LAB-104', 'Mechanical CAD/CAM Lab', 'Thursday', 4, 2, '14:00 - 16:00', 'A1');
  add('ME203', 'Fluid Mechanics Lab (A2)', 'Practical', 'branch-mech', 'div-mech-sy-a', 'SY-MECH Div A', 'fac-gupta', 'Prof. Alok Gupta', 'lab-104', 'LAB-104', 'Mechanical CAD/CAM Lab', 'Friday', 4, 2, '14:00 - 16:00', 'A2');

  return assignments;
}

export const INITIAL_SUBSTITUTIONS: SubstitutionRequest[] = [
  {
    id: 'subst-1',
    requestingFacultyId: 'fac-sharma',
    requestingFacultyName: 'Prof. Ramesh Sharma',
    targetFacultyId: 'fac-bose',
    targetFacultyName: 'Dr. Ananya Bose',
    assignmentId: 'asg-3',
    subjectCode: 'CS101',
    subjectName: 'Data Structures & Algorithms',
    divisionId: 'div-cmpn-fy-a',
    divisionName: 'FY-CMPN Div A',
    batchName: 'Whole Class',
    roomNumber: 'CR-201',
    day: 'Wednesday',
    slotIndex: 3,
    timeRange: '12:15 - 13:15',
    date: '2026-10-21',
    status: 'PENDING',
    reason: 'Attending University Academic Council & Curriculum Board Meeting',
    createdAt: '2026-10-16T08:30:00Z',
    notes: 'Please cover Binary Search Tree balancing (AVL trees). Slide deck #5 uploaded to server.',
  },
  {
    id: 'subst-2',
    requestingFacultyId: 'fac-mehta',
    requestingFacultyName: 'Prof. Priya Mehta',
    targetFacultyId: 'fac-deshmukh',
    targetFacultyName: 'Prof. Sunita Deshmukh',
    assignmentId: 'asg-8',
    subjectCode: 'CS102',
    subjectName: 'Digital Logic & Computer Organization',
    divisionId: 'div-cmpn-fy-a',
    divisionName: 'FY-CMPN Div A',
    batchName: 'Whole Class',
    roomNumber: 'CR-201',
    day: 'Thursday',
    slotIndex: 0,
    timeRange: '09:00 - 10:00',
    date: '2026-10-22',
    status: 'ACCEPTED',
    reason: 'Paper presentation at IEEE International Computing Conference',
    createdAt: '2026-10-15T14:20:00Z',
    notes: 'Prof. Deshmukh has agreed to take Karnaugh Map minimization problems.',
  },
  {
    id: 'subst-3',
    requestingFacultyId: 'fac-kulkarni',
    requestingFacultyName: 'Dr. Rajesh Kulkarni',
    targetFacultyId: 'fac-patil',
    targetFacultyName: 'Prof. Rohan Patil',
    assignmentId: 'asg-20',
    subjectCode: 'IT302',
    subjectName: 'Distributed Operating Systems',
    divisionId: 'div-it-ty-a',
    divisionName: 'TY-IT Div A',
    batchName: 'Whole Class',
    roomNumber: 'CR-205',
    day: 'Tuesday',
    slotIndex: 2,
    timeRange: '11:15 - 12:15',
    date: '2026-10-20',
    status: 'PENDING',
    reason: 'Departmental NAAC Accreditation review session',
    createdAt: '2026-10-16T09:45:00Z',
    notes: 'Cover Lamport timestamps and logical clocks concept.',
  },
  {
    id: 'subst-4',
    requestingFacultyId: 'fac-verma',
    requestingFacultyName: 'Prof. Amit Verma',
    targetFacultyId: 'fac-choudhury',
    targetFacultyName: 'Dr. Arpan Choudhury',
    assignmentId: 'asg-40',
    subjectCode: 'EC201',
    subjectName: 'Microprocessors and Interfacing',
    divisionId: 'div-extc-sy-a',
    divisionName: 'SY-EXTC Div A',
    batchName: 'Whole Class',
    roomNumber: 'CR-205',
    day: 'Thursday',
    slotIndex: 0,
    timeRange: '09:00 - 10:00',
    date: '2026-10-22',
    status: 'PENDING',
    reason: 'Inter-College Technical Symposium Jury Duty',
    createdAt: '2026-10-16T11:00:00Z',
    notes: 'Discuss 8086 interrupt vector table and hardware interrupts.',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Room Shift Notice: Wednesday FY-CMPN Data Structures in LH-301',
    content: 'Due to scheduled network maintenance in CR-201, the Wednesday Period 4 Data Structures lecture will be conducted in Tiered Auditorium LH-301.',
    authorName: 'Academic Dean Office',
    authorRole: 'admin',
    targetAudience: 'all',
    createdAt: '2026-10-16T10:00:00Z',
    priority: 'urgent',
    divisionId: 'div-cmpn-fy-a',
  },
  {
    id: 'ann-2',
    title: 'Published Academic Timetable Active for Odd Term 2026-27',
    content: 'The official coordinated timetable is active across all Computer, IT, EXTC, and Mechanical classes. Faculty substitution requests and room allocations are live.',
    authorName: 'Timetable Coordination Committee',
    authorRole: 'admin',
    targetAudience: 'all',
    createdAt: '2026-10-15T09:00:00Z',
    priority: 'normal',
  },
  {
    id: 'ann-3',
    title: 'Guest Lecture on Cloud Scalability on Friday 15:00',
    content: 'All TY Computer and IT students will assemble in Seminar Hall LH-301 for a special industry keynote by Google Cloud Principal Architect.',
    authorName: 'Prof. Ramesh Sharma (HoD Computer)',
    authorRole: 'teacher',
    targetAudience: 'teachers',
    createdAt: '2026-10-14T14:30:00Z',
    priority: 'normal',
  },
];
