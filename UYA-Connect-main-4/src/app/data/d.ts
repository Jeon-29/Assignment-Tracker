export type UserRole = 'member' | 'admin' | 'coordinator';

export interface User {
  id: string;
  name: string;
  email: string;
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
  timestamp?: string;
  proof?: string;
  markedAt?: string;
  submittedAt?: string;
  proofUrl?: string;
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
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

export interface ProposalSettings {
  submissionsOpen: boolean;
  currentPhase: 'submission' | 'voting' | 'closed';
  submissionDeadline?: string;
}

// TWICE members as mock users
export const users: User[] = [
  {
    id: '1',
    name: 'Nayeon',
    email: 'nayeon@gmail.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jeongyeon',
    email: 'jeongyeon@gmail.com',
    role: 'coordinator',
    status: 'active',
  },
  {
    id: '3',
    name: 'Momo',
    email: 'momo@gmail.com',
    role: 'member',
    status: 'active',
  },
  {
    id: '4',
    name: 'Sana',
    email: 'sana@gmail.com',
    role: 'member',
    status: 'active',
  },
  {
    id: '5',
    name: 'Jihyo',
    email: 'jihyo@gmail.com',
    role: 'coordinator',
    status: 'active',
  },
  {
    id: '6',
    name: 'Mina',
    email: 'mina@gmail.com',
    role: 'member',
    status: 'active',
  },
  {
    id: '7',
    name: 'Dahyun',
    email: 'dahyun@gmail.com',
    role: 'member',
    status: 'active',
  },
  {
    id: '8',
    name: 'Chaeyoung',
    email: 'chaeyoung@gmail.com',
    role: 'member',
    status: 'active',
  },
  {
    id: '9',
    name: 'Tzuyu',
    email: 'tzuyu@gmail.com',
    role: 'member',
    status: 'active',
  },
  {
    id: '10',
    name: 'Park Jinyoung',
    email: 'jyp@gmail.com',
    role: 'member',
    status: 'active',
  },
];

export const activities: Activity[] = [
  {
    id: 'act-1',
    title: 'Community Service Day',
    date: '2026-03-25',
    location: 'Carmona City Park',
    organizer: 'Nayeon',
    description: 'Join us for a day of community service cleaning up the local park.',
    participants: ['1', '2', '3', '4', '5'],
    status: 'upcoming',
    registrationOpen: false,
    attendanceOpen: false,
  },
  {
    id: 'act-2',
    title: 'Tech Workshop: Web Development',
    date: '2026-03-22',
    location: 'SM Aura',
    organizer: 'Jihyo',
    description: 'Learn the basics of modern web development with React and TypeScript.',
    participants: ['1', '3', '5', '6', '7'],
    status: 'upcoming',
    registrationOpen: true,
    attendanceOpen: true, // Open for demo
  },
  {
    id: 'act-3',
    title: 'Annual Sports Festival',
    date: '2026-03-20',
    location: 'CvSU Main Campus',
    organizer: 'Jeongyeon',
    description: 'Annual sports competition featuring various team sports and activities.',
    participants: ['2', '3', '4', '7', '8', '9'],
    status: 'completed',
    registrationOpen: false,
    attendanceOpen: true,
  },
  {
    id: 'act-4',
    title: 'Cultural Night',
    date: '2026-03-15',
    location: 'CvSU Role Hall',
    organizer: 'Nayeon',
    description: 'Celebrate diversity with cultural performances and international cuisine.',
    participants: ['1', '2', '4', '5', '6', '8', '9'],
    status: 'completed',
    registrationOpen: false,
    attendanceOpen: false,
  },
  {
    id: 'act-5',
    title: 'Leadership Training',
    date: '2026-03-28',
    location: 'Conference Room A',
    organizer: 'Jihyo',
    description: 'Develop leadership skills through interactive workshops and team activities.',
    participants: ['1', '2', '5', '6'],
    status: 'upcoming',
    registrationOpen: true,
    attendanceOpen: false,
  },
  {
    id: 'act-6',
    title: 'Environmental Awareness Campaign',
    date: '2026-04-05',
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
    date: '2026-03-20',
    status: 'approved',
    timestamp: '2026-03-20 09:30:00',
    markedAt: '2026-03-20 09:32:00',

  },
  {
    id: 'att-2',
    activityId: 'act-3',
    activityTitle: 'Annual Sports Festival',
    userId: '4',
    userName: 'Sana',
    date: '2026-03-20',
    status: 'approved',
    timestamp: '2026-03-20 09:35:00',
    markedAt: '2026-03-20 09:35:00',
  },
  {
    id: 'att-3',
    activityId: 'act-3',
    activityTitle: 'Annual Sports Festival',
    userId: '7',
    userName: 'Dahyun',
    date: '2026-03-20',
    status: 'pending',
    timestamp: '2026-03-20 10:05:00',
    markedAt: '2026-03-20 10:05:00',
  },
  {
    id: 'att-4',
    activityId: 'act-4',
    activityTitle: 'Cultural Night',
    userId: '4',
    userName: 'Sana',
    date: '2026-03-15',
    status: 'approved',
    timestamp: '2026-03-15 18:00:00',
    markedAt: '2026-03-15 18:02:00',
  },
  {
    id: 'att-5',
    activityId: 'act-4',
    activityTitle: 'Cultural Night',
    userId: '6',
    userName: 'Mina',
    date: '2026-03-15',
    status: 'approved',
    timestamp: '2026-03-15 18:05:00',
    markedAt: '2026-03-15 18:05:00',
    proof: 'proof-cultural-night-mina.jpg',
  },
  {
    id: 'att-6',
    activityId: 'act-4',
    activityTitle: 'Cultural Night',
    userId: '8',
    userName: 'Chaeyoung',
    date: '2026-03-15',
    status: 'rejected',
    timestamp: '2026-03-15 20:00:00',
    markedAt: '2026-03-15 20:00:00',
    proof: 'proof-cultural-night-chaeyoung.jpg',
  },
  {
    id: 'att-7',
    activityId: 'act-1',
    activityTitle: 'Community Service Day',
    userId: '3',
    userName: 'Momo',
    date: '2026-03-25',
    status: 'eligible',
  },
  {
    id: 'att-8',
    activityId: 'act-1',
    activityTitle: 'Community Service Day',
    userId: '4',
    userName: 'Sana',
    date: '2026-03-25',
    status: 'eligible',
  },
  {
    id: 'att-9',
    activityId: 'act-2',
    activityTitle: 'Tech Workshop: Web Development',
    userId: '3',
    userName: 'Momo',
    date: '2026-03-22',
    status: 'eligible',
  },
];

export const proposals: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Tupad CleanUp Drive',
    description: 'A CleanUp Drive in Carmona City',
    location: 'Carmona City Plaza',
    duration: '4 hours',
    proposedDate: '2026-03-20',
    proposerId: '1',
    proposerName: 'Nayeon',
    status: 'pending',
    createdAt: '2026-03-15',
    yesVotes: 3,
    noVotes: 1,
    voters: ['1', '2', '3', '4'],
    votingDeadline: '2026-03-25',
  },
  {
    id: 'prop-2',
    title: 'Fedding Program',
    description: 'Request budget allocation for a feeding project on GMA, Cavite',
    location: 'GMA, Cavite',
    duration: 'Half day',
    proposedDate: '2026-03-25',
    proposerId: '5',
    proposerName: 'Jihyo',
    status: 'approved',
    createdAt: '2026-03-18',
    yesVotes: 5,
    noVotes: 0,
    voters: ['1', '2', '3', '4', '5'],
    votingDeadline: '2026-03-30',
  },
  {
    id: 'prop-3',
    title: 'Online Seminar',
    description: 'Propose a seminar for youth',
    location: 'Zoom/Online',
    duration: '2 hours',
    proposedDate: '2026-04-05',
    proposerId: '2',
    proposerName: 'Jeongyeon',
    status: 'rejected',
    createdAt: '2026-03-20',
    yesVotes: 2,
    noVotes: 3,
    voters: ['1', '2', '3', '4', '5'],
    votingDeadline: '2026-04-10',
  },
  {
    id: 'prop-4',
    title: 'CleanUp Drive in Carmona City',
    description: 'Organize a community cleanup drive',
    location: 'Carmona City',
    duration: '3 hours',
    proposedDate: '2026-04-10',
    proposerId: '3',
    proposerName: 'Momo',
    status: 'pending',
    createdAt: '2026-03-19',
    yesVotes: 2,
    noVotes: 0,
    voters: ['1', '2'],
    votingDeadline: '2026-04-15',
  },
  {
    id: 'prop-5',
    title: 'Photography Contest',
    description: 'Monthly photography contest with themes to showcase member creativity',
    location: 'Online Platform',
    duration: '1 month',
    proposedDate: '2026-04-15',
    proposerId: '6',
    proposerName: 'Mina',
    status: 'approved',
    createdAt: '2026-03-17',
    yesVotes: 4,
    noVotes: 1,
    voters: ['1', '2', '3', '4', '5'],
    votingDeadline: '2026-04-20',
  },
  {
    id: 'prop-6',
    title: 'Community Garden Project',
    description: 'Start a community garden where members can grow vegetables and flowers together',
    location: 'Carmona Community Center',
    duration: 'Ongoing',
    proposedDate: '2026-04-20',
    proposerId: '7',
    proposerName: 'Dahyun',
    status: 'pending',
    createdAt: '2026-03-21',
    yesVotes: 1,
    noVotes: 0,
    voters: ['1'],
    votingDeadline: '2026-04-25',
  },
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
  currentPhase: 'voting', // submission | voting | closed
  submissionDeadline: '2026-03-30',
};