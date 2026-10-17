import { CollegeStorage } from '../storage/collegeStorage';
import { Faculty, Subject, Room, Division, ScheduleAssignment, DayOfWeek, ScheduleVersion } from '../../types';
import { generateFullMasterSchedule } from '../../data/seedData';

export type SupportedLanguage = 'en' | 'hi' | 'hinglish' | 'mr';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  language: SupportedLanguage;
}

export interface QuickPrompt {
  id: string;
  label: string;
  query: string;
}

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish', flag: '🗣️' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🚩' },
];

export const QUICK_PROMPTS_BY_LANG: Record<SupportedLanguage, QuickPrompt[]> = {
  en: [
    { id: 'feat', label: '✨ All App Features', query: 'What all features are there in this web app?' },
    { id: '1', label: '👨‍🏫 Faculty Cabins', query: 'List faculty members and their cabins' },
    { id: '2', label: '📅 Monday Schedule', query: 'What classes are scheduled on Monday?' },
    { id: '3', label: '🏫 Free Rooms', query: 'Which rooms are currently vacant for study?' },
    { id: '4', label: '⚠️ Timetable Clashes', query: 'Are there any timetable clashes or conflicts?' },
  ],
  hi: [
    { id: 'feat', label: '✨ ऐप की सभी सुविधाएं', query: 'इस वेब ऐप में क्या-क्या फीचर्स हैं?' },
    { id: '1', label: '👨‍🏫 फैकल्टी केबिन', query: 'शिक्षकों और उनके केबिन की सूची दें' },
    { id: '2', label: '📅 सोमवार का शेड्यूल', query: 'सोमवार को कौन सी कक्षाएं हैं?' },
    { id: '3', label: '🏫 खाली कमरे', query: 'पढ़ाई के लिए कौन से कमरे खाली हैं?' },
    { id: '4', label: '⚠️ क्लैश और गलतियां', query: 'क्या टाइमटेबल में कोई क्लैश है?' },
  ],
  hinglish: [
    { id: 'feat', label: '✨ App ke All Features', query: 'What all features are there in this web app?' },
    { id: '1', label: '👨‍🏫 Faculty Cabins', query: 'Faculty aur unke cabin locations batao' },
    { id: '2', label: '📅 Monday Schedule', query: 'Monday ko kaun kaun si classes hain?' },
    { id: '3', label: '🏫 Empty Rooms', query: 'Free study ke liye kaunse rooms khali hain?' },
    { id: '4', label: '⚠️ Total Clashes', query: 'Kya schedule mein koi conflicts ya clashes hain?' },
  ],
  mr: [
    { id: 'feat', label: '✨ सर्व वैशिष्ट्ये (Features)', query: 'या वेब ॲपमध्ये कोणकोणती वैशिष्ट्ये आहेत?' },
    { id: '1', label: '👨‍🏫 शिक्षकांची केबिन', query: 'प्राध्यापक आणि त्यांच्या केबिनची यादी द्या' },
    { id: '2', label: '📅 सोमवारचे वर्ग', query: 'सोमवारी कोणते तास आणि लॅब आहेत?' },
    { id: '3', label: '🏫 रिकाम्या खोल्या', query: 'अभ्यासासाठी कोणत्या खोल्या रिकाम्या आहेत?' },
    { id: '4', label: '⚠️ वेळापत्रक त्रुटी', query: 'वेळापत्रकात काही संघर्ष किंवा क्लॅश आहेत का?' },
  ],
};

export class BulbaBotEngine {
  public static processQuery(rawQuery: string, language: SupportedLanguage): string {
    const q = rawQuery.trim().toLowerCase();
    
    // Fetch live institutional data
    const settings = CollegeStorage.loadSettings();
    const faculty = CollegeStorage.loadFaculty();
    const subjects = CollegeStorage.loadSubjects();
    const rooms = CollegeStorage.loadRooms();
    const divisions = CollegeStorage.loadDivisions();
    const versions = CollegeStorage.loadVersions();
    const activeVersionId = CollegeStorage.loadActiveVersionId();
    const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0] || null;
    
    // Guaranteed non-empty assignments
    let assignments: ScheduleAssignment[] = (activeVersion && activeVersion.assignments && activeVersion.assignments.length > 0)
      ? activeVersion.assignments
      : generateFullMasterSchedule();

    // ==========================================
    // 0. QUICK PROMPT EXACT MATCHING (100% RELIABILITY)
    // ==========================================
    const allQuickPrompts = Object.values(QUICK_PROMPTS_BY_LANG).flat();
    const matchedQuick = allQuickPrompts.find(p => p.query.toLowerCase() === q);

    if (matchedQuick?.id === 'feat') {
      return this.getFeaturesResponse(language, settings.collegeName);
    }
    if (matchedQuick?.id === '1') {
      return this.getFacultyCabinsResponse(language, faculty, settings.collegeName);
    }
    if (matchedQuick?.id === '2') {
      return this.getDayScheduleResponse(language, 'Monday', assignments);
    }
    if (matchedQuick?.id === '3') {
      return this.getVacantRoomsResponse(language, rooms);
    }
    if (matchedQuick?.id === '4') {
      return this.getClashesResponse(language, activeVersion);
    }

    // ==========================================
    // LAYER 1: PLEASANTRIES & CONVERSATION STARTERS
    // ==========================================
    if (this.isGreeting(q)) {
      return this.getGreetingResponse(language, settings.collegeName);
    }
    if (this.isThanks(q)) {
      return this.getThanksResponse(language);
    }
    if (this.isGoodbye(q)) {
      return this.getGoodbyeResponse(language);
    }

    // ==========================================
    // LAYER 2: TECH STACK, BACKEND & DATABASE DETAILS
    // ==========================================
    if (
      q.includes('tech stack') ||
      q.includes('technology') ||
      q.includes('tech usage') ||
      q.includes('backend') ||
      q.includes('database') ||
      q.includes('thirdparty') ||
      q.includes('third party') ||
      q.includes('libraries') ||
      q.includes('what is used to build') ||
      q.includes('architecture') ||
      q.includes('टेक्नोलॉजी') ||
      q.includes('तंत्रज्ञान')
    ) {
      return this.getTechStackResponse(language);
    }

    // ==========================================
    // LAYER 3: APP FEATURES & CAPABILITIES
    // ==========================================
    if (
      q.includes('feature') ||
      q.includes('फीचर') ||
      q.includes('सुविधा') ||
      q.includes('वैशिष्ट्य') ||
      q.includes('capabilities') ||
      (q.includes('what') && q.includes('app')) ||
      (q.includes('kya kya') && q.includes('app')) ||
      (q.includes('about') && q.includes('app')) ||
      q === 'what can you do' ||
      q === 'help' ||
      q === 'madat'
    ) {
      return this.getFeaturesResponse(language, settings.collegeName);
    }

    // ==========================================
    // LAYER 4: SPECIFIC TEACHER / FACULTY LOOKUP (e.g. Ramesh, Sharma cabin, Priya Mehta)
    // ==========================================
    const isGeneralFacultyQuery = (
      q.includes('all faculty') ||
      q.includes('faculty list') ||
      q.includes('list faculty') ||
      q.includes('all teacher') ||
      q.includes('teachers list') ||
      q.includes('who are the teachers') ||
      q.includes('cabin list') ||
      q.includes('teachers directory') ||
      q.includes('faculty directory') ||
      q.includes('शिक्षक यादी') ||
      q.includes('फैकल्टी लिस्ट') ||
      q.includes('शिक्षकों और उनके केबिन') ||
      q.includes('प्राध्यापक आणि त्यांच्या केबिन') ||
      q.includes('शिक्षकांची केबिन') ||
      q.includes('faculty aur unke cabin')
    );

    const matchedFaculty = !isGeneralFacultyQuery ? faculty.find(f => {
      const cleanName = f.name.toLowerCase().replace(/^(dr\.|prof\.|mr\.|ms\.|mrs\.)\s*/, '').trim();
      const parts = cleanName.split(' ');
      return parts.some(p => p.length >= 3 && q.includes(p)) || q.includes(cleanName);
    }) : undefined;

    if (matchedFaculty) {
      const facultySessions = assignments
        .filter(a => a.facultyId === matchedFaculty.id)
        .sort((a, b) => a.startSlotIndex - b.startSlotIndex);
      const totalHours = facultySessions.reduce((sum, a) => sum + a.durationSlots, 0);
      const daysTeaching = Array.from(new Set(facultySessions.map(s => s.day))).join(', ');
      const taughtSubjects = Array.from(new Set(facultySessions.map(s => `${s.subjectCode} (${s.subjectName})`))).join('\n  • ');

      switch (language) {
        case 'hi':
          return `👨‍🏫 **${matchedFaculty.name}**\n- **विभाग**: ${matchedFaculty.department}\n- **केबिन स्थान**: ${matchedFaculty.cabin || 'कक्षा 101 के पास'}\n- **ईमेल**: ${matchedFaculty.email}\n- **साप्ताहिक कार्यभार**: ${totalHours} घंटे / ${matchedFaculty.maxWeeklyHours} घंटे कोटा\n- **अध्यापन दिवस**: ${daysTeaching || 'सोमवार से शनिवार'}\n- **सक्रिय विषय**:\n  • ${taughtSubjects || 'सामान्य विभाग विषय'}\n\n💡 *क्या आप इनके किसी विशेष दिन (जैसे सोमवार) के लेक्चर देखना चाहते हैं?*`;
        case 'mr':
          return `👨‍🏫 **${matchedFaculty.name}**\n- **विभाग**: ${matchedFaculty.department}\n- **केबिन**: ${matchedFaculty.cabin || 'खोली क्र. 101 जवळ'}\n- **ईमेल**: ${matchedFaculty.email}\n- **साप्ताहिक तास**: ${totalHours} तास (मर्यादा: ${matchedFaculty.maxWeeklyHours} तास)\n- **शिकवण्याचे दिवस**: ${daysTeaching || 'सोमवार ते शनिवार'}\n- **शिकवत असलेले विषय**:\n  • ${taughtSubjects || 'विभागीय विषय'}\n\n💡 *त्यांचे विशिष्ट दिवसाचे वेळापत्रक पाहण्यासाठी दिवसाचे नाव विचारा.*`;
        case 'hinglish':
          return `👨‍🏫 **${matchedFaculty.name}**\n- **Department**: ${matchedFaculty.department}\n- **Cabin Location**: ${matchedFaculty.cabin || 'Near Room 101'}\n- **Email**: ${matchedFaculty.email}\n- **Weekly Workload**: ${totalHours} hrs / ${matchedFaculty.maxWeeklyHours} hrs quota\n- **Teaching Days**: ${daysTeaching || 'Monday to Saturday'}\n- **Assigned Courses**:\n  • ${taughtSubjects || 'General Department Courses'}\n\n💡 *Kisi specific day ka lecture timing dekhna hai toh day poochiye!*`;
        default:
          return `👨‍🏫 **${matchedFaculty.name}**\n- **Department**: ${matchedFaculty.department}\n- **Cabin**: ${matchedFaculty.cabin || 'Faculty Block 101'}\n- **Email**: ${matchedFaculty.email}\n- **Teaching Workload**: ${totalHours} hrs/week (Quota: ${matchedFaculty.maxWeeklyHours} hrs)\n- **Teaching Days**: ${daysTeaching || 'Monday – Saturday'}\n- **Assigned Courses**:\n  • ${taughtSubjects || 'Department Core'}\n\n💡 *Tip: Ask for a specific day (e.g. "Monday schedule") to see lecture timings!*`;
      }
    }

    // ==========================================
    // LAYER 5: GENERAL FACULTY DIRECTORY & CABINS
    // ==========================================
    if (isGeneralFacultyQuery || q.includes('cabin') || q.includes('केबिन') || q.includes('faculty') || q.includes('teacher')) {
      return this.getFacultyCabinsResponse(language, faculty, settings.collegeName);
    }

    // ==========================================
    // LAYER 6: SPECIFIC COURSE / SUBJECT LOOKUP
    // ==========================================
    const matchedSubject = subjects.find(s => {
      const codeMatch = q.includes(s.code.toLowerCase());
      const nameMatch = q.includes(s.name.toLowerCase());
      const shortMatch = s.shortName && q.includes(s.shortName.toLowerCase());
      const keywordMath = (s.name.toLowerCase().includes('mathematics') || s.name.toLowerCase().includes('algebra')) && (q.includes('math') || q.includes('ganit') || q.includes('गणित'));
      const keywordDS = s.name.toLowerCase().includes('data structures') && (q.includes('data structure') || q.includes('dsa') || q.includes('ds '));
      const keywordOOP = s.name.toLowerCase().includes('object oriented') && (q.includes('oop') || q.includes('c++') || q.includes('java'));
      const keywordDBMS = s.name.toLowerCase().includes('database') && (q.includes('dbms') || q.includes('database'));
      const keywordOS = s.name.toLowerCase().includes('operating system') && (q.includes('os') || q.includes('operating system'));
      const keywordPhysics = s.name.toLowerCase().includes('physics') && (q.includes('physics') || q.includes('भौतिकी'));
      const keywordNetwork = s.name.toLowerCase().includes('network') && (q.includes('network') || q.includes('cn'));
      return codeMatch || nameMatch || shortMatch || keywordMath || keywordDS || keywordOOP || keywordDBMS || keywordOS || keywordPhysics || keywordNetwork;
    });

    if (matchedSubject && !q.includes('all subjects') && !q.includes('courses list')) {
      const subjectSessions = assignments.filter(a => a.subjectCode === matchedSubject.code);
      const teacherNames = Array.from(new Set(subjectSessions.map(s => s.facultyName))).join(', ') || 'Department Faculty';
      const scheduledDays = Array.from(new Set(subjectSessions.map(s => `${s.day} (${s.timeRange} in ${s.roomNumber})`))).join('\n  • ');

      switch (language) {
        case 'hi':
          return `📚 **${matchedSubject.code}: ${matchedSubject.name}**\n- **प्रकार**: ${matchedSubject.type} (क्रेडिट: ${matchedSubject.credits})\n- **लेक्चर**: ${matchedSubject.weeklyLectures} घंटे/सप्ताह | **लैब**: ${matchedSubject.weeklyPracticals} घंटे/सप्ताह\n- **आवश्यक कक्ष**: ${matchedSubject.requiredRoomType}\n- **नियुक्त शिक्षक**: **${teacherNames}**\n- **शेड्यूल सत्र**:\n  • ${scheduledDays || 'टाइमटेबल ग्रिड में उपलब्ध'}`;
        case 'mr':
          return `📚 **${matchedSubject.code}: ${matchedSubject.name}**\n- **प्रकार**: ${matchedSubject.type} (क्रेडिट्स: ${matchedSubject.credits})\n- **व्याख्यान**: ${matchedSubject.weeklyLectures} तास/आठवडा | **लॅब**: ${matchedSubject.weeklyPracticals} तास/आठवडा\n- **आवश्यक जागा**: ${matchedSubject.requiredRoomType}\n- **मार्गदर्शक शिक्षक**: **${teacherNames}**\n- **निश्चित सत्रे**:\n  • ${scheduledDays || 'वेळापत्रकात नोंदणीकृत'}`;
        case 'hinglish':
          return `📚 **${matchedSubject.code}: ${matchedSubject.name}**\n- **Type**: ${matchedSubject.type} (${matchedSubject.credits} Credits)\n- **Lectures**: ${matchedSubject.weeklyLectures} hrs/wk | **Labs**: ${matchedSubject.weeklyPracticals} hrs/wk\n- **Facility**: ${matchedSubject.requiredRoomType}\n- **Teachers**: **${teacherNames}**\n- **Weekly Schedule**:\n  • ${scheduledDays || 'Active in Master Grid'}`;
        default:
          return `📚 **${matchedSubject.code}: ${matchedSubject.name}**\n- **Type**: ${matchedSubject.type} (${matchedSubject.credits} Credits)\n- **Workload**: ${matchedSubject.weeklyLectures} hrs Lecture, ${matchedSubject.weeklyPracticals} hrs Practical\n- **Facility**: ${matchedSubject.requiredRoomType}\n- **Assigned Faculty**: **${teacherNames}**\n- **Scheduled Slots**:\n  • ${scheduledDays || 'Refer to Division timetable'}`;
      }
    }

    // ==========================================
    // LAYER 7: FREE / VACANT ROOMS
    // ==========================================
    if (
      q.includes('free room') ||
      q.includes('vacant') ||
      q.includes('empty room') ||
      q.includes('खाली') ||
      q.includes('रिकाम्या') ||
      q.includes('study room') ||
      q.includes('khali') ||
      q.includes('empty classroom') ||
      q.includes('unoccupied')
    ) {
      return this.getVacantRoomsResponse(language, rooms);
    }

    // ==========================================
    // LAYER 8: SPECIFIC ROOM / LAB LOOKUP
    // ==========================================
    const matchedRoom = rooms.find(r => {
      const cleanNum = r.roomNumber.toLowerCase().replace('cr-', '').replace('lh-', '').replace('lab-', '');
      const cleanName = r.name.toLowerCase();
      return (
        q.includes(r.roomNumber.toLowerCase()) ||
        q.includes(cleanNum) ||
        q.includes(cleanName) ||
        (q.includes('auditorium') && cleanName.includes('auditorium')) ||
        (q.includes('seminar') && cleanName.includes('seminar'))
      );
    });

    if (matchedRoom) {
      const roomSessions = assignments
        .filter(a => a.roomId === matchedRoom.id)
        .sort((a, b) => a.startSlotIndex - b.startSlotIndex);
      const sessionCount = roomSessions.length;

      switch (language) {
        case 'hi':
          return `🏫 **कक्ष ${matchedRoom.roomNumber} (${matchedRoom.name})**\n- **श्रेणी**: ${matchedRoom.type}\n- **बैठक क्षमता**: ${matchedRoom.capacity} विद्यार्थी\n- **उपकरण**: ${matchedRoom.equipment.join(', ') || 'मानक शैक्षणिक सुविधाएं'}\n- **उपयोग स्थिति**: इस सप्ताह **${sessionCount} सत्र** इस कक्ष में संचालित हैं।`;
        case 'mr':
          return `🏫 **खोली क्र. ${matchedRoom.roomNumber} (${matchedRoom.name})**\n- **प्रकार**: ${matchedRoom.type}\n- **क्षमता**: ${matchedRoom.capacity} जागा\n- **उपकरणे**: ${matchedRoom.equipment.join(', ') || 'मानक शैक्षणिक सुविधा'}\n- **वापर स्थिती**: या आठवड्यात एकूण **${sessionCount} तासिका** निश्चित आहेत.`;
        case 'hinglish':
          return `🏫 **Room ${matchedRoom.roomNumber} (${matchedRoom.name})**\n- **Type**: ${matchedRoom.type}\n- **Capacity**: ${matchedRoom.capacity} seats\n- **Equipment**: ${matchedRoom.equipment.join(', ') || 'Standard classroom setup'}\n- **Booked Slots**: ${sessionCount} weekly sessions active here.`;
        default:
          return `🏫 **Room ${matchedRoom.roomNumber} (${matchedRoom.name})**\n- **Facility Category**: ${matchedRoom.type}\n- **Capacity**: ${matchedRoom.capacity} seats\n- **Equipment**: ${matchedRoom.equipment.join(', ') || 'Standard academic facility'}\n- **Current Utilization**: ${sessionCount} scheduled periods this week.`;
      }
    }

    // ==========================================
    // LAYER 9: DAY-WISE SCHEDULE (CHRONOLOGICAL)
    // ==========================================
    const daysMap: Record<string, DayOfWeek> = {
      // English
      monday: 'Monday', mon: 'Monday',
      tuesday: 'Tuesday', tue: 'Tuesday',
      wednesday: 'Wednesday', wed: 'Wednesday',
      thursday: 'Thursday', thu: 'Thursday',
      friday: 'Friday', fri: 'Friday',
      saturday: 'Saturday', sat: 'Saturday',
      // Hindi
      सोमवार: 'Monday',
      मंगलवार: 'Tuesday',
      बुधवार: 'Wednesday',
      गुरुवार: 'Thursday', बृहस्पतिवार: 'Thursday',
      शुक्रवार: 'Friday',
      शनिवार: 'Saturday',
      // Marathi (-वार and -वारी)
      सोमवारी: 'Monday',
      मंगळवारी: 'Tuesday', मंगळवार: 'Tuesday',
      बुधवारी: 'Wednesday',
      गुरुवारी: 'Thursday',
      शुक्रवारी: 'Friday',
      शनिवारी: 'Saturday',
      // Hinglish
      somwar: 'Monday', somvaar: 'Monday',
      mangalwar: 'Tuesday', mangalvaar: 'Tuesday',
      budhwar: 'Wednesday', budhvaar: 'Wednesday',
      guruwar: 'Thursday', guruvaar: 'Thursday',
      shukrawar: 'Friday', shukravaar: 'Friday',
      shaniwar: 'Saturday', shanivaar: 'Saturday',
    };

    let targetDay: DayOfWeek | null = null;
    for (const [key, dayVal] of Object.entries(daysMap)) {
      if (q.includes(key)) {
        targetDay = dayVal;
        break;
      }
    }

    if (targetDay) {
      return this.getDayScheduleResponse(language, targetDay, assignments);
    }

    // ==========================================
    // LAYER 10: CONFLICTS & TIMETABLE AUDIT
    // ==========================================
    if (
      q.includes('clash') ||
      q.includes('conflict') ||
      q.includes('error') ||
      q.includes('violation') ||
      q.includes('overlap') ||
      q.includes('क्लैश') ||
      q.includes('त्रुटी') ||
      q.includes('takrav')
    ) {
      return this.getClashesResponse(language, activeVersion);
    }

    // ==========================================
    // LAYER 11: DIVISION / CLASS LOOKUP
    // ==========================================
    const matchedDivision = divisions.find(d => {
      const cleanName = d.name.toLowerCase();
      const cleanYear = d.academicYear.toLowerCase();
      return (
        (q.includes(cleanName) && q.includes(cleanYear)) ||
        (q.includes('div a') && cleanName.includes('a')) ||
        (q.includes('div b') && cleanName.includes('b')) ||
        (q.includes('fy') && cleanYear === 'fy') ||
        (q.includes('sy') && cleanYear === 'sy') ||
        (q.includes('ty') && cleanYear === 'ty')
      );
    });

    if (matchedDivision) {
      const divSessions = assignments
        .filter(a => a.divisionId === matchedDivision.id)
        .sort((a, b) => a.startSlotIndex - b.startSlotIndex);
      const totalWeeklyHours = divSessions.reduce((sum, a) => sum + a.durationSlots, 0);

      switch (language) {
        case 'hi':
          return `👥 **कक्षा डिवीजन: ${matchedDivision.academicYear} ${matchedDivision.name}**\n- **नामांकित विद्यार्थी**: ${matchedDivision.studentCount} छात्र\n- **साप्ताहिक अध्ययन समय**: ${totalWeeklyHours} घंटे\n- **कुल निर्धारित सत्र**: ${divSessions.length} स्लॉट\n\n💡 *छात्र पोर्टल में जाकर अपनी डिवीजन का साप्ताहिक ग्रिड देख सकते हैं।*`;
        case 'mr':
          return `👥 **वर्ग तुकडी: ${matchedDivision.academicYear} ${matchedDivision.name}**\n- **विद्यार्थी संख्या**: ${matchedDivision.studentCount} विद्यार्थी\n- **साप्ताहिक अध्यापन**: ${totalWeeklyHours} तास\n- **एकूण सत्रे**: ${divSessions.length} स्लॉट निश्चित आहेत.\n\n💡 *विद्यार्थी दालनात जाऊन वर्ग वेळापत्रक तपासू शकता.*`;
        case 'hinglish':
          return `👥 **Class Division: ${matchedDivision.academicYear} ${matchedDivision.name}**\n- **Enrolled Students**: ${matchedDivision.studentCount} students\n- **Weekly Workload**: ${totalWeeklyHours} teaching hours\n- **Total Active Slots**: ${divSessions.length} sessions booked.\n\n💡 *Student portal ke Timetable tab mein aapka division grid live hai!*`;
        default:
          return `👥 **Class Division: ${matchedDivision.academicYear} ${matchedDivision.name}**\n- **Enrolled Students**: ${matchedDivision.studentCount} students\n- **Weekly Scheduled Time**: ${totalWeeklyHours} instructional hours\n- **Total Sessions**: ${divSessions.length} active periods.\n\n💡 *Head to the Student Portal Timetable view for the personalized division calendar.*`;
      }
    }

    // ==========================================
    // LAYER 12: CAMPUS NOTICES & CIRCULARS
    // ==========================================
    if (
      q.includes('notice') ||
      q.includes('announcement') ||
      q.includes('circular') ||
      q.includes('bulletin') ||
      q.includes('सूचना') ||
      q.includes('परिपत्रक') ||
      q.includes('notis')
    ) {
      const announcements = CollegeStorage.loadAnnouncements();
      const topNotices = announcements.slice(0, 3);
      if (topNotices.length === 0) {
        return language === 'hi' ? '📢 वर्तमान में कोई नया नोटिस प्रकाशित नहीं है।' :
               language === 'mr' ? '📢 सध्या कोणतीही नवीन सूचना प्रकाशित केलेली नाही.' :
               language === 'hinglish' ? '📢 Abhi koi new notice board notice nahi hai.' :
               '📢 There are currently no new institutional announcements published.';
      }
      const noticesStr = topNotices.map(n => `• **${n.title}** (${n.priority.toUpperCase()})\n  ${n.content.slice(0, 95)}...`).join('\n\n');
      switch (language) {
        case 'hi':
          return `📢 **हालिया कॉलेज नोटिस बोर्ड (${announcements.length} सूचनाएं)**:\n\n${noticesStr}\n\n*अधिक विवरण के लिए नोटिस बुलेटिन टैब देखें।*`;
        case 'mr':
          return `📢 **ताज्या कॉलेज सूचना (${announcements.length} सूचना)**:\n\n${noticesStr}\n\n*संपूर्ण माहितीसाठी सूचना फलक तपासा.*`;
        case 'hinglish':
          return `📢 **Recent Campus Notices (${announcements.length} total)**:\n\n${noticesStr}\n\n*Notices tab mein jaake complete bulletin read karein.*`;
        default:
          return `📢 **Campus Notice Bulletin (${announcements.length} notices posted)**:\n\n${noticesStr}\n\n*Head to the Institutional Notice Bulletin for complete documents.*`;
      }
    }

    // ==========================================
    // LAYER 13: COLLEGE TIMINGS & LUNCH BREAK
    // ==========================================
    if (
      q.includes('timing') ||
      q.includes('hours') ||
      q.includes('lunch') ||
      q.includes('break') ||
      q.includes('start time') ||
      q.includes('when does') ||
      q.includes('वेळ') ||
      q.includes('समय') ||
      q.includes('नाश्ता') ||
      q.includes('chhutti') ||
      q.includes('recess')
    ) {
      switch (language) {
        case 'hi':
          return `🏛️ **${settings.collegeName} समय सारिणी**:\n- **अकादमिक सत्र**: ${settings.academicTerm}\n- **कॉलेज का समय**: प्रातः 09:00 से सायं 17:00 तक\n- **चाय ब्रेक (Tea Recess)**: 11:00 - 11:15\n- **दोपहर का भोजन (Lunch)**: 13:15 - 14:00 (45 मिनट)\n- **कार्य दिवस**: ${settings.workingDays.join(', ')}\n- **विभाग**: कम्प्यूटर (CMPN), आईटी, इलेक्ट्रॉनिक्स, मैकेनिकल।`;
        case 'mr':
          return `🏛️ **${settings.collegeName} वेळ सारिणी**:\n- **शैक्षणिक वर्ष**: ${settings.academicTerm}\n- **कॉलेजची वेळ**: सकाळी 09:00 ते संध्याकाळी 17:00 पर्यंत\n- **चहाची सुट्टी**: 11:00 - 11:15\n- **दुपारची सुट्टी (Lunch)**: 13:15 - 14:00\n- **कामाचे दिवस**: ${settings.workingDays.join(', ')}\n- **शाखा**: कॉम्प्युटर, आयटी, इलेक्ट्रॉनिक्स आणि मेकॅनिकल.`;
        case 'hinglish':
          return `🏛️ **${settings.collegeName} Timings**:\n- **Academic Term**: ${settings.academicTerm}\n- **College Hours**: 09:00 AM to 05:00 PM\n- **Tea Break**: 11:00 AM - 11:15 AM\n- **Lunch Recess**: 01:15 PM - 02:00 PM\n- **Working Days**: ${settings.workingDays.join(', ')}\n- **Departments**: Computer, IT, Electronics, Mechanical.`;
        default:
          return `🏛️ **${settings.collegeName} Operating Hours**:\n- **Academic Term**: ${settings.academicTerm}\n- **College Hours**: 09:00 AM – 05:00 PM\n- **Morning Tea Break**: 11:00 AM – 11:15 AM\n- **Lunch Recess**: 01:15 PM – 02:00 PM\n- **Working Days**: ${settings.workingDays.join(', ')}\n- **Departments**: Computer Science, IT, Electronics, Mechanical.`;
      }
    }

    // ==========================================
    // LAYER 14: SUBSTITUTION & PROXY
    // ==========================================
    if (
      q.includes('proxy') ||
      q.includes('substitut') ||
      q.includes('leave') ||
      q.includes('replacement') ||
      q.includes('रजा') ||
      q.includes('छुट्टी') ||
      q.includes('बदली')
    ) {
      switch (language) {
        case 'hi':
          return `🔄 **फैकल्टी प्रॉक्सी व सब्स्टीट्यूशन प्रणाली**:\n- अनुपस्थित शिक्षक 'Peer Substitution' टैब से अपने साथी शिक्षकों को क्लास हस्तांतरित करने का डिजिटल अनुरोध भेज सकते हैं।\n- प्रशासक 'Emergency Repair' से टकरावों को तुरंत स्वतः ठीक कर सकते हैं।`;
        case 'mr':
          return `🔄 **सहकारी बदली शिक्षक (Proxy & Substitution)**:\n- प्राध्यापक रजेवर असताना 'Peer Substitution' टॅबवरून सहकारी शिक्षकांना वर्ग घेण्याची डिजिटल विनंती पाठवू शकतात.\n- प्रशासक 'Emergency Repair' द्वारे वेळापत्रकातील बदल त्वरित दुरुस्त करू शकतात.`;
        case 'hinglish':
          return `🔄 **Faculty Peer Substitution & Proxy System**:\n- Faculty 'Peer Substitution' tab use karke absentee days par doosre teachers ko class handover ki proxy request bhej sakte hain.\n- Admin Portal mein 'Emergency Repair' tool se 1-click schedule fix hota hai.`;
        default:
          return `🔄 **Faculty Peer Substitution & Proxy System**:\n- Instructors on leave can dispatch digital proxy requests to available colleagues in the same department via the 'Peer Substitution' module.\n- Admins can trigger the 'Emergency Repair Engine' to automatically find conflict-free substitute faculty and rooms.`;
      }
    }

    // ==========================================
    // LAYER 15: EXPORT & DOWNLOAD (PDF / EXCEL)
    // ==========================================
    if (
      q.includes('export') ||
      q.includes('download') ||
      q.includes('pdf') ||
      q.includes('excel') ||
      q.includes('print') ||
      q.includes('डाउनलोड')
    ) {
      switch (language) {
        case 'hi':
          return `📥 **टाइमटेबल एक्सपोर्ट और डाउनलोड**:\n- आप मास्टर टाइमटेबल और विद्यार्थी टाइमटेबल को **Landscape A4 PDF** में डाउनलोड कर सकते हैं।\n- सभी क्लास और शिक्षक शेड्यूल को **Excel Sheet / CSV** में भी एक्सपोर्ट किया जा सकता है।`;
        case 'mr':
          return `📥 **वेळापत्रक डाऊनलोड व एक्सपोर्ट**:\n- तुम्ही संपूर्ण वेळापत्रक **Landscape A4 PDF** स्वरूपात डाऊनलोड करू शकता.\n- एक्सेल वापरकर्त्यांसाठी **Excel Grid / CSV** एक्सपोर्टची सुविधा उपलब्ध आहे.`;
        case 'hinglish':
          return `📥 **PDF & Excel Timetable Export**:\n- Timetable grid ke top-right corner se aap **Landscape A4 PDF** generate karke print le sakte hain.\n- Excel Sheets aur CSV export bhi 1-click mein available hai.`;
        default:
          return `📥 **Timetable Export & Download Suite**:\n- Generate publication-quality **Landscape A4 PDFs** with header institutional branding via the 'Export PDF' button.\n- Full tabular **Excel Workbook (.xlsx) & CSV** exports are also available on both Admin and Student dashboards.`;
      }
    }

    // ==========================================
    // LAYER 16: GENERAL TIMETABLE OVERVIEW
    // ==========================================
    if (
      q.includes('timetable') ||
      q.includes('schedule') ||
      q.includes('वेळापत्रक') ||
      q.includes('टाइमटेबल') ||
      q.includes('lecture')
    ) {
      switch (language) {
        case 'hi':
          return `📅 **${settings.collegeName} टाइमटेबल अवलोकन**:\n- सक्रिय शेड्यूल: **${activeVersion?.title || 'Master Schedule'}**\n- कुल साप्ताहिक सत्र: **${assignments.length} स्लॉट**\n\n💡 *किसी विशेष दिन (जैसे 'सोमवार') या शिक्षक (जैसे 'शर्मा') का नाम लिखकर उनका शेड्यूल पूछें!*`;
        case 'mr':
          return `📅 **${settings.collegeName} वेळापत्रक माहिती**:\n- सक्रिय वेळापत्रक: **${activeVersion?.title || 'Master Schedule'}**\n- एकूण साप्ताहिक सत्रे: **${assignments.length} स्लॉट**\n\n💡 *विशिष्ट दिवस (उदा. 'सोमवार') किंवा शिक्षकांचे नाव विचारून त्यांचे सत्रे तपासा!*`;
        case 'hinglish':
          return `📅 **${settings.collegeName} Timetable Overview**:\n- Active Version: **${activeVersion?.title || 'Master Schedule'}**\n- Total Weekly Slots: **${assignments.length} active sessions**\n\n💡 *Kisi specific day (e.g. 'Monday') ya teacher ka naam poochkar unka lecture schedule dekh sakte hain!*`;
        default:
          return `📅 **${settings.collegeName} Timetable Overview**:\n- Active Version: **${activeVersion?.title || 'Master Schedule'}**\n- Total Weekly Scheduled Slots: **${assignments.length} sessions**\n\n💡 *Tip: Ask for any specific day (e.g. "Monday schedule") or teacher (e.g. "Dr. Sharma") to get granular class timings!*`;
      }
    }

    // ==========================================
    // LAYER 17: INTELLIGENT DYNAMIC FALLBACK
    // ==========================================
    return this.getSmartFallbackResponse(rawQuery, language);
  }

  // ==========================================
  // HELPER METHODS FOR RESPONSES
  // ==========================================

  private static getFeaturesResponse(language: SupportedLanguage, collegeName: string): string {
    switch (language) {
      case 'hi':
        return `🌟 **समयसेतु (${collegeName}) की प्रमुख सुविधाएं**:\n\n` +
          `1. 🌿 **ऑटोमेटेड मास्टर टाइमटेबल जेनरेशन**: शून्य क्लैश के साथ संपूर्ण कॉलेज का सटीक टाइमटेबल निर्माण।\n` +
          `2. 🍃 **3 रोल आधारित पोर्टल**: प्रशासक (Admin), शिक्षक (Faculty), और विद्यार्थी (Student)।\n` +
          `3. 📅 **मल्टी-पर्सपेक्टिव ग्रिड**: क्लास-वाइज, टीचर-वाइज और डिपार्टमेंट-वाइज व्यू।\n` +
          `4. 🏫 **खाली कमरे लोकेटर**: फ्री पीरियड्स में खाली कमरों और कंप्यूटर लैब्स की लाइव जानकारी।\n` +
          `5. 🚨 **13 कड़े नियमों का ऑडिट**: शिक्षक ओवरलैप और रूम क्लैश की तुरंत पहचान।\n` +
          `6. 🛠️ **इमरजेंसी रीशेड्यूलर**: अप्रत्याशित छुट्टियों पर 1-क्लिक शेड्यूल मरम्मत।\n` +
          `7. ⏱️ **"Schedule a Class"**: छूटे हुए लेक्चर्स बिना क्लैश तुरंत शेड्यूल करें।\n` +
          `8. 🔄 **पीयर फैकल्टी प्रॉक्सी**: अनुपस्थिति में साथी शिक्षकों को क्लास सौंपने का सिस्टम।\n` +
          `9. 📥 **PDF व Excel एक्सपोर्ट**: शार्प **Landscape A4 PDF** और **Excel Sheet** डाउनलोड।\n` +
          `10. 📢 **कैंपस नोटिस बोर्ड**: टाइमटेबल बदलावों की तुरंत डिजिटल घोषणा।\n` +
          `11. 🗣️ **मल्टीलिंगुअल बुल्बाबॉट**: 4 भाषाओं में 24/7 सहायता।`;
      case 'mr':
        return `🌟 **समयसेतू (${collegeName}) ची सर्व प्रमुख वैशिष्ट्ये**:\n\n` +
          `1. 🌿 **स्वयंचलित मास्टर वेळापत्रक निर्मिती**: वर्ग व शिक्षकांमध्ये शून्य संघर्षासह (Zero Clashes) परिपूर्ण वेळापत्रक.\n` +
          `2. 🍃 **३ भूमिका दालने**: प्रशासक (Admin), शिक्षक (Faculty), आणि विद्यार्थी (Student).\n` +
          `3. 📅 **बहुआयामी वेळापत्रक मॅट्रिक्स**: वर्गनिहाय, शिक्षकनिहाय व विभागनिहाय पाहण्याची सोय.\n` +
          `4. 🏫 **रिकाम्या खोल्या शोधक**: मोकळ्या वेळेत अभ्यासासाठी रिकाम्या वर्गखोल्यांची त्वरित माहिती.\n` +
          `5. 🚨 **१३ कठोर नियमांची तपासणी**: एकाच वेळी शिक्षक किंवा वर्गखोलीचा संघर्ष नसल्याची खात्री.\n` +
          `6. 🛠️ **आपत्कालीन दुरुस्ती (Emergency Repair)**: अचानक रजेवर गेलेल्या शिक्षकांसाठी त्वरित बदल.\n` +
          `7. ⏱️ **"Schedule a Class"**: अतिरिक्त किंवा भरपाई तासिका त्वरित आरक्षित करा.\n` +
          `8. 🔄 **सहकारी बदली शिक्षक (Proxy)**: सहकारी शिक्षकांना तास घेण्याची डिजिटल विनंती.\n` +
          `9. 📥 **PDF व Excel एक्सपोर्ट**: सुस्पष्ट **Landscape A4 PDF** आणि **Excel Grid** डाऊनलोड.\n` +
          `10. 📢 **सूचना फलक**: वेळापत्रकातील ताज्या कॉलेज सूचना.\n` +
          `11. 🗣️ **बहुभाषिक बुल्बाबॉट**: ४ भाषांमध्ये त्वरित मदत.`;
      case 'hinglish':
        return `🌟 **SamaySetu (${collegeName}) ke Key Features**:\n\n` +
          `1. 🌿 **Zero-Conflict Master Timetable Generator**: Pure college ka clash-free schedule auto-generate karta hai.\n` +
          `2. 🍃 **3 Custom Role Portals**: Admin Sanctuary, Faculty Canopy, aur Student Grove.\n` +
          `3. 📅 **Multi-Perspective Timetable Matrix**: Class-wise, Teacher-wise aur Department-wise grid.\n` +
          `4. 🏫 **Vacant Room Finder**: Free study ke liye empty classrooms aur labs live locate karein.\n` +
          `5. 🚨 **13 Hard Invariants Audit**: Double-booked teachers aur room collisions check karta hai.\n` +
          `6. 🛠️ **Emergency Rescheduler**: Unexpected leaves par 1-click dynamic repair.\n` +
          `7. ⏱️ **"Schedule a Class"**: Extra compensatory lecture bina clash schedule karein.\n` +
          `8. 🔄 **Peer Proxy & Substitution**: Absentee days par doosre teachers ko class handover karein.\n` +
          `9. 📥 **PDF & Excel Export**: **Landscape A4 PDF** aur **Excel Sheet / CSV** export.\n` +
          `10. 📢 **Notices & Bulletins**: Campus circulars aur timetable updates live broadcasting.\n` +
          `11. 🗣️ **Multilingual BulbaBot**: 4 languages mein accurate response!`;
      default:
        return `🌟 **Key Features of SamaySetu (${collegeName})**:\n\n` +
          `1. 🌿 **Master Academic Timetable Generation**: Automated constraint solver producing zero-clash institutional schedules.\n` +
          `2. 🍃 **Role-Aware Portals**: Admin Sanctuary, Faculty Canopy, and Student Grove.\n` +
          `3. 📅 **Multi-Perspective Timetable Matrix**: Filter schedules by Class-wise, Teacher-wise, and Department-wise.\n` +
          `4. 🏢 **Classrooms & Labs Management**: Real-time vacant room locator for study or lab work.\n` +
          `5. 🚨 **13 Hard-Constraint Invariant Auditing**: Ensures zero faculty double-booking or room collision.\n` +
          `6. 🛠️ **Emergency Timetable Repair**: Dynamic rescheduling when unforeseen teacher leaves occur.\n` +
          `7. ⏱️ **"Schedule a Class" Feature**: Book makeup lectures without schedule conflicts.\n` +
          `8. 🔄 **Peer Substitution & Proxy**: Request colleagues to cover classes with status tracking.\n` +
          `9. 📥 **Export Suite**: High-resolution **Landscape A4 PDF** and **Excel Grid / CSV** data export.\n` +
          `10. 📢 **Institutional Notices**: Digital bulletin broadcasting schedule releases.\n` +
          `11. 🗣️ **Multilingual BulbaBot**: 24/7 academic assistant fluent in English, Hindi, Hinglish, and Marathi.`;
    }
  }

  private static getFacultyCabinsResponse(language: SupportedLanguage, faculty: Faculty[], collegeName: string): string {
    const topFaculty = faculty.slice(0, 8);
    const listStr = topFaculty.map(f => `• **${f.name}** (${f.department})\n  📍 *${f.cabin || 'Faculty Wing Block B'}* [${f.email}]`).join('\n');
    
    switch (language) {
      case 'hi':
        return `📋 **${collegeName} शिक्षक एवं केबिन सूची** (${faculty.length} पंजीकृत शिक्षक):\n\n${listStr}\n\n💡 *किसी भी शिक्षक का नाम लिखकर उनका व्यक्तिगत शेड्यूल और खाली स्लॉट पूछें!*`;
      case 'mr':
        return `📋 **${collegeName} प्राध्यापक व केबिन यादी** (एकूण: ${faculty.length} शिक्षक):\n\n${listStr}\n\n💡 *विशिष्ट प्राध्यापकांचे नाव विचारून त्यांचे वैयक्तिक वेळापत्रक तपासा!*`;
      case 'hinglish':
        return `📋 **${collegeName} Faculty & Cabin Directory** (${faculty.length} teachers registered):\n\n${listStr}\n\n💡 *Kisi specific teacher ka naam poochkar unka individual schedule check kar sakte hain!*`;
      default:
        return `📋 **${collegeName} Faculty & Cabin Directory** (${faculty.length} registered professors):\n\n${listStr}\n\n💡 *Tip: Ask for any individual teacher's name (e.g. "Dr. Ramesh Sharma" or "Priya Mehta") to view their detailed schedule!*`;
    }
  }

  private static getDayScheduleResponse(language: SupportedLanguage, day: DayOfWeek, assignments: ScheduleAssignment[]): string {
    const daySessions = assignments
      .filter(a => a.day === day)
      .sort((a, b) => a.startSlotIndex - b.startSlotIndex);

    if (daySessions.length === 0) {
      return language === 'hi' ? `📅 **${day}** को कोई निर्धारित क्लास नहीं है (अवकाश)।` :
             language === 'mr' ? `📅 **${day}** रोजी कोणतेही वर्ग किंवा लॅब नाहीत.` :
             language === 'hinglish' ? `📅 **${day}** ko koi scheduled classes nahi hain.` :
             `📅 No classes are scheduled on **${day}**.`;
    }

    const highlights = daySessions.slice(0, 7);
    const summaryList = highlights
      .map(s => `• **${s.timeRange}**: ${s.subjectCode} (${s.subjectName})\n  📍 ${s.roomNumber} | ${s.divisionName} [👨‍🏫 ${s.facultyName}]`)
      .join('\n');

    switch (language) {
      case 'hi':
        return `📅 **${day} का व्यवस्थित शेड्यूल** (कुल सत्र: ${daySessions.length}):\n\n${summaryList}\n\n*मास्टर टाइमटेबल टैब में सभी कक्षाओं का पूरा ग्रिड देखें।*`;
      case 'mr':
        return `📅 **${day} चे क्रमवार वेळापत्रक** (एकूण सत्रे: ${daySessions.length}):\n\n${summaryList}\n\n*मास्टर टाईमटेबल टॅबमध्ये संपूर्ण ग्रिड उपलब्ध आहे.*`;
      case 'hinglish':
        return `📅 **${day} Chronological Schedule** (${daySessions.length} total sessions):\n\n${summaryList}\n\n*Master Timetable tab mein complete division grid view open karein.*`;
      default:
        return `📅 **${day} Schedule Highlights (Chronological)** (${daySessions.length} total sessions):\n\n${summaryList}\n\n*Check the Master Timetable tab for the comprehensive grid across all divisions.*`;
    }
  }

  private static getVacantRoomsResponse(language: SupportedLanguage, rooms: Room[]): string {
    const freeRoomsSample = rooms.slice(0, 5);
    const roomList = freeRoomsSample
      .map(r => `• **${r.roomNumber || (r as any).number}** (${r.name})\n  💺 क्षमता: ${r.capacity} सीटें | प्रकार: ${r.type}`)
      .join('\n');

    switch (language) {
      case 'hi':
        return `🏫 **अध्ययन हेतु उपलब्ध खाली कक्ष (Vacant Classrooms)**:\n\n${roomList}\n\n💡 विद्यार्थी 'Vacant Study Rooms' टैब में जाकर किसी भी समय स्लॉट का लाइव स्टेटस देख सकते हैं।`;
      case 'mr':
        return `🏫 **अभ्यासासाठी उपलब्ध असलेल्या रिकाम्या खोल्या (Vacant Rooms)**:\n\n${roomList}\n\n💡 विद्यार्थी 'Vacant Study Rooms' टॅबवर जाऊन रिअल-टाइम स्थिती तपासू शकतात.`;
      case 'hinglish':
        return `🏫 **Vacant Classrooms & Study Labs**:\n\n${roomList}\n\n💡 Student portal ke 'Vacant Study Rooms' tab se aap kisi bhi slot ka live status check kar sakte hain.`;
      default:
        return `🏫 **Vacant Classrooms & Computer Labs Available for Study**:\n\n${roomList}\n\n💡 Head over to the 'Vacant Study Rooms' tab in the Student Portal for real-time slot vacancy.`;
    }
  }

  private static getClashesResponse(language: SupportedLanguage, activeVersion: ScheduleVersion | null): string {
    const violations = activeVersion?.metrics?.hardConstraintViolations || 0;
    switch (language) {
      case 'hi':
        return `🌿 **टाइमटेबल ऑडिट स्थिति**: वर्तमान एक्टिव टाइमटेबल (${activeVersion?.title || 'Master Schedule'}) में **${violations}** क्लैश हैं। सिस्टम शून्य शिक्षक व कक्ष टकराव के साथ पूर्णतः अनुकूलित है।`;
      case 'mr':
        return `🌿 **वेळापत्रक तपासणी स्थिती**: सक्रिय वेळापत्रकात (${activeVersion?.title || 'Master Schedule'}) एकूण **${violations}** क्लॅश आढळले आहेत. सर्व वर्ग व शिक्षक वेळापत्रक १००% जुळवून घेतले आहेत.`;
      case 'hinglish':
        return `🌿 **Timetable Audit Status**: Active schedule version (${activeVersion?.title || 'Master Schedule'}) mein abhi **${violations}** clashes hain. Room aur teacher allocation verified hai.`;
      default:
        return `🌿 **Timetable Audit Status**: Active schedule version (${activeVersion?.title || 'Master Schedule'}) currently has **${violations}** critical clashes verified across all divisions.`;
    }
  }

  private static getTechStackResponse(language: SupportedLanguage): string {
    switch (language) {
      case 'hi':
        return `💻 **समयसेतु (SamaySetu) का संपूर्ण टेक स्टैक विवरण**:\n\n` +
          `1. 🖥️ **Frontend & UI**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion 12), Lucide Icons.\n` +
          `2. ⚙️ **Backend & Engine**: Express.js 4.21, Node.js, Client-side CSP Solver (Minimum Remaining Values & Forward Checking), Python Google OR-Tools CP-SAT bridge architecture.\n` +
          `3. 🗄️ **Database & Storage**: HTML5 LocalStorage persistence engine with schema versioning (\`_v4\`), multi-entity relational JSON structure, institutional seed-data synchronization.\n` +
          `4. 📦 **Third-Party Libraries**: \`jspdf\` & \`jspdf-autotable\` (Landscape A4 PDF export), \`@google/genai\` (Google Gemini AI client), \`vite\` & \`tsx\` tooling.`;
      case 'mr':
        return `💻 **समयसेतू (SamaySetu) संपूर्ण तंत्रज्ञान रचना (Tech Stack)**:\n\n` +
          `1. 🖥️ **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion 12), Lucide React चिन्हे.\n` +
          `2. ⚙️ **Backend**: Express.js 4.21, Node.js, अंगभूत CSP Solver (MRV व Forward-Checking अल्गोरिदम), Python Google OR-Tools CP-SAT आर्किटेक्चर.\n` +
          `3. 🗄️ **Database**: ब्राऊझर LocalStorage आधारित रिलेशनल JSON डॉक्युमेंट स्टोरेज (\`_v4\` व्हर्जनिंग), १३ शैक्षणिक घटकांचा डेटाबेस.\n` +
          `4. 📦 **Third-Party साधने**: \`jspdf\` व \`jspdf-autotable\` (Landscape PDF निर्मिती), \`@google/genai\` (Gemini AI SDK), \`vite\` बिल्ड इंजिन.`;
      case 'hinglish':
        return `💻 **SamaySetu Full Tech Stack & Architecture**:\n\n` +
          `1. 🖥️ **Frontend Core**: React 19 + TypeScript, Tailwind CSS v4 (Bulbasaur nature theme), Motion (Framer Motion 12), Lucide React icons.\n` +
          `2. ⚙️ **Backend & Solvers**: Express.js 4.21 server backend, In-browser Constraint Satisfaction Problem (CSP) deterministic solver with MRV heuristic, Python OR-Tools CP-SAT bridge architecture.\n` +
          `3. 🗄️ **Database**: Browser LocalStorage persistence layer with \`_v4\` schema versioning, JSON data store for 13 relational entities.\n` +
          `4. 📦 **Third-Party Packages**: \`jspdf\` & \`jspdf-autotable\` for vector A4 PDF export, \`@google/genai\` for Generative AI, \`vite\` + \`tsx\` runtime.`;
      default:
        return `💻 **SamaySetu Technical Architecture & Technology Stack**:\n\n` +
          `1. 🖥️ **Frontend Layer**: React 19, TypeScript 5+, Tailwind CSS v4 (Bulbasaur Nature Palette), Motion 12 (Framer Motion animations), Lucide React (vector icon library).\n` +
          `2. ⚙️ **Backend & Solver Layer**: Express 4.21.2 HTTP server support, deterministic CSP Solver engine (\`constraintEngine.ts\`) with Minimum Remaining Values (MRV) and forward checking, Python OR-Tools CP-SAT bridge architecture (\`backendDocs.ts\`).\n` +
          `3. 🗄️ **Database & Persistence**: Versioned Browser LocalStorage (\`_v4\`) managing 13 relational entities (Settings, Branches, Divisions, Batches, Rooms, Faculty, Subjects, Students, Schedules, Substitutions, Announcements, Versions, Activities).\n` +
          `4. 📦 **Third-Party Ecosystem**: \`jspdf\` & \`jspdf-autotable\` for high-resolution Landscape A4 timetable exports, \`@google/genai\` client, \`vite\` & \`tsx\` toolchain.`;
    }
  }

  private static isGreeting(q: string): boolean {
    const greetings = [
      'hi', 'hello', 'hey', 'namaste', 'namaskar', 'pranam', 'kasa ahes', 'kaise ho', 'hii', 'hola',
      'good morning', 'good afternoon', 'good evening', 'shubh sakal', 'shubh sandhya'
    ];
    return greetings.some(g => q === g || q.startsWith(g + ' ') || q.startsWith(g + '!'));
  }

  private static isThanks(q: string): boolean {
    const thanks = ['thank', 'thanks', 'dhanyawad', 'dhanyavad', 'shukriya', 'aabhar', 'thx', 'ty'];
    return thanks.some(t => q.includes(t));
  }

  private static isGoodbye(q: string): boolean {
    const goodbyes = ['bye', 'goodbye', 'alvida', 'tata', 'see you'];
    return goodbyes.some(g => q.includes(g));
  }

  private static getGreetingResponse(lang: SupportedLanguage, collegeName: string): string {
    switch (lang) {
      case 'hi':
        return `🌿 नमस्ते! मैं **बुलबाबॉट (BulbaBot)** हूँ—${collegeName} का समयसेतु एआई सहायक।\n\nआप मुझसे कॉलेज टाइमटेबल, शिक्षक, केबिन, विषय, कमरे या किसी भी दिन के शेड्यूल के बारे में हिन्दी में पूछ सकते हैं!`;
      case 'mr':
        return `🌿 नमस्कार! मी **बुलबाबॉट (BulbaBot)** आहे—${collegeName} चा समयसेतू एआय सहाय्यक.\n\nतुम्ही मला कॉलेजचे वेळापत्रक, शिक्षक, केबिन, विषय, खोल्या किंवा कोणत्याही दिवसाच्या वेळापत्रकाविषयी मराठीत विचारू शकता!`;
      case 'hinglish':
        return `🌿 Hello! Main **BulbaBot** hoon—${collegeName} ka SamaySetu AI assistant.\n\nAap mujhse timetables, teachers, cabin locations, empty rooms, subjects aur clashes ke baare mein freely pooch sakte hain!`;
      default:
        return `🌿 Hello! I am **BulbaBot**, your nature-powered academic assistant for ${collegeName}.\n\nAsk me about teacher cabins, weekly lectures, vacant study rooms, subjects, or any day's timetable schedule!`;
    }
  }

  private static getThanksResponse(lang: SupportedLanguage): string {
    switch (lang) {
      case 'hi':
        return `🌿 आपका स्वागत है! यदि आपको टाइमटेबल या शिक्षकों से संबंधित कोई अन्य जानकारी चाहिए, तो बेझिझक पूछें!`;
      case 'mr':
        return `🌿 आपले मनःपूर्वक स्वागत! वेळापत्रक किंवा प्राध्यापकांविषयी इतर काही माहिती हवी असल्यास नक्की विचारा!`;
      case 'hinglish':
        return `🌿 You're most welcome! Agar schedule ya rooms ke baare mein aur kuch jaanna ho toh pooch sakte hain.`;
      default:
        return `🌿 You're welcome! Feel free to ask anytime if you need timetable updates, faculty contacts, or room availability.`;
    }
  }

  private static getGoodbyeResponse(lang: SupportedLanguage): string {
    switch (lang) {
      case 'hi':
        return `🌿 अलविदा! आपका दिन शुभ और ज्ञानवर्धक रहे! जब भी टाइमटेबल की जानकारी चाहिए, बुलबाबॉट हमेशा यहाँ है।`;
      case 'mr':
        return `🌿 पुन्हा भेटूया! तुमचा दिवस आनंददायी आणि यशस्वी जावो! वेळापत्रकाच्या मदतीसाठी मी नेहमी तत्पर आहे.`;
      case 'hinglish':
        return `🌿 Goodbye! Have a productive academic day ahead. Schedule queries ke liye main yahin hoon!`;
      default:
        return `🌿 Goodbye! Have a productive and fulfilling academic day! I'll be here whenever you need scheduling assistance.`;
    }
  }

  private static getSmartFallbackResponse(rawQuery: string, lang: SupportedLanguage): string {
    const trimmed = rawQuery.length > 30 ? `"${rawQuery.slice(0, 30)}..."` : `"${rawQuery}"`;
    switch (lang) {
      case 'hi':
        return `🌿 मैंने आपका प्रश्न ${trimmed} समझा।\n\nमैं विशेष रूप से **समयसेतु शैक्षणिक डेटा** का उत्तर देने के लिए प्रशिक्षित हूँ। आप इनमें से पूछ सकते हैं:\n• **सोमवार का शेड्यूल**\n• **शिक्षकों और उनके केबिन की सूची**\n• **खाली कमरे**\n• **विषय विवरण** (जैसे 'CS101' या 'गणित')\n• **ऐप की सभी सुविधाएं**\n• **प्रोजेक्ट का टेक स्टैक**`;
      case 'mr':
        return `🌿 मला तुमचा प्रश्न ${trimmed} समजला.\n\nमी **समयसेतू शैक्षणिक वेळापत्रक प्रणाली** बद्दल अचूक माहिती देतो. तुम्ही हे विचारू शकता:\n• **सोमवारचे वेळापत्रक**\n• **शिक्षकांची केबिन** (उदा. 'शर्मा सर')\n• **रिकाम्या वर्गखोल्या**\n• **विषय माहिती** (उदा. 'CS101' किंवा 'गणित')\n• **ॲपची सर्व वैशिष्ट्ये**\n• **प्रोजेक्टचा टेक स्टॅक**`;
      case 'hinglish':
        return `🌿 Maine aapki query ${trimmed} process ki.\n\nMain **SamaySetu Timetable & College Data** manage karta hoon. Aap easily ye pooch sakte hain:\n• **Monday Schedule** ya kisi bhi day ka timetable\n• **Teacher Cabins** (e.g. 'Sharma cabin' ya 'Priya schedule')\n• **Free Study Rooms**\n• **Course Details** (e.g. 'CS101' ya 'Maths')\n• **All App Features**\n• **Tech Stack Details**`;
      default:
        return `🌿 I processed your query regarding ${trimmed}.\n\nAs your academic copilot, I can instantly look up timetable, faculty, and room data. Try asking:\n• **"Monday Schedule"** or any day's classes\n• **"Dr. Ramesh Sharma Cabin"** or any teacher's workload\n• **"Vacant study rooms"**\n• **"CS101 course details"**\n• **"What all features are in this web app?"**\n• **"What tech stack is used in this project?"**`;
    }
  }
}
