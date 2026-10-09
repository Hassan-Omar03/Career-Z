import React from 'react';
import { createRoot } from 'react-dom/client';
import { session } from '../src/api/client';
import * as offline from '../src/utils/offlineLearning';
import { codingDocument } from '../src/utils/codingPractice';
import OfflineStudy from '../src/components/dashboard/OfflineStudy';
import LearningCenter from '../src/components/dashboard/LearningCenter';

// Test-only fixture: synthetic API responses, no credentials and no real database access.
const nativeFetch = window.fetch.bind(window);
let role = 'student';
const course = { _id: 'course-A', title: 'Offline test course', teacher: 'teacher-A', studyMode: 'hybrid', approvalWorkflow: 'direct', approvalStatus: 'approved', revision: 1, tags: [], offlineDownloadAllowed: true };
window.fetch = async (url, options) => {
  if (String(url).includes('/api/')) {
    if (String(url).endsWith('/learning/course-A')) return Response.json({ data: { course, canManage: role !== 'student', canSetPolicy: role === 'institution', canComplete: role === 'student', canReviewDepartment: role === 'institution', canReviewPrincipal: role === 'institution', units: [], lessons: [{ _id: 'lesson-A', title: 'Saved lesson', content: 'Offline notes', revision: 1, resources: [], approvalStatus: 'approved', approvalHistory: [] }], activities: [], assignments: [], exams: [] } });
    if (String(url).endsWith('/learning/course-A/analytics')) return Response.json({ data: { enrolled: 1, completionRate: 0, averageScore: 0, lessons: [], students: [] } });
    if (String(url).endsWith('/learning/course-A/backups')) return Response.json({ data: [] });
    if (String(url).endsWith('/learning/course-A/reviewers')) return Response.json({ data: { staff: [], canGrant: role === 'institution' } });
    if (String(url).endsWith('/learning/course-A/offline-package')) return Response.json({ data: { course: { _id: 'course-A', title: 'Offline test course' }, canComplete: true, lessons: [{ _id: 'lesson-A', title: 'Saved lesson', content: 'Offline notes', revision: 1, resources: [{ name: 'Notes.pdf', url: `${location.origin}/fixture.pdf` }] }], activities: [], assignments: [], downloadedAt: new Date(), expiresAt: new Date(Date.now() + 86400000) } });
    if (String(url).endsWith('/learning/mine')) return Response.json({ data: [{ _id: 'course-A', title: 'Offline test course' }] });
    if (String(url).endsWith('/learning/offline-sync')) {
      const body = JSON.parse(options.body); return Response.json({ data: body.entries.map(e => ({ lessonId: e.lessonId, kind: e.kind, status: 'synced' })) });
    }
    throw new Error('Unexpected API request in isolated fixture.');
  }
  if (String(url).endsWith('/fixture.pdf')) return new Response('%PDF fixture notes', { headers: { 'content-type': 'application/pdf' } });
  return nativeFetch(url, options);
};
session.set({ user: { _id: 'offline-user-A', fullName: 'Test Student' }, accessToken: 'fixture-only' });
const root = createRoot(document.getElementById('root'));
window.studyTest = { ...offline, session, codingDocument, mount: () => root.render(<OfflineStudy onFlash={() => {}} />), mountLearning: value => { role = value; root.render(<LearningCenter key={role} onFlash={() => {}} />); } };
offline.initOfflineLearning();
document.getElementById('ready').textContent = 'ready';
