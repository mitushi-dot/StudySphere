import { type User, type InsertUser, type Course, type InsertCourse, type Content, type InsertContent, type Enrollment, type InsertEnrollment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getCoursesByTeacher(teacherId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Content methods
  getContentByCourse(courseId: string): Promise<Content[]>;
  getContent(id: string): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  updateContentViews(id: string): Promise<void>;
  deleteContent(id: string): Promise<boolean>;
  
  // Enrollment methods
  getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  isEnrolled(studentId: string, courseId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private content: Map<string, Content>;
  private enrollments: Map<string, Enrollment>;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.content = new Map();
    this.enrollments = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample teacher
    const teacherId = randomUUID();
    const teacher: User = {
      id: teacherId,
      username: "teacher@example.com",
      password: "password123",
      name: "Prof. Johnson",
      role: "teacher",
      createdAt: new Date(),
    };
    this.users.set(teacherId, teacher);

    // Create sample student
    const studentId = randomUUID();
    const student: User = {
      id: studentId,
      username: "student@example.com",
      password: "password123",
      name: "John Doe",
      role: "student",
      createdAt: new Date(),
    };
    this.users.set(studentId, student);

    // Create sample courses
    const mathCourseId = randomUUID();
    const mathCourse: Course = {
      id: mathCourseId,
      title: "Mathematics 101",
      description: "Basic algebra and geometry concepts",
      teacherId: teacherId,
      teacherName: "Prof. Johnson",
      icon: "fas fa-calculator",
      color: "academic-blue",
      createdAt: new Date(),
    };
    this.courses.set(mathCourseId, mathCourse);

    const physicsCourseId = randomUUID();
    const physicsCourse: Course = {
      id: physicsCourseId,
      title: "Physics 201",
      description: "Mechanics and thermodynamics",
      teacherId: teacherId,
      teacherName: "Dr. Smith",
      icon: "fas fa-atom",
      color: "success-green",
      createdAt: new Date(),
    };
    this.courses.set(physicsCourseId, physicsCourse);

    const csCourseId = randomUUID();
    const csCourse: Course = {
      id: csCourseId,
      title: "Computer Science",
      description: "Programming fundamentals",
      teacherId: teacherId,
      teacherName: "Prof. Davis",
      icon: "fas fa-code",
      color: "purple-600",
      createdAt: new Date(),
    };
    this.courses.set(csCourseId, csCourse);

    // Create sample content
    const content1Id = randomUUID();
    const content1: Content = {
      id: content1Id,
      courseId: mathCourseId,
      title: "Introduction to Algebra",
      description: "Basic concepts and fundamentals",
      type: "video",
      fileName: "intro-algebra.mp4",
      fileSize: "15.3 MB",
      filePath: "/uploads/intro-algebra.mp4",
      views: "143",
      createdAt: new Date(),
    };
    this.content.set(content1Id, content1);

    const content2Id = randomUUID();
    const content2: Content = {
      id: content2Id,
      courseId: mathCourseId,
      title: "Chapter 1 - Equations",
      description: "Detailed study material PDF",
      type: "document",
      fileName: "chapter-1-equations.pdf",
      fileSize: "2.3 MB",
      filePath: "/uploads/chapter-1-equations.pdf",
      views: "89",
      createdAt: new Date(),
    };
    this.content.set(content2Id, content2);

    // Create sample enrollment
    const enrollmentId = randomUUID();
    const enrollment: Enrollment = {
      id: enrollmentId,
      studentId: studentId,
      courseId: mathCourseId,
      enrolledAt: new Date(),
    };
    this.enrollments.set(enrollmentId, enrollment);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.teacherId === teacherId,
    );
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = { 
      ...insertCourse, 
      id,
      createdAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  async getContentByCourse(courseId: string): Promise<Content[]> {
    return Array.from(this.content.values()).filter(
      (content) => content.courseId === courseId,
    );
  }

  async getContent(id: string): Promise<Content | undefined> {
    return this.content.get(id);
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = randomUUID();
    const content: Content = { 
      ...insertContent, 
      id,
      description: insertContent.description || null,
      views: "0",
      createdAt: new Date(),
    };
    this.content.set(id, content);
    return content;
  }

  async updateContentViews(id: string): Promise<void> {
    const content = this.content.get(id);
    if (content) {
      const views = parseInt(content.views) + 1;
      const updatedContent = { ...content, views: views.toString() };
      this.content.set(id, updatedContent);
    }
  }

  async deleteContent(id: string): Promise<boolean> {
    return this.content.delete(id);
  }

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.studentId === studentId,
    );
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.courseId === courseId,
    );
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = randomUUID();
    const enrollment: Enrollment = { 
      ...insertEnrollment, 
      id,
      enrolledAt: new Date(),
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    return Array.from(this.enrollments.values()).some(
      (enrollment) => enrollment.studentId === studentId && enrollment.courseId === courseId,
    );
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, password: newPassword };
      this.users.set(userId, updatedUser);
    }
  }
}

export const storage = new MemStorage();
