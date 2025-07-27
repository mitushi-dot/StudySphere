import { promises as fs } from 'fs';
import path from 'path';
import { type User, type Course, type Content, type Enrollment } from '@shared/schema';

export class FileStorage {
  private dataDir = path.join(process.cwd(), 'data');
  private usersFile = path.join(this.dataDir, 'users.json');
  private coursesFile = path.join(this.dataDir, 'courses.json');
  private contentFile = path.join(this.dataDir, 'content.json');
  private enrollmentsFile = path.join(this.dataDir, 'enrollments.json');

  constructor() {}

  async connect(): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize empty JSON files if they don't exist
      await this.initializeFile(this.usersFile, []);
      await this.initializeFile(this.coursesFile, []);
      await this.initializeFile(this.contentFile, []);
      await this.initializeFile(this.enrollmentsFile, []);
      
      console.log('Connected to file storage successfully');
      
      // Initialize with sample data if collections are empty
      await this.initializeSampleData();
    } catch (error) {
      console.error('File storage initialization error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // No cleanup needed for file storage
  }

  private async initializeFile(filePath: string, defaultData: any[]): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  private async readFile<T>(filePath: string): Promise<T[]> {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  private async writeFile<T>(filePath: string, data: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // User methods
  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.readFile<User>(this.usersFile);
    return users.find(user => user.username === username) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.readFile<User>(this.usersFile);
    return users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<User, '_id'>): Promise<User> {
    const users = await this.readFile<User>(this.usersFile);
    const newUser = userData as User;
    users.push(newUser);
    await this.writeFile(this.usersFile, users);
    return newUser;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const users = await this.readFile<User>(this.usersFile);
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      await this.writeFile(this.usersFile, users);
    }
  }

  // Course methods
  async getCourses(): Promise<Course[]> {
    return await this.readFile<Course>(this.coursesFile);
  }

  async getCourse(id: string): Promise<Course | null> {
    const courses = await this.readFile<Course>(this.coursesFile);
    return courses.find(course => course.id === id) || null;
  }

  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    const courses = await this.readFile<Course>(this.coursesFile);
    return courses.filter(course => course.teacherId === teacherId);
  }

  async createCourse(courseData: Omit<Course, '_id'>): Promise<Course> {
    const courses = await this.readFile<Course>(this.coursesFile);
    const newCourse = courseData as Course;
    courses.push(newCourse);
    await this.writeFile(this.coursesFile, courses);
    return newCourse;
  }

  // Content methods
  async getContentByCourse(courseId: string): Promise<Content[]> {
    const content = await this.readFile<Content>(this.contentFile);
    return content.filter(item => item.courseId === courseId);
  }

  async getContent(id: string): Promise<Content | null> {
    const content = await this.readFile<Content>(this.contentFile);
    return content.find(item => item.id === id) || null;
  }

  async createContent(contentData: Omit<Content, '_id'>): Promise<Content> {
    const content = await this.readFile<Content>(this.contentFile);
    const newContent = contentData as Content;
    content.push(newContent);
    await this.writeFile(this.contentFile, content);
    return newContent;
  }

  async updateContentViews(id: string): Promise<void> {
    const content = await this.readFile<Content>(this.contentFile);
    const contentIndex = content.findIndex(item => item.id === id);
    if (contentIndex !== -1) {
      const views = parseInt(content[contentIndex].views) + 1;
      content[contentIndex].views = views.toString();
      await this.writeFile(this.contentFile, content);
    }
  }

  async deleteContent(id: string): Promise<boolean> {
    const content = await this.readFile<Content>(this.contentFile);
    const initialLength = content.length;
    const filteredContent = content.filter(item => item.id !== id);
    if (filteredContent.length !== initialLength) {
      await this.writeFile(this.contentFile, filteredContent);
      return true;
    }
    return false;
  }

  // Enrollment methods
  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    const enrollments = await this.readFile<Enrollment>(this.enrollmentsFile);
    return enrollments.filter(enrollment => enrollment.studentId === studentId);
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    const enrollments = await this.readFile<Enrollment>(this.enrollmentsFile);
    return enrollments.filter(enrollment => enrollment.courseId === courseId);
  }

  async createEnrollment(enrollmentData: Omit<Enrollment, '_id'>): Promise<Enrollment> {
    const enrollments = await this.readFile<Enrollment>(this.enrollmentsFile);
    const newEnrollment = enrollmentData as Enrollment;
    enrollments.push(newEnrollment);
    await this.writeFile(this.enrollmentsFile, enrollments);
    return newEnrollment;
  }

  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const enrollments = await this.readFile<Enrollment>(this.enrollmentsFile);
    return enrollments.some(enrollment => 
      enrollment.studentId === studentId && enrollment.courseId === courseId
    );
  }

  private async initializeSampleData(): Promise<void> {
    try {
      // Check if data already exists
      const users = await this.readFile<User>(this.usersFile);
      if (users.length > 0) {
        console.log('Sample data already exists, skipping initialization');
        return;
      }

      console.log('Initializing sample data...');
      
      // Create sample users with hashed passwords
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const teacherId = randomUUID();
      const studentId = randomUUID();
      
      const teacher: User = {
        id: teacherId,
        username: 'teacher@example.com',
        password: hashedPassword,
        name: 'Prof. Johnson',
        role: 'teacher',
        createdAt: new Date()
      };
      
      const student: User = {
        id: studentId,
        username: 'student@example.com',
        password: hashedPassword,
        name: 'John Doe',
        role: 'student',
        createdAt: new Date()
      };
      
      await this.writeFile(this.usersFile, [teacher, student]);
      
      // Create sample courses
      const mathCourseId = randomUUID();
      const physicsCourseId = randomUUID();
      
      const mathCourse: Course = {
        id: mathCourseId,
        title: 'Mathematics 101',
        description: 'Basic algebra and geometry concepts',
        teacherId: teacherId,
        teacherName: 'Prof. Johnson',
        icon: 'fas fa-calculator',
        color: 'academic-blue',
        createdAt: new Date()
      };
      
      const physicsCourse: Course = {
        id: physicsCourseId,
        title: 'Physics 201',
        description: 'Mechanics and thermodynamics',
        teacherId: teacherId,
        teacherName: 'Prof. Johnson',
        icon: 'fas fa-atom',
        color: 'success-green',
        createdAt: new Date()
      };
      
      await this.writeFile(this.coursesFile, [mathCourse, physicsCourse]);
      
      // Create sample content
      const content1Id = randomUUID();
      const content1: Content = {
        id: content1Id,
        courseId: mathCourseId,
        title: 'Introduction to Algebra',
        description: 'Basic concepts and fundamentals',
        type: 'video',
        fileName: 'intro-algebra.mp4',
        fileSize: '15.3 MB',
        filePath: '/uploads/intro-algebra.mp4',
        views: '143',
        createdAt: new Date()
      };
      
      await this.writeFile(this.contentFile, [content1]);
      
      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
}

import { randomUUID } from 'crypto';

export const fileStorage = new FileStorage();