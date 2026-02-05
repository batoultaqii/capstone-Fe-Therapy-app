import { create } from 'zustand';
import { getSessions as fetchSessionsApi } from '../api/sessions';

/**
 * Support group sessions and enrollment state.
 * Sessions are keyed by id; enrolling updates enrolledCount in memory.
 * fetchSessions() loads sessions from the backend (fallback to mock on error).
 */

export type SessionFormat = 'Online' | 'In-Person';
export type SessionAvailability = 'Male' | 'Female' | 'Mixed';
export type SessionLanguage = 'English' | 'Arabic' | 'Bilingual';

export interface SupportSession {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  date: string;       // e.g. "Wed, Mar 12"
  time: string;       // e.g. "6:00 PM"
  durationMinutes: number;
  format: SessionFormat;
  description: string;
  availability: SessionAvailability;
  language: SessionLanguage; // language in which the session is conducted
  enrolledCount: number;
  maxParticipants: number;
  enrolledByUser?: boolean; // true if current user enrolled
}

const MOCK_SESSIONS: SupportSession[] = [
  {
    id: '1',
    name: 'When anxiety feels heavy',
    providerId: 'p1',
    providerName: 'Dr. Sarah M.',
    date: 'Tue, Mar 11',
    time: '6:00 PM',
    durationMinutes: 60,
    format: 'Online',
    description: 'A gentle space to share and listen when anxiety is weighing on you. No advice—just presence and connection with others who get it.',
    availability: 'Mixed',
    language: 'English',
    enrolledCount: 4,
    maxParticipants: 10,
  },
  {
    id: '2',
    name: 'الهدوء معاً',
    providerId: 'p2',
    providerName: 'أكرم الراشد',
    date: 'Wed, Mar 12',
    time: '4:30 PM',
    durationMinutes: 45,
    format: 'Online',
    description: 'Short practices and shared reflection for moments when you need to slow down. Co-hosted with a volunteer peer.',
    availability: 'Mixed',
    language: 'Arabic',
    enrolledCount: 8,
    maxParticipants: 12,
  },
  {
    id: '3',
    name: 'Gentle space for low days',
    providerId: 'p3',
    providerName: 'Dr. James L.',
    date: 'Thu, Mar 13',
    time: '7:00 PM',
    durationMinutes: 60,
    format: 'In-Person',
    description: 'In-person circle for days when energy is low. We focus on being with what is, without fixing.',
    availability: 'Mixed',
    language: 'English',
    enrolledCount: 6,
    maxParticipants: 8,
  },
  {
    id: '4',
    name: 'الأمل والتواصل',
    providerId: 'p4',
    providerName: 'سامية الخالد',
    date: 'Sat, Mar 15',
    time: '10:00 AM',
    durationMinutes: 90,
    format: 'Online',
    description: 'A weekly space to connect with others, share what’s real, and remember you’re not alone. Volunteer-facilitated.',
    availability: 'Female',
    language: 'Arabic',
    enrolledCount: 12,
    maxParticipants: 12,
  },
  {
    id: '5',
    name: 'دائرة الرجال',
    providerId: 'p3',
    providerName: 'Dr. James L.',
    date: 'Sun, Mar 16',
    time: '5:00 PM',
    durationMinutes: 60,
    format: 'Online',
    description: 'A dedicated space for men to talk openly about stress, loss, and emotional weight. Professional facilitator.',
    availability: 'Male',
    language: 'Bilingual',
    enrolledCount: 3,
    maxParticipants: 10,
  },
];

export interface Provider {
  id: string;
  name: string;
  age: number;
  gender: string;
  degree: string;
  degreeAr?: string;
  specialization: string;
  specializationAr?: string;
  volunteerCoHost: boolean;
  bio: string;
  bioAr?: string;
  sessionIds: string[];
}

const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    name: 'Dr. Sarah M.',
    age: 38,
    gender: 'Female',
    degree: 'PhD Clinical Psychology',
    degreeAr: 'دكتوراه في علم النفس السريري',
    specialization: 'Anxiety, trauma-informed care',
    specializationAr: 'القلق، الرعاية المستندة إلى الصدمة',
    volunteerCoHost: false,
    bio: 'Sarah has over 10 years of experience in group therapy and community mental health. She believes in the power of shared space and listening.',
    bioAr: 'سارة لديها أكثر من 10 سنوات من الخبرة في العلاج الجماعي والصحة النفسية المجتمعية. تؤمن بقوة المساحة المشتركة والاستماع.',
    sessionIds: ['1'],
  },
  {
    id: 'p2',
    name: 'أكرم الراشد',
    age: 29,
    gender: 'Male',
    degree: 'MA Counseling',
    degreeAr: 'ماجستير في الاستشارات',
    specialization: 'Mindfulness, peer support',
    specializationAr: 'اليقظة الذهنية، الدعم من الأقران',
    volunteerCoHost: true,
    bio: 'Alex facilitates groups as a volunteer alongside licensed providers. Lived experience with anxiety and recovery.',
    bioAr: 'أكرم ييسّر المجموعات متطوعاً إلى جانب مقدمي الخدمة المرخّصين. تجربة معيشية مع القلق والتعافي.',
    sessionIds: ['2'],
  },
  {
    id: 'p3',
    name: 'Dr. James L.',
    age: 45,
    gender: 'Male',
    degree: 'MD Psychiatry, Psychotherapy certification',
    specialization: 'Mood, men’s mental health',
    degreeAr: 'دكتور في الطب النفسي، شهادة العلاج النفسي',
    volunteerCoHost: false,
    specializationAr: 'المزاج، الصحة النفسية للرجال',
    bio: 'James runs in-person and online groups focused on low mood and men’s mental health. Warm, steady presence.',
    bioAr: 'جيمس يدير مجموعات حضورية وعبر الإنترنت تركّز على المزاج المنخفض والصحة النفسية للرجال. حضور دافئ وثابت.',
    sessionIds: ['3', '5'],
  },
  {
    id: 'p4',
    name: 'سامية الخالد',
    age: 34,
    gender: 'Female',
    degree: 'MSW',
    degreeAr: 'ماجستير في العمل الاجتماعي',
    specialization: 'Peer support, community',
    specializationAr: 'الدعم من الأقران، المجتمع',
    volunteerCoHost: true,
    bio: 'Sam is a volunteer facilitator who creates space for hope and connection. Passionate about reducing isolation.',
    bioAr: 'سامية ميسّرة متطوعة تخلق مساحة للأمل والتواصل. شغوفة بتقليل العزلة.',
    sessionIds: ['4'],
  },
];

interface SessionsState {
  sessions: SupportSession[];
  providers: Provider[];
  enrolledIds: Set<string>;
  lastEnrolledId: string | null;
  sessionsLoading: boolean;
  sessionsError: string | null;
  setSessions: (sessions: SupportSession[]) => void;
  fetchSessions: () => Promise<void>;
  enroll: (sessionId: string) => boolean;
  clearLastEnrolledId: () => void;
  getSession: (id: string) => SupportSession | undefined;
  getProvider: (id: string) => Provider | undefined;
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: MOCK_SESSIONS,
  providers: MOCK_PROVIDERS,
  enrolledIds: new Set<string>(),
  lastEnrolledId: null,
  sessionsLoading: false,
  sessionsError: null,

  setSessions(sessions: SupportSession[]) {
    set({ sessions, sessionsError: null });
  },

  async fetchSessions() {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      const sessions = await fetchSessionsApi();
      set({ sessions, sessionsLoading: false, sessionsError: null });
    } catch {
      set({
        sessions: MOCK_SESSIONS,
        sessionsLoading: false,
        sessionsError: null,
      });
    }
  },

  enroll(sessionId: string) {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session || session.enrolledCount >= session.maxParticipants) return false;
    set((state) => {
      const nextSessions = state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, enrolledCount: s.enrolledCount + 1, enrolledByUser: true }
          : s
      );
      const nextEnrolled = new Set(state.enrolledIds);
      nextEnrolled.add(sessionId);
      return { sessions: nextSessions, enrolledIds: nextEnrolled, lastEnrolledId: sessionId };
    });
    return true;
  },

  clearLastEnrolledId() {
    set({ lastEnrolledId: null });
  },

  getSession(id: string) {
    return get().sessions.find((s) => s.id === id);
  },

  getProvider(id: string) {
    return get().providers.find((p) => p.id === id);
  },
}));
