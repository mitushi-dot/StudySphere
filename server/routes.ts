import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { fileStorage } from "./database";
import { insertUserSchema, insertCourseSchema, insertContentSchema, insertEnrollmentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// Extend session interface to include user
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      name: string;
      role: string;
    };
    loginAttempts?: number;
    lastFailedLogin?: number;
  }
}

// Extend Express Request interface for file uploads
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate secure session secret if not provided
  const sessionSecret = process.env.SESSION_SECRET || 'study-sphere-secret-key';
  
  // Session configuration with enhanced security
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'studysphere.sid', // Custom session name
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict', // CSRF protection
    },
  }));

  // Enhanced Authentication & Authorization middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ 
        message: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }
    
    // Check session expiry
    if (req.session.cookie.maxAge && req.session.cookie.maxAge < 0) {
      req.session.destroy((err: any) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ 
        message: "Session expired",
        code: "SESSION_EXPIRED"
      });
    }
    
    next();
  };

  const requireRole = (role: string) => (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ 
        message: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }
    
    if (req.session.user.role !== role) {
      return res.status(403).json({ 
        message: `Access denied. ${role} role required`,
        code: "INSUFFICIENT_PERMISSIONS"
      });
    }
    
    next();
  };

  // Rate limiting for login attempts
  const checkRateLimit = (req: any, res: any, next: any) => {
    const now = Date.now();
    const maxAttempts = 5;
    const lockoutTime = 15 * 60 * 1000; // 15 minutes
    
    if (!req.session.loginAttempts) {
      req.session.loginAttempts = 0;
    }
    
    if (req.session.loginAttempts >= maxAttempts) {
      const timeSinceLastFailed = now - (req.session.lastFailedLogin || 0);
      
      if (timeSinceLastFailed < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime - timeSinceLastFailed) / 1000 / 60);
        return res.status(429).json({ 
          message: `Too many failed attempts. Try again in ${remainingTime} minutes`,
          code: "RATE_LIMITED",
          retryAfter: remainingTime
        });
      } else {
        // Reset attempts after lockout period
        req.session.loginAttempts = 0;
        req.session.lastFailedLogin = undefined;
      }
    }
    
    next();
  };

  // Input validation middleware
  const validateInput = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data",
          code: "VALIDATION_ERROR",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };

  // Simple auth routes without password strength requirements
  
  // Registration schema - simple validation only
  const registrationSchema = z.object({
    username: z.string().email("Must be a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["student", "teacher"])
  });

  // Login schema
  const loginSchema = z.object({
    username: z.string().email("Must be a valid email address"),
    password: z.string().min(1, "Password is required")
  });

  app.post("/api/auth/register", validateInput(registrationSchema), async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await fileStorage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ 
          message: "User already exists",
          code: "USER_EXISTS"
        });
      }

      // Hash password with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const newUser = {
        id: randomUUID(),
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        createdAt: new Date()
      };
      
      const user = await fileStorage.createUser(newUser);
      
      // Create session
      req.session.user = { 
        id: user.id, 
        username: user.username, 
        name: user.name, 
        role: user.role 
      };
      
      // Reset any failed login attempts
      req.session.loginAttempts = 0;
      req.session.lastFailedLogin = undefined;
      
      res.status(201).json({ 
        message: "Account created successfully",
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: "Registration failed", 
        code: "REGISTRATION_ERROR"
      });
    }
  });

  app.post("/api/auth/login", checkRateLimit, validateInput(loginSchema), async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await fileStorage.getUserByUsername(username);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        // Increment failed login attempts
        req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
        req.session.lastFailedLogin = Date.now();
        
        return res.status(401).json({ 
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS"
        });
      }

      // Successful login - create session
      req.session.user = { 
        id: user.id, 
        username: user.username, 
        name: user.name, 
        role: user.role 
      };
      
      // Reset failed login attempts
      req.session.loginAttempts = 0;
      req.session.lastFailedLogin = undefined;
      
      res.json({ 
        message: "Login successful",
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: "Login failed", 
        code: "LOGIN_ERROR"
      });
    }
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const userId = req.session?.user?.id;
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ 
          message: "Logout failed", 
          code: "LOGOUT_ERROR"
        });
      }
      
      // Clear the session cookie
      res.clearCookie('studysphere.sid');
      
      res.json({ 
        message: "Logged out successfully",
        code: "LOGOUT_SUCCESS"
      });
    });
  });

  // Enhanced session check with additional security
  app.get("/api/auth/me", (req, res) => {
    if (req.session?.user) {
      // Regenerate session ID periodically for security
      if (Math.random() < 0.1) { // 10% chance to regenerate
        req.session.regenerate((err) => {
          if (err) console.error('Session regeneration error:', err);
        });
      }
      res.json({ 
        user: req.session.user,
        sessionInfo: {
          createdAt: req.session.cookie.originalMaxAge ? 
            new Date(Date.now() - (24 * 60 * 60 * 1000 - (req.session.cookie.maxAge || 0))).toISOString() : null,
          expiresAt: req.session.cookie.expires?.toISOString() || null
        }
      });
    } else {
      res.status(401).json({ 
        message: "Not authenticated",
        code: "AUTH_REQUIRED"
      });
    }
  });

  // Password change endpoint
  app.post("/api/auth/change-password", requireAuth, validateInput(z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters")
  })), async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.user!.id;
      
      const user = await fileStorage.getUserByUsername(req.session.user!.username);
      
      if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ 
          message: "Current password is incorrect",
          code: "INVALID_PASSWORD"
        });
      }
      
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await fileStorage.updateUserPassword(userId, newHashedPassword);
      
      res.json({ 
        message: "Password changed successfully",
        code: "PASSWORD_CHANGED"
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ 
        message: "Password change failed",
        code: "PASSWORD_CHANGE_ERROR"
      });
    }
  });

  // Session refresh endpoint
  app.post("/api/auth/refresh", requireAuth, (req, res) => {
    req.session.touch(); // Extend session
    res.json({ 
      message: "Session refreshed",
      code: "SESSION_REFRESHED",
      user: req.session.user!
    });
  });

  // Course routes
  app.get("/api/courses", requireAuth, async (req, res) => {
    try {
      const courses = await fileStorage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", requireAuth, async (req, res) => {
    try {
      const course = await fileStorage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.get("/api/teacher/courses", requireAuth, requireRole("teacher"), async (req, res) => {
    try {
      const courses = await fileStorage.getCoursesByTeacher(req.session.user!.id);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher courses" });
    }
  });

  app.post("/api/courses", requireAuth, requireRole("teacher"), async (req, res) => {
    try {
      const courseData = {
        ...req.body,
        id: randomUUID(),
        teacherId: req.session.user!.id,
        teacherName: req.session.user!.name,
        createdAt: new Date()
      };
      
      const course = await fileStorage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      res.status(400).json({ message: "Invalid course data" });
    }
  });

  // Content routes
  app.get("/api/courses/:courseId/content", requireAuth, async (req, res) => {
    try {
      const content = await fileStorage.getContentByCourse(req.params.courseId);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.post("/api/courses/:courseId/content", requireAuth, requireRole("teacher"), upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const contentData = {
        id: randomUUID(),
        courseId: req.params.courseId,
        title: req.body.title,
        description: req.body.description || null,
        type: req.body.type,
        fileName: req.file.originalname,
        fileSize: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
        filePath: req.file.path,
        views: "0",
        createdAt: new Date()
      };
      
      const content = await fileStorage.createContent(contentData);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: "Invalid content data" });
    }
  });

  app.put("/api/content/:id/view", requireAuth, async (req, res) => {
    try {
      await fileStorage.updateContentViews(req.params.id);
      res.json({ message: "View count updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update view count" });
    }
  });

  app.delete("/api/content/:id", requireAuth, requireRole("teacher"), async (req, res) => {
    try {
      const deleted = await fileStorage.deleteContent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // Enrollment routes
  app.get("/api/student/enrollments", requireAuth, requireRole("student"), async (req, res) => {
    try {
      const enrollments = await fileStorage.getEnrollmentsByStudent(req.session.user!.id);
      const enrolledCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await fileStorage.getCourse(enrollment.courseId);
          return course;
        })
      );
      res.json(enrolledCourses.filter(Boolean));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post("/api/courses/:courseId/enroll", requireAuth, requireRole("student"), async (req, res) => {
    try {
      const isAlreadyEnrolled = await fileStorage.isEnrolled(req.session.user!.id, req.params.courseId);
      if (isAlreadyEnrolled) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const enrollment = await fileStorage.createEnrollment({
        id: randomUUID(),
        studentId: req.session.user!.id,
        courseId: req.params.courseId,
        enrolledAt: new Date()
      });
      res.json(enrollment);
    } catch (error) {
      res.status(400).json({ message: "Failed to enroll in course" });
    }
  });

  // Statistics routes
  app.get("/api/teacher/stats", requireAuth, requireRole("teacher"), async (req, res) => {
    try {
      const courses = await fileStorage.getCoursesByTeacher(req.session.user!.id);
      let totalStudents = 0;
      let totalUploads = 0;
      
      for (const course of courses) {
        const enrollments = await fileStorage.getEnrollmentsByCourse(course.id);
        const content = await fileStorage.getContentByCourse(course.id);
        totalStudents += enrollments.length;
        totalUploads += content.length;
      }

      res.json({
        totalStudents,
        totalCourses: courses.length,
        totalUploads,
        engagementRate: 89, // Mock value
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher stats" });
    }
  });

  app.get("/api/student/stats", requireAuth, requireRole("student"), async (req, res) => {
    try {
      const enrollments = await fileStorage.getEnrollmentsByStudent(req.session.user!.id);
      
      res.json({
        coursesEnrolled: enrollments.length,
        hoursStudied: 47, // Mock value
        completed: 8, // Mock value
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
