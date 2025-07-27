import { z } from "zod";

// MongoDB-compatible interfaces
export interface User {
  _id?: any;
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
  createdAt: Date;
}

export interface Course {
  _id?: any;
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  icon: string;
  color: string;
  createdAt: Date;
}

export interface Content {
  _id?: any;
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  type: string; // 'document', 'video', 'assignment'
  fileName: string;
  fileSize: string;
  filePath: string;
  views: string;
  createdAt: Date;
}

export interface Enrollment {
  _id?: any;
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
}

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['student', 'teacher']),
});

export const insertCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  teacherId: z.string(),
  teacherName: z.string(),
  icon: z.string(),
  color: z.string(),
});

export const insertContentSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string(),
  fileName: z.string(),
  fileSize: z.string(),
  filePath: z.string(),
});

export const insertEnrollmentSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
