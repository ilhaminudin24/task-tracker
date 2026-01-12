import { Project } from '@/types/task';

const today = new Date();
const weekAgo = new Date(today);
weekAgo.setDate(weekAgo.getDate() - 7);
const twoWeeksAgo = new Date(today);
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
const monthAgo = new Date(today);
monthAgo.setDate(monthAgo.getDate() - 30);

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Client A',
    color: 'emerald',
    icon: '🎯',
    description: 'Landing page redesign and development for Client A',
    createdAt: monthAgo,
  },
  {
    id: 'proj-2',
    name: 'Next.js Learning',
    color: 'blue',
    icon: '💻',
    description: 'Personal learning project for Next.js 14 features',
    createdAt: twoWeeksAgo,
  },
  {
    id: 'proj-3',
    name: 'Mobile App',
    color: 'amber',
    icon: '📱',
    description: 'React Native mobile application development',
    createdAt: weekAgo,
  },
  {
    id: 'proj-4',
    name: 'Personal Blog',
    color: 'purple',
    icon: '🎨',
    description: 'Personal blog and portfolio website',
    createdAt: today,
  },
];
