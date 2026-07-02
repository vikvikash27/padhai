import { GraduationCap, Briefcase, Binary, Cloud, Code2, Server, Microscope } from 'lucide-react'

export type GoalTemplate = {
  id: string
  name: string
  description: string
  icon: 'GraduationCap' | 'Briefcase' | 'Binary' | 'Cloud' | 'Code2' | 'Server' | 'Microscope'
  role: 'Student' | 'Professional' | 'Both' | 'Research Scholar'
  durationDays: number
  dailyTargetHours: number
  milestones: string[]
}

export const goalTemplates: GoalTemplate[] = [
  {
    id: 'dsa-interview',
    name: 'DSA Interview Prep',
    description: 'Master data structures and algorithms for technical interviews',
    icon: 'Binary',
    role: 'Both',
    durationDays: 90,
    dailyTargetHours: 2,
    milestones: ['Arrays & Strings', 'Linked Lists & Stacks', 'Trees & Graphs', 'Dynamic Programming', 'Mock Interviews'],
  },
  {
    id: 'upsc-prelims',
    name: 'UPSC Prelims Prep',
    description: 'Comprehensive preparation for civil services preliminary examination',
    icon: 'GraduationCap',
    role: 'Student',
    durationDays: 180,
    dailyTargetHours: 6,
    milestones: ['Polity & Governance', 'History & Culture', 'Geography', 'Economy', 'Current Affairs & Revision'],
  },
  {
    id: 'ml-fundamentals',
    name: 'Machine Learning Fundamentals',
    description: 'Build a strong foundation in ML concepts and practical applications',
    icon: 'Binary',
    role: 'Both',
    durationDays: 60,
    dailyTargetHours: 2,
    milestones: ['Python & Math Foundations', 'Supervised Learning', 'Unsupervised Learning', 'Model Evaluation & Tuning', 'Capstone Project'],
  },
  {
    id: 'aws-cloud',
    name: 'AWS Cloud Practitioner',
    description: 'Prepare for AWS Cloud Practitioner certification exam',
    icon: 'Cloud',
    role: 'Professional',
    durationDays: 30,
    dailyTargetHours: 1.5,
    milestones: ['Cloud Concepts', 'AWS Core Services', 'Security & Compliance', 'Billing & Pricing', 'Practice Exams'],
  },
  {
    id: 'frontend-dev',
    name: 'Frontend Web Development',
    description: 'Learn modern frontend development with HTML, CSS, JavaScript and React',
    icon: 'Code2',
    role: 'Both',
    durationDays: 75,
    dailyTargetHours: 2,
    milestones: ['HTML & CSS Foundations', 'JavaScript Fundamentals', 'React Basics', 'State Management & APIs', 'Portfolio Project'],
  },
  {
    id: 'system-design',
    name: 'System Design for Engineers',
    description: 'Master scalable system design principles for senior engineering roles',
    icon: 'Server',
    role: 'Professional',
    durationDays: 45,
    dailyTargetHours: 1,
    milestones: ['Scalability Fundamentals', 'Database Design', 'Caching & Load Balancing', 'Microservices', 'Mock Design Rounds'],
  },
  {
    id: 'thesis-checkpoints',
    name: 'PhD Thesis Journey',
    description: 'Structured checkpoints from proposal to defense',
    icon: 'Microscope',
    role: 'Research Scholar',
    durationDays: 365,
    dailyTargetHours: 3,
    milestones: [
      'Research Proposal & Literature Review',
      'Methodology & Research Design',
      'Data Collection',
      'Data Analysis & Results',
      'Thesis Writing — Draft',
      'Revision & Supervisor Feedback',
      'Final Submission & Defense Prep',
    ],
  },
]

const iconMap = {
  GraduationCap,
  Briefcase,
  Binary,
  Cloud,
  Code2,
  Server,
  Microscope,
}

export function getTemplateIcon(iconName: GoalTemplate['icon']) {
  const IconComponent = iconMap[iconName]
  return IconComponent ? <IconComponent className="w-5 h-5" /> : <Code2 className="w-5 h-5" />
}