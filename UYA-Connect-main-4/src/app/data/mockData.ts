export type UserRole = 'member' | 'admin' | 'coordinator';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type MockAccountType = 'admin-demo' | 'coordinator-demo' | 'feature-showcase' | 'highly-active-member' | 'active-member' | 'at-risk-member' | 'inactive-member' | 'blank-clean' | 'standard';

export interface User {
  id: string;
  name: string;
  age?: number;
  address?: string;
  email: string;
  gender?: Gender;
  contactNumber?: string;
  createdAt?: string;
  mockAccountType?: MockAccountType;
  mockAccountNote?: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
}

export interface Activity {
  id: string;
  title: string;
  date: string;
  location: string;
  organizer: string;
  description: string;
  participants: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationOpen: boolean;
  attendanceOpen: boolean;
  qrGeneratedAt?: string; // Timestamp when QR was generated
  qrValidityHours?: number; // How many hours the QR is valid
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  description: string;
  author: string;
}

export interface AttendanceRecord {
  id: string;
  activityId: string;
  activityTitle: string;
  userId: string;
  userName: string;
  date: string;
  status: 'eligible' | 'pending' | 'approved' | 'rejected';
  // Display label used in attendance pages after QR validation.
  // Present = scanned on time, Late = scanned after the accepted time, Absent = no valid scan.
  attendanceStatus?: 'present' | 'late' | 'absent';
  timestamp?: string;
  proof?: string;
  markedAt?: string;
  submittedAt?: string;
  proofUrl?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  activityId: string;
  attendanceId: string;
  certificateNumber: string;
  issuedAt: string;
  verificationCode: string;
}

export type ProposalPhase = 'submission' | 'voting' | 'closed';

export type ProposalReviewStatus =
  | 'pending_review'
  | 'revision_requested'
  | 'approved_for_voting'
  | 'rejected';

export interface ProposalReviewHistoryItem {
  id: string;
  type: 'revision' | 'rejection';
  officerId: string;
  officerName: string;
  message: string;
  timestamp: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  proposedDate: string;
  proposerId: string;
  proposerName: string;
  // Legacy status is kept for the existing analytics/mock-data pages.
  // Use phase + reviewStatus for the proposal edit/review workflow.
  status: 'pending' | 'approved' | 'rejected';
  phase?: ProposalPhase;
  reviewStatus?: ProposalReviewStatus;
  reviewFeedbackHistory?: ProposalReviewHistoryItem[];
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  yesVotes: number;
  noVotes: number;
  voters: string[]; // Array of user IDs who voted
  votingDeadline: string; // Voting deadline date
}

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  vote: 'yes' | 'no';
  timestamp: string;
}


export interface ProposalVoteFeedback {
  id: string;
  proposalId: string;
  userId: string;
  userName: string;
  vote: 'yes' | 'no';
  message: string;
  timestamp: string;
}

export interface ProposalSettings {
  submissionsOpen: boolean;
  currentPhase: 'submission' | 'voting' | 'closed';
  submissionDeadline?: string;
  // Deadline controlled by admin/coordinator and automatically used by member proposals.
  votingDeadline?: string;
  // Allowed activity date range controlled by admin/coordinator.
  proposedDateStart?: string;
  proposedDateEnd?: string;
}

// Voting rule for the wireframe mock data
// UYA has 35 total members, so a proposal needs at least 80% support.
export const TOTAL_MEMBERS = 35;
export const PROPOSAL_APPROVAL_THRESHOLD_PERCENT = 80;
export const REQUIRED_YES_VOTES = Math.ceil((TOTAL_MEMBERS * PROPOSAL_APPROVAL_THRESHOLD_PERCENT) / 100);


// Mock demo users
// Password is intentionally flexible in the mock login flow, so any password can be used for these demo accounts.
export const users: User[] = [
  {
    id: '1',
    name: 'Nayeon',
    email: 'nayeon@gmail.com',
    age: 24,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 111 1111',
    createdAt: '2026-01-10',
    mockAccountType: 'admin-demo',
    mockAccountNote: 'Admin demo account. Best for showing dashboard management, member records, activities, attendance QR controls, proposals, announcements, certificates, and Analytics & Evaluation.',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jeongyeon',
    email: 'jeongyeon@gmail.com',
    age: 25,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 222 2222',
    createdAt: '2026-01-15',
    mockAccountType: 'coordinator-demo',
    mockAccountNote: 'Coordinator demo account. Best for showing activity management, QR attendance handling, announcements, proposals, and certificates without Analytics & Evaluation access.',
    role: 'coordinator',
    status: 'active',
  },
  {
    id: '3',
    name: 'Momo',
    email: 'momo@gmail.com',
    age: 21,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 333 3333',
    createdAt: '2026-05-04',
    mockAccountType: 'feature-showcase',
    mockAccountNote: 'Newly created feature-showcase member. Has joined activities, QR attendance records, certificates, votes, notifications, and proposals in pending, approved, and rejected states.',
    role: 'member',
    status: 'active',
  },
  {
    id: '4',
    name: 'Sana',
    email: 'sana@gmail.com',
    age: 22,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 444 4444',
    createdAt: '2026-02-01',
    mockAccountType: 'highly-active-member',
    mockAccountNote: 'Highly active member demo. Good for showing strong attendance, certificates, member engagement, and positive Analytics & Evaluation output.',
    role: 'member',
    status: 'active',
  },
  {
    id: '5',
    name: 'Jihyo',
    email: 'jihyo@gmail.com',
    age: 26,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 555 5555',
    createdAt: '2026-01-20',
    mockAccountType: 'coordinator-demo',
    mockAccountNote: 'Second coordinator demo account. Useful when showing that more than one officer can manage activities, announcements, certificates, and attendance but still cannot open Analytics & Evaluation.',
    role: 'coordinator',
    status: 'active',
  },
  {
    id: '6',
    name: 'Mina',
    email: 'mina@gmail.com',
    age: 23,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 666 6666',
    createdAt: '2026-02-08',
    mockAccountType: 'active-member',
    mockAccountNote: 'Active member demo. Has normal participation, approved attendance, certificates, proposal voting, and a sample approved proposal.',
    role: 'member',
    status: 'active',
  },
  {
    id: '7',
    name: 'Dahyun',
    email: 'dahyun@gmail.com',
    age: 20,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 777 7777',
    createdAt: '2026-02-12',
    mockAccountType: 'at-risk-member',
    mockAccountNote: 'At-risk member demo. Has mixed participation with late and absent records, useful for showing the engagement report and attendance status badges.',
    role: 'member',
    status: 'active',
  },
  {
    id: '8',
    name: 'Chaeyoung',
    email: 'chaeyoung@gmail.com',
    age: 20,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 888 8888',
    createdAt: '2026-02-14',
    mockAccountType: 'inactive-member',
    mockAccountNote: 'Inactive member demo. Has mostly absent/rejected attendance data, useful for showing low engagement and critical activity evaluation examples.',
    role: 'member',
    status: 'inactive',
  },
  {
    id: '9',
    name: 'Tzuyu',
    email: 'tzuyu@gmail.com',
    age: 19,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 999 9999',
    createdAt: '2026-05-04',
    mockAccountType: 'blank-clean',
    mockAccountNote: 'Literal blank demo account. No announcements, no activities, no attendance, no certificates, no proposals, no voting history, and no notifications.',
    role: 'member',
    status: 'active',
  },


  {
    id: '10',
    name: 'Minji',
    email: 'minji@gmail.com',
    age: 20,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 010 1010',
    createdAt: '2026-02-16',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from NewJeans set. Added to complete the 35-member mock organization roster.',
    role: 'member',
    status: 'active',
  },
  {
    id: '11',
    name: 'Hanni',
    email: 'hanni@gmail.com',
    age: 20,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 011 1111',
    createdAt: '2026-02-17',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from NewJeans set. Can be used as an additional active member option for wireframe testing.',
    role: 'member',
    status: 'active',
  },
  {
    id: '12',
    name: 'Danielle',
    email: 'danielle@gmail.com',
    age: 20,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 012 1212',
    createdAt: '2026-02-18',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from NewJeans set. Added for member list, registration count, and voting population display.',
    role: 'member',
    status: 'active',
  },
  {
    id: '13',
    name: 'Haerin',
    email: 'haerin@gmail.com',
    age: 19,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 013 1313',
    createdAt: '2026-02-19',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from NewJeans set. Useful for showing a fuller mock member directory.',
    role: 'member',
    status: 'active',
  },
  {
    id: '14',
    name: 'Hyein',
    email: 'hyein@gmail.com',
    age: 18,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 014 1414',
    createdAt: '2026-02-20',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from NewJeans set. Added to support the 35-member mock voting base.',
    role: 'member',
    status: 'active',
  },
  {
    id: '15',
    name: 'Yeji',
    email: 'yeji@gmail.com',
    age: 23,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 015 1515',
    createdAt: '2026-02-21',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from ITZY set. Can be used for testing normal member access.',
    role: 'member',
    status: 'active',
  },
  {
    id: '16',
    name: 'Lia',
    email: 'lia@gmail.com',
    age: 23,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 016 1616',
    createdAt: '2026-02-22',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from ITZY set. Added for more realistic member directory volume.',
    role: 'member',
    status: 'active',
  },
  {
    id: '17',
    name: 'Ryujin',
    email: 'ryujin@gmail.com',
    age: 22,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 017 1717',
    createdAt: '2026-02-23',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from ITZY set. Useful for showing more member options in wireframes.',
    role: 'member',
    status: 'active',
  },
  {
    id: '18',
    name: 'Chaeryeong',
    email: 'chaeryeong@gmail.com',
    age: 22,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 018 1818',
    createdAt: '2026-02-24',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from ITZY set. Added to complete the organization roster.',
    role: 'member',
    status: 'active',
  },
  {
    id: '19',
    name: 'Yuna',
    email: 'yuna@gmail.com',
    age: 20,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 019 1919',
    createdAt: '2026-02-25',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from ITZY set. Can be used as an additional mock voter/member.',
    role: 'member',
    status: 'active',
  },
  {
    id: '20',
    name: 'Jisoo',
    email: 'jisoo@gmail.com',
    age: 25,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 020 2020',
    createdAt: '2026-02-26',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from BLACKPINK set. Added for the 35-member mock roster.',
    role: 'member',
    status: 'active',
  },
  {
    id: '21',
    name: 'Jennie',
    email: 'jennie@gmail.com',
    age: 25,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 021 2121',
    createdAt: '2026-02-27',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from BLACKPINK set. Useful for member list and voting count displays.',
    role: 'member',
    status: 'active',
  },
  {
    id: '22',
    name: 'Rosé',
    email: 'rose@gmail.com',
    age: 25,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 022 2222',
    createdAt: '2026-02-28',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from BLACKPINK set. Added as a normal member option.',
    role: 'member',
    status: 'active',
  },
  {
    id: '23',
    name: 'Lisa',
    email: 'lisa@gmail.com',
    age: 24,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 023 2323',
    createdAt: '2026-03-01',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from BLACKPINK set. Can be used for normal member testing.',
    role: 'member',
    status: 'active',
  },
  {
    id: '24',
    name: 'Sakura',
    email: 'sakura@gmail.com',
    age: 25,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 024 2424',
    createdAt: '2026-03-02',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from LE SSERAFIM set. Added for realistic roster size.',
    role: 'member',
    status: 'active',
  },
  {
    id: '25',
    name: 'Chaewon',
    email: 'chaewon@gmail.com',
    age: 24,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 025 2525',
    createdAt: '2026-03-03',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from LE SSERAFIM set. Useful for member directory wireframes.',
    role: 'member',
    status: 'active',
  },
  {
    id: '26',
    name: 'Yunjin',
    email: 'yunjin@gmail.com',
    age: 23,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 026 2626',
    createdAt: '2026-03-04',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from LE SSERAFIM set. Added as a regular active member.',
    role: 'member',
    status: 'active',
  },
  {
    id: '27',
    name: 'Kazuha',
    email: 'kazuha@gmail.com',
    age: 22,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 027 2727',
    createdAt: '2026-03-05',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from LE SSERAFIM set. Can be used for normal member login testing.',
    role: 'member',
    status: 'active',
  },
  {
    id: '28',
    name: 'Eunchae',
    email: 'eunchae@gmail.com',
    age: 18,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Female',
    contactNumber: '0917 028 2828',
    createdAt: '2026-03-06',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from LE SSERAFIM set. Added to support the 35-account mock population.',
    role: 'member',
    status: 'active',
  },
  {
    id: '29',
    name: 'Soobin',
    email: 'soobin@gmail.com',
    age: 24,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Male',
    contactNumber: '0917 029 2929',
    createdAt: '2026-03-07',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from TXT set. Added for mixed-gender member roster examples.',
    role: 'member',
    status: 'active',
  },
  {
    id: '30',
    name: 'Yeonjun',
    email: 'yeonjun@gmail.com',
    age: 25,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Male',
    contactNumber: '0917 030 3030',
    createdAt: '2026-03-08',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from TXT set. Useful for showing a complete member list.',
    role: 'member',
    status: 'active',
  },
  {
    id: '31',
    name: 'Beomgyu',
    email: 'beomgyu@gmail.com',
    age: 23,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Male',
    contactNumber: '0917 031 3131',
    createdAt: '2026-03-09',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from TXT set. Added as a normal mock member.',
    role: 'member',
    status: 'active',
  },
  {
    id: '32',
    name: 'Taehyun',
    email: 'taehyun@gmail.com',
    age: 23,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Male',
    contactNumber: '0917 032 3232',
    createdAt: '2026-03-10',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from TXT set. Can be used for normal member flow testing.',
    role: 'member',
    status: 'active',
  },
  {
    id: '33',
    name: 'Huening Kai',
    email: 'hueningkai@gmail.com',
    age: 22,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Male',
    contactNumber: '0917 033 3333',
    createdAt: '2026-03-11',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from TXT set. Added to complete more member options for the wireframe.',
    role: 'member',
    status: 'active',
  },
  {
    id: '34',
    name: 'S.Coups',
    email: 'scoups@gmail.com',
    age: 25,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Male',
    contactNumber: '0917 034 3434',
    createdAt: '2026-03-12',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from SEVENTEEN set. Added to reach the 35-account mock roster.',
    role: 'member',
    status: 'active',
  },
  {
    id: '35',
    name: 'Wonwoo',
    email: 'wonwoo@gmail.com',
    age: 25,
    address: 'General Mariano Alvarez, Cavite',
    gender: 'Male',
    contactNumber: '0917 035 3535',
    createdAt: '2026-03-13',
    mockAccountType: 'standard',
    mockAccountNote: 'Standard member demo account from SEVENTEEN set. This completes the 35 total mock accounts used by the voting examples.',
    role: 'member',
    status: 'active',
  },
];

export const isBlankCleanUser = (userId?: string | null): boolean => {
  if (!userId) return false;
  return users.some(user => user.id === userId && user.mockAccountType === 'blank-clean');
};

export const activities: Activity[] = [
  {
    id: 'act-1',
    title: 'Community Service Day',
    date: '2026-05-08',
    location: 'Carmona City Park',
    organizer: 'Nayeon',
    description: 'Join us for a day of community service cleaning up the local park.',
    participants: ['1', '2', '3', '4', '5', '7', '8'],
    status: 'upcoming',
    registrationOpen: false,
    attendanceOpen: false,
  },
  {
    id: 'act-2',
    title: 'Tech Workshop: Web Development',
    date: '2026-05-12',
    location: 'SM Aura',
    organizer: 'Jihyo',
    description: 'Learn the basics of modern web development with React and TypeScript.',
    participants: ['1', '3', '5', '6', '7', '8'],
    status: 'upcoming',
    registrationOpen: true,
    attendanceOpen: true, // Open for demo
  },
  {
    id: 'act-3',
    title: 'Annual Sports Festival',
    date: '2026-05-15',
    location: 'CvSU Main Campus',
    organizer: 'Jeongyeon',
    description: 'Annual sports competition featuring various team sports and activities.',
    participants: ['2', '3', '4', '6', '7', '8'],
    status: 'completed',
    registrationOpen: false,
    attendanceOpen: true,
  },
  {
    id: 'act-4',
    title: 'Cultural Night',
    date: '2026-05-18',
    location: 'CvSU Role Hall',
    organizer: 'Nayeon',
    description: 'Celebrate diversity with cultural performances and international cuisine.',
    participants: ['1', '2', '3', '4', '5', '6', '7', '8'],
    status: 'completed',
    registrationOpen: false,
    attendanceOpen: false,
  },
  {
    id: 'act-5',
    title: 'Leadership Training',
    date: '2026-05-22',
    location: 'Conference Room A',
    organizer: 'Jihyo',
    description: 'Develop leadership skills through interactive workshops and team activities.',
    participants: ['1', '2', '3', '5', '6', '7'],
    status: 'upcoming',
    registrationOpen: true,
    attendanceOpen: false,
  },
  {
    id: 'act-6',
    title: 'Environmental Awareness Campaign',
    date: '2026-05-29',
    location: 'CvSU Carmona',
    organizer: 'Jeongyeon',
    description: 'Raise awareness about environmental issues and sustainable practices.',
    participants: ['2', '3', '4', '6', '7', '8'],
    status: 'upcoming',
    registrationOpen: true,
    attendanceOpen: false,
  },
];

export const announcements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'New Activity Schedule Released',
    date: '2026-03-18',
    description: 'The schedule for next month activities is now available. Check the Activities page for details.',
    author: 'Nayeon',
  },
  {
    id: 'ann-2',
    title: 'Attendance Marking System Update',
    date: '2026-03-17',
    description: 'We have updated the attendance marking system. You can now upload proof of attendance directly.',
    author: 'Jihyo',
  },
  {
    id: 'ann-3',
    title: 'Welcome New Members!',
    date: '2026-03-15',
    description: 'Please join us in welcoming our new members to UYA Connect. Looking forward to great activities together!',
    author: 'Jeongyeon',
  },
  {
    id: 'ann-4',
    title: 'Community Service Day Reminder',
    date: '2026-03-14',
    description: 'Don\'t forget to register for the Community Service Day happening next week!',
    author: 'Nayeon',
  },
  {
    id: 'ann-5',
    title: 'System Maintenance Notice',
    date: '2026-03-12',
    description: 'The system will undergo maintenance on March 19, 2026, from 2:00 AM to 4:00 AM.',
    author: 'Jihyo',
  },
];

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-1',
    activityId: 'act-3',
    activityTitle: 'Annual Sports Festival',
    userId: '3',
    userName: 'Momo',
    date: '2026-05-15',
    status: 'approved',
    attendanceStatus: 'present',
    timestamp: '2026-05-15 09:30:00',
    markedAt: '2026-05-15 09:32:00',

  },
  {
    id: 'att-2',
    activityId: 'act-3',
    activityTitle: 'Annual Sports Festival',
    userId: '4',
    userName: 'Sana',
    date: '2026-05-15',
    status: 'approved',
    attendanceStatus: 'late',
    timestamp: '2026-05-15 10:15:00',
    markedAt: '2026-05-15 10:15:00',
  },
  {
    id: 'att-3',
    activityId: 'act-3',
    activityTitle: 'Annual Sports Festival',
    userId: '7',
    userName: 'Dahyun',
    date: '2026-05-15',
    status: 'approved',
    attendanceStatus: 'late',
    timestamp: '2026-05-15 10:05:00',
    markedAt: '2026-05-15 10:05:00',
  },
  {
    id: 'att-4',
    activityId: 'act-4',
    activityTitle: 'Cultural Night',
    userId: '4',
    userName: 'Sana',
    date: '2026-05-18',
    status: 'approved',
    attendanceStatus: 'present',
    timestamp: '2026-05-18 18:00:00',
    markedAt: '2026-05-18 18:02:00',
  },
  {
    id: 'att-5',
    activityId: 'act-4',
    activityTitle: 'Cultural Night',
    userId: '6',
    userName: 'Mina',
    date: '2026-05-18',
    status: 'approved',
    attendanceStatus: 'present',
    timestamp: '2026-05-18 18:05:00',
    markedAt: '2026-05-18 18:05:00',
    proof: 'proof-cultural-night-mina.jpg',
  },
  {
    id: 'att-6',
    activityId: 'act-4',
    activityTitle: 'Cultural Night',
    userId: '8',
    userName: 'Chaeyoung',
    date: '2026-05-18',
    status: 'rejected',
    attendanceStatus: 'absent',
    timestamp: '2026-05-18 20:00:00',
    markedAt: '2026-05-18 20:00:00',
    proof: 'proof-cultural-night-chaeyoung.jpg',
  },
  {
    id: 'att-10',
    activityId: 'act-4',
    activityTitle: 'Cultural Night',
    userId: '3',
    userName: 'Momo',
    date: '2026-05-18',
    status: 'approved',
    attendanceStatus: 'late',
    timestamp: '2026-05-18 18:45:00',
    markedAt: '2026-05-18 18:45:00',
  },
  {
    id: 'att-7',
    activityId: 'act-1',
    activityTitle: 'Community Service Day',
    userId: '3',
    userName: 'Momo',
    date: '2026-05-08',
    status: 'eligible',
    attendanceStatus: 'absent',
  },
  {
    id: 'att-8',
    activityId: 'act-1',
    activityTitle: 'Community Service Day',
    userId: '4',
    userName: 'Sana',
    date: '2026-05-08',
    status: 'eligible',
    attendanceStatus: 'absent',
  },
  {
    id: 'att-9',
    activityId: 'act-2',
    activityTitle: 'Tech Workshop: Web Development',
    userId: '3',
    userName: 'Momo',
    date: '2026-05-12',
    status: 'eligible',
    attendanceStatus: 'absent',
  },
  {
    id: 'att-11',
    activityId: 'act-3',
    activityTitle: 'Annual Sports Festival',
    userId: '6',
    userName: 'Mina',
    date: '2026-05-15',
    status: 'approved',
    attendanceStatus: 'present',
    timestamp: '2026-05-15 09:45:00',
    markedAt: '2026-05-15 09:45:00',
  },
  {
    id: 'att-12',
    activityId: 'act-3',
    activityTitle: 'Annual Sports Festival',
    userId: '8',
    userName: 'Chaeyoung',
    date: '2026-05-15',
    status: 'rejected',
    attendanceStatus: 'absent',
    timestamp: '2026-05-15 17:00:00',
    markedAt: '2026-05-15 17:00:00',
  },
  {
    id: 'att-13',
    activityId: 'act-4',
    activityTitle: 'Cultural Night',
    userId: '7',
    userName: 'Dahyun',
    date: '2026-05-18',
    status: 'approved',
    attendanceStatus: 'present',
    timestamp: '2026-05-18 18:12:00',
    markedAt: '2026-05-18 18:12:00',
  },
  {
    id: 'att-14',
    activityId: 'act-1',
    activityTitle: 'Community Service Day',
    userId: '8',
    userName: 'Chaeyoung',
    date: '2026-05-08',
    status: 'eligible',
    attendanceStatus: 'absent',
  },
  {
    id: 'att-15',
    activityId: 'act-2',
    activityTitle: 'Tech Workshop: Web Development',
    userId: '8',
    userName: 'Chaeyoung',
    date: '2026-05-12',
    status: 'eligible',
    attendanceStatus: 'absent',
  },
];

export const certificates: Certificate[] = [
  {
    id: 'cert-001',
    userId: '3',
    activityId: 'act-3',
    attendanceId: 'att-1',
    certificateNumber: 'UYA-CERT-2026-001',
    issuedAt: '2026-05-16',
    verificationCode: 'UYA-A3-MOMO-001',
  },
  {
    id: 'cert-002',
    userId: '4',
    activityId: 'act-3',
    attendanceId: 'att-2',
    certificateNumber: 'UYA-CERT-2026-002',
    issuedAt: '2026-05-16',
    verificationCode: 'UYA-A3-SANA-002',
  },
  {
    id: 'cert-003',
    userId: '4',
    activityId: 'act-4',
    attendanceId: 'att-4',
    certificateNumber: 'UYA-CERT-2026-003',
    issuedAt: '2026-05-19',
    verificationCode: 'UYA-A4-SANA-003',
  },
  {
    id: 'cert-004',
    userId: '6',
    activityId: 'act-4',
    attendanceId: 'att-5',
    certificateNumber: 'UYA-CERT-2026-004',
    issuedAt: '2026-05-19',
    verificationCode: 'UYA-A4-MINA-004',
  },
  {
    id: 'cert-005',
    userId: '3',
    activityId: 'act-4',
    attendanceId: 'att-10',
    certificateNumber: 'UYA-CERT-2026-005',
    issuedAt: '2026-05-19',
    verificationCode: 'UYA-A4-MOMO-005',
  },
  {
    id: 'cert-006',
    userId: '6',
    activityId: 'act-3',
    attendanceId: 'att-11',
    certificateNumber: 'UYA-CERT-2026-006',
    issuedAt: '2026-05-16',
    verificationCode: 'UYA-A3-MINA-006',
  },
  {
    id: 'cert-007',
    userId: '7',
    activityId: 'act-4',
    attendanceId: 'att-13',
    certificateNumber: 'UYA-CERT-2026-007',
    issuedAt: '2026-05-19',
    verificationCode: 'UYA-A4-DAHYUN-007',
  },
];

const makeMockVoters = (count: number, includeIds: string[] = []): string[] => {
  // Use real mock account IDs first so the 35-member wireframe looks consistent.
  // Tzuyu is intentionally excluded so her blank-clean account stays completely empty.
  const realMockVoterIds = users
    .filter(user => user.id !== '9')
    .map(user => user.id);

  const voters = [...includeIds];

  realMockVoterIds.forEach(userId => {
    if (voters.length < count && !voters.includes(userId)) {
      voters.push(userId);
    }
  });

  let index = 1;
  while (voters.length < count) {
    const mockId = `mock-voter-${index}`;
    if (!voters.includes(mockId)) {
      voters.push(mockId);
    }
    index += 1;
  }

  return voters;
};

export const proposals: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Tupad CleanUp Drive',
    description: 'A CleanUp Drive in Carmona City',
    location: 'Carmona City Plaza',
    duration: '4 hours',
    proposedDate: '2026-05-10',
    proposerId: '1',
    proposerName: 'Nayeon',
    status: 'pending',
    phase: 'submission',
    reviewStatus: 'pending_review',
    createdAt: '2026-04-20',
    yesVotes: 12,
    noVotes: 3,
    voters: makeMockVoters(15, ['3']),
    votingDeadline: '2026-05-20',
  },
  {
    id: 'prop-2',
    title: 'Feeding Program',
    description: 'Request budget allocation for a feeding project in GMA, Cavite',
    location: 'GMA, Cavite',
    duration: 'Half day',
    proposedDate: '2026-05-14',
    proposerId: '5',
    proposerName: 'Jihyo',
    status: 'approved',
    phase: 'closed',
    reviewStatus: 'approved_for_voting',
    createdAt: '2026-04-18',
    yesVotes: 29,
    noVotes: 4,
    voters: makeMockVoters(33, ['3']),
    votingDeadline: '2026-05-02',
  },
  {
    id: 'prop-3',
    title: 'Online Seminar',
    description: 'Propose a seminar for youth about digital responsibility and safe online behavior.',
    location: 'Zoom/Online',
    duration: '2 hours',
    proposedDate: '2026-05-17',
    proposerId: '2',
    proposerName: 'Jeongyeon',
    status: 'pending',
    phase: 'voting',
    reviewStatus: 'approved_for_voting',
    createdAt: '2026-04-16',
    yesVotes: 20,
    noVotes: 15,
    voters: makeMockVoters(35),
    votingDeadline: '2026-05-01',
  },
  {
    id: 'prop-4',
    title: 'CleanUp Drive in Carmona City',
    description: 'Organize a community cleanup drive',
    location: 'Carmona City',
    duration: '3 hours',
    proposedDate: '2026-05-24',
    proposerId: '3',
    proposerName: 'Momo',
    status: 'pending',
    phase: 'submission',
    reviewStatus: 'revision_requested',
    reviewFeedbackHistory: [
      {
        id: 'review-prop-4-1',
        type: 'revision',
        officerId: '1',
        officerName: 'Nayeon',
        message: 'Please revise the venue details and adjust the duration so the activity plan is easier to schedule.',
        timestamp: '2026-05-05T09:00:00.000Z',
      },
    ],
    createdAt: '2026-04-23',
    yesVotes: 0,
    noVotes: 0,
    voters: [],
    votingDeadline: '2026-05-28',
  },
  {
    id: 'prop-5',
    title: 'Photography Contest',
    description: 'Monthly photography contest with themes to showcase member creativity',
    location: 'Online Platform',
    duration: '1 month',
    proposedDate: '2026-05-26',
    proposerId: '6',
    proposerName: 'Mina',
    status: 'approved',
    phase: 'closed',
    reviewStatus: 'approved_for_voting',
    createdAt: '2026-04-19',
    yesVotes: 30,
    noVotes: 2,
    voters: makeMockVoters(32, ['3']),
    votingDeadline: '2026-05-03',
  },
  {
    id: 'prop-6',
    title: 'Community Garden Project',
    description: 'Start a community garden where members can grow vegetables and flowers together',
    location: 'Carmona Community Center',
    duration: 'Ongoing',
    proposedDate: '2026-05-30',
    proposerId: '7',
    proposerName: 'Dahyun',
    status: 'pending',
    phase: 'voting',
    reviewStatus: 'approved_for_voting',
    createdAt: '2026-04-25',
    yesVotes: 5,
    noVotes: 1,
    // Active mock voting item. Momo is intentionally not included so the feature-showcase
    // member account can still see the Vote Yes / Vote No buttons and feedback pop-up.
    voters: ['1', '2', '4', '5', '6', '8'],
    votingDeadline: '2026-05-31',
  },
  {
    id: 'prop-7',
    title: 'Youth Digital Literacy Bootcamp',
    description: 'A beginner-friendly training program that helps youth members learn basic computer safety, productivity tools, and responsible internet use.',
    location: 'GMA Community Learning Center',
    duration: '1 day',
    proposedDate: '2026-05-27',
    proposerId: '3',
    proposerName: 'Momo',
    status: 'approved',
    phase: 'closed',
    reviewStatus: 'approved_for_voting',
    createdAt: '2026-05-04',
    yesVotes: 28,
    noVotes: 7,
    voters: makeMockVoters(35),
    votingDeadline: '2026-05-12',
  },
  {
    id: 'prop-8',
    title: 'Weekend Movie Night Fundraiser',
    description: 'A small fundraising activity proposal that did not meet the required 80% approval threshold from member voting.',
    location: 'UYA Activity Area',
    duration: '3 hours',
    proposedDate: '2026-05-25',
    proposerId: '3',
    proposerName: 'Momo',
    status: 'rejected',
    phase: 'closed',
    reviewStatus: 'rejected',
    rejectionReason: 'Did not reach the 80% voting requirement.',
    reviewFeedbackHistory: [
      {
        id: 'review-prop-8-1',
        type: 'rejection',
        officerId: '1',
        officerName: 'Nayeon',
        message: 'This proposal did not reach the required 80% approval from member voting.',
        timestamp: '2026-05-11T10:00:00.000Z',
      },
    ],
    createdAt: '2026-05-04',
    yesVotes: 20,
    noVotes: 15,
    voters: makeMockVoters(35),
    votingDeadline: '2026-05-10',
  },
  {
    id: 'prop-9',
    title: 'Peer Tutoring Circle',
    description: 'A small study-support circle where members help other youth with basic school subjects and project planning.',
    location: 'UYA Activity Area',
    duration: '2 hours',
    proposedDate: '2026-05-23',
    proposerId: '4',
    proposerName: 'Sana',
    status: 'approved',
    phase: 'closed',
    reviewStatus: 'approved_for_voting',
    createdAt: '2026-04-27',
    yesVotes: 31,
    noVotes: 2,
    voters: makeMockVoters(33),
    votingDeadline: '2026-05-11',
  },
  {
    id: 'prop-10',
    title: 'Open Mic Night',
    description: 'A casual talent-sharing night that shows a rejected proposal example for the voting outcome report.',
    location: 'Barangay Covered Court',
    duration: '3 hours',
    proposedDate: '2026-05-28',
    proposerId: '8',
    proposerName: 'Chaeyoung',
    status: 'rejected',
    phase: 'closed',
    reviewStatus: 'rejected',
    rejectionReason: 'Did not reach the 80% voting requirement.',
    reviewFeedbackHistory: [
      {
        id: 'review-prop-10-1',
        type: 'rejection',
        officerId: '2',
        officerName: 'Jeongyeon',
        message: 'The proposal was closed because it did not reach the required voting threshold.',
        timestamp: '2026-05-10T15:00:00.000Z',
      },
    ],
    createdAt: '2026-04-29',
    yesVotes: 14,
    noVotes: 18,
    voters: makeMockVoters(32),
    votingDeadline: '2026-05-09',
  }
];

export const votes: Vote[] = [
  {
    id: 'vote-1',
    proposalId: 'prop-1',
    userId: '1',
    vote: 'yes',
    timestamp: '2026-03-16 10:00:00',
  },
  {
    id: 'vote-2',
    proposalId: 'prop-1',
    userId: '2',
    vote: 'yes',
    timestamp: '2026-03-16 10:05:00',
  },
  {
    id: 'vote-3',
    proposalId: 'prop-1',
    userId: '3',
    vote: 'yes',
    timestamp: '2026-03-16 10:10:00',
  },
  {
    id: 'vote-4',
    proposalId: 'prop-1',
    userId: '4',
    vote: 'no',
    timestamp: '2026-03-16 10:15:00',
  },
  {
    id: 'vote-5',
    proposalId: 'prop-2',
    userId: '1',
    vote: 'yes',
    timestamp: '2026-03-19 11:00:00',
  },
  {
    id: 'vote-6',
    proposalId: 'prop-2',
    userId: '2',
    vote: 'yes',
    timestamp: '2026-03-19 11:05:00',
  },
  {
    id: 'vote-7',
    proposalId: 'prop-2',
    userId: '3',
    vote: 'yes',
    timestamp: '2026-03-19 11:10:00',
  },
  {
    id: 'vote-8',
    proposalId: 'prop-2',
    userId: '4',
    vote: 'yes',
    timestamp: '2026-03-19 11:15:00',
  },
  {
    id: 'vote-9',
    proposalId: 'prop-2',
    userId: '5',
    vote: 'yes',
    timestamp: '2026-03-19 11:20:00',
  },
  {
    id: 'vote-10',
    proposalId: 'prop-3',
    userId: '1',
    vote: 'yes',
    timestamp: '2026-03-21 12:00:00',
  },
  {
    id: 'vote-11',
    proposalId: 'prop-3',
    userId: '2',
    vote: 'yes',
    timestamp: '2026-03-21 12:05:00',
  },
  {
    id: 'vote-12',
    proposalId: 'prop-3',
    userId: '3',
    vote: 'no',
    timestamp: '2026-03-21 12:10:00',
  },
  {
    id: 'vote-13',
    proposalId: 'prop-3',
    userId: '4',
    vote: 'no',
    timestamp: '2026-03-21 12:15:00',
  },
  {
    id: 'vote-14',
    proposalId: 'prop-3',
    userId: '5',
    vote: 'no',
    timestamp: '2026-03-21 12:20:00',
  },
];


export const proposalVoteFeedbacks: ProposalVoteFeedback[] = [
  {
    id: 'feedback-prop-1-1',
    proposalId: 'prop-1',
    userId: '3',
    userName: 'Momo',
    vote: 'yes',
    message: 'This cleanup drive is useful because Carmona City Plaza is a visible area and many youth members can participate after class.',
    timestamp: '2026-05-04T09:15:00.000Z',
  },
  {
    id: 'feedback-prop-1-2',
    proposalId: 'prop-1',
    userId: '4',
    userName: 'Sana',
    vote: 'yes',
    message: 'I support this proposal, but the organizers should prepare gloves, trash bags, and drinking water for volunteers.',
    timestamp: '2026-05-04T09:40:00.000Z',
  },
  {
    id: 'feedback-prop-1-3',
    proposalId: 'prop-1',
    userId: '6',
    userName: 'Mina',
    vote: 'no',
    message: 'The activity is good, but the schedule might conflict with other May events. A clearer time plan would help.',
    timestamp: '2026-05-04T10:05:00.000Z',
  },
  {
    id: 'feedback-prop-6-1',
    proposalId: 'prop-6',
    userId: '1',
    userName: 'Nayeon',
    vote: 'yes',
    message: 'The community garden can be sustained if the proposal adds a simple maintenance schedule per member group.',
    timestamp: '2026-05-06T13:20:00.000Z',
  },
  {
    id: 'feedback-prop-6-2',
    proposalId: 'prop-6',
    userId: '2',
    userName: 'Jeongyeon',
    vote: 'yes',
    message: 'This is aligned with community improvement and can involve members who prefer long-term activities.',
    timestamp: '2026-05-06T14:00:00.000Z',
  },
  {
    id: 'feedback-prop-6-3',
    proposalId: 'prop-6',
    userId: '8',
    userName: 'Chaeyoung',
    vote: 'no',
    message: 'The idea is nice, but the proposal should explain who will handle tools and watering responsibilities.',
    timestamp: '2026-05-06T14:25:00.000Z',
  },
  {
    id: 'feedback-prop-7-1',
    proposalId: 'prop-7',
    userId: '4',
    userName: 'Sana',
    vote: 'yes',
    message: 'Digital literacy is helpful for youth members, especially for students who need basic productivity and online safety skills.',
    timestamp: '2026-05-07T08:30:00.000Z',
  },
  {
    id: 'feedback-prop-7-2',
    proposalId: 'prop-7',
    userId: '7',
    userName: 'Dahyun',
    vote: 'yes',
    message: 'The topic is practical and easy to conduct in one day if the lessons are divided into short modules.',
    timestamp: '2026-05-07T09:10:00.000Z',
  },
  {
    id: 'feedback-prop-8-1',
    proposalId: 'prop-8',
    userId: '5',
    userName: 'Jihyo',
    vote: 'no',
    message: 'The fundraiser goal is unclear, so members may not understand where the collected amount will be used.',
    timestamp: '2026-05-08T16:20:00.000Z',
  },
  {
    id: 'feedback-prop-8-2',
    proposalId: 'prop-8',
    userId: '6',
    userName: 'Mina',
    vote: 'yes',
    message: 'This can still work if the organizer adds a clearer budget plan and beneficiary details.',
    timestamp: '2026-05-08T16:45:00.000Z',
  },
  {
    id: 'feedback-prop-10-1',
    proposalId: 'prop-10',
    userId: '2',
    userName: 'Jeongyeon',
    vote: 'no',
    message: 'The event may be fun, but it does not clearly support the current UYA goals compared with other proposals.',
    timestamp: '2026-05-09T15:30:00.000Z',
  },
  {
    id: 'feedback-prop-10-2',
    proposalId: 'prop-10',
    userId: '3',
    userName: 'Momo',
    vote: 'no',
    message: 'The proposal needs stronger details about purpose, venue control, and expected participants.',
    timestamp: '2026-05-09T16:00:00.000Z',
  },
];

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Helper function to get activity by ID
export const getActivityById = (id: string): Activity | undefined => {
  return activities.find(activity => activity.id === id);
};

// Helper function to get attendance records by user ID
export const getAttendanceByUserId = (userId: string): AttendanceRecord[] => {
  return attendanceRecords.filter(record => record.userId === userId);
};

// Helper function to get attendance records by activity ID
export const getAttendanceByActivityId = (activityId: string): AttendanceRecord[] => {
  return attendanceRecords.filter(record => record.activityId === activityId);
};

// Helper function to check if an attendance record is QR-validated
// In the current mock system, approved attendance with markedAt/timestamp represents successful QR validation.
export const isAttendanceValidatedForCertificate = (record: AttendanceRecord): boolean => {
  return record.status === 'approved' && Boolean(record.markedAt || record.timestamp);
};

// Helper function to get certificates by user ID
export const getCertificatesByUserId = (userId: string): Certificate[] => {
  return certificates.filter(certificate => {
    const attendance = attendanceRecords.find(record => record.id === certificate.attendanceId);
    const activity = activities.find(item => item.id === certificate.activityId);

    return (
      certificate.userId === userId &&
      attendance !== undefined &&
      activity !== undefined &&
      activity.status === 'completed' &&
      isAttendanceValidatedForCertificate(attendance)
    );
  });
};

// Helper function to get certificate by ID
export const getCertificateById = (id: string): Certificate | undefined => {
  return certificates.find(certificate => certificate.id === id);
};

// Helper function to get certificate by attendance ID
export const getCertificateByAttendanceId = (attendanceId: string): Certificate | undefined => {
  return certificates.find(certificate => certificate.attendanceId === attendanceId);
};

// Helper function to get certificate records for admin/coordinator management
export const getCertificateRecords = () => {
  return attendanceRecords.map(record => {
    const member = users.find(user => user.id === record.userId);
    const activity = activities.find(item => item.id === record.activityId);
    const certificate = certificates.find(item => item.attendanceId === record.id);
    const isEligible = activity?.status === 'completed' && isAttendanceValidatedForCertificate(record);

    return {
      id: `cert-record-${record.id}`,
      attendanceId: record.id,
      userId: record.userId,
      memberName: member?.name ?? record.userName,
      activityId: record.activityId,
      activityTitle: activity?.title ?? record.activityTitle,
      activityDate: activity?.date ?? record.date,
      attendanceStatus: isEligible ? 'Present' : 'Not Present',
      certificateStatus: isEligible ? 'Certificate Available' : 'Not Eligible',
      certificateNumber: certificate?.certificateNumber ?? '',
      issuedAt: certificate?.issuedAt ?? '',
      certificateId: certificate?.id ?? '',
      verificationCode: certificate?.verificationCode ?? '',
    };
  });
};

// Helper function to get proposal by ID
export const getProposalById = (id: string): Proposal | undefined => {
  return proposals.find(proposal => proposal.id === id);
};

// Helper function to get votes by proposal ID
export const getVotesByProposalId = (proposalId: string): Vote[] => {
  return votes.filter(vote => vote.proposalId === proposalId);
};

// Proposal submission settings (controlled by admin/coordinator)
export const proposalSettings: ProposalSettings = {
  submissionsOpen: true,
  currentPhase: 'submission', // submission | voting | closed
  submissionDeadline: '2026-05-08',
  votingDeadline: '2026-05-20',
  proposedDateStart: '2026-05-10',
  proposedDateEnd: '2026-05-31',
};

export const PROPOSAL_SETTINGS_STORAGE_KEY = 'uya-proposal-settings';

export const getStoredProposalSettings = (): ProposalSettings => {
  if (typeof window === 'undefined') return proposalSettings;

  const savedSettings = window.localStorage.getItem(PROPOSAL_SETTINGS_STORAGE_KEY);
  if (!savedSettings) return proposalSettings;

  try {
    return {
      ...proposalSettings,
      ...JSON.parse(savedSettings),
    };
  } catch {
    return proposalSettings;
  }
};

export const saveStoredProposalSettings = (settings: ProposalSettings) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROPOSAL_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};