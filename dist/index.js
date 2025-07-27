var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/database.ts
var database_exports = {};
__export(database_exports, {
  FileStorage: () => FileStorage,
  fileStorage: () => fileStorage
});
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
var FileStorage, fileStorage;
var init_database = __esm({
  "server/database.ts"() {
    "use strict";
    FileStorage = class {
      dataDir = path.join(process.cwd(), "data");
      usersFile = path.join(this.dataDir, "users.json");
      coursesFile = path.join(this.dataDir, "courses.json");
      contentFile = path.join(this.dataDir, "content.json");
      enrollmentsFile = path.join(this.dataDir, "enrollments.json");
      constructor() {
      }
      async connect() {
        try {
          await fs.mkdir(this.dataDir, { recursive: true });
          await this.initializeFile(this.usersFile, []);
          await this.initializeFile(this.coursesFile, []);
          await this.initializeFile(this.contentFile, []);
          await this.initializeFile(this.enrollmentsFile, []);
          console.log("Connected to file storage successfully");
          await this.initializeSampleData();
        } catch (error) {
          console.error("File storage initialization error:", error);
          throw error;
        }
      }
      async disconnect() {
      }
      async initializeFile(filePath, defaultData) {
        try {
          await fs.access(filePath);
        } catch {
          await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
        }
      }
      async readFile(filePath) {
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
      }
      async writeFile(filePath, data) {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      }
      // User methods
      async getUserByUsername(username) {
        const users = await this.readFile(this.usersFile);
        return users.find((user) => user.username === username) || null;
      }
      async getUserById(id) {
        const users = await this.readFile(this.usersFile);
        return users.find((user) => user.id === id) || null;
      }
      async createUser(userData) {
        const users = await this.readFile(this.usersFile);
        const newUser = userData;
        users.push(newUser);
        await this.writeFile(this.usersFile, users);
        return newUser;
      }
      async updateUserPassword(userId, newPassword) {
        const users = await this.readFile(this.usersFile);
        const userIndex = users.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          users[userIndex].password = newPassword;
          await this.writeFile(this.usersFile, users);
        }
      }
      // Course methods
      async getCourses() {
        return await this.readFile(this.coursesFile);
      }
      async getCourse(id) {
        const courses = await this.readFile(this.coursesFile);
        return courses.find((course) => course.id === id) || null;
      }
      async getCoursesByTeacher(teacherId) {
        const courses = await this.readFile(this.coursesFile);
        return courses.filter((course) => course.teacherId === teacherId);
      }
      async createCourse(courseData) {
        const courses = await this.readFile(this.coursesFile);
        const newCourse = courseData;
        courses.push(newCourse);
        await this.writeFile(this.coursesFile, courses);
        return newCourse;
      }
      // Content methods
      async getContentByCourse(courseId) {
        const content = await this.readFile(this.contentFile);
        return content.filter((item) => item.courseId === courseId);
      }
      async getContent(id) {
        const content = await this.readFile(this.contentFile);
        return content.find((item) => item.id === id) || null;
      }
      async createContent(contentData) {
        const content = await this.readFile(this.contentFile);
        const newContent = contentData;
        content.push(newContent);
        await this.writeFile(this.contentFile, content);
        return newContent;
      }
      async updateContentViews(id) {
        const content = await this.readFile(this.contentFile);
        const contentIndex = content.findIndex((item) => item.id === id);
        if (contentIndex !== -1) {
          const views = parseInt(content[contentIndex].views) + 1;
          content[contentIndex].views = views.toString();
          await this.writeFile(this.contentFile, content);
        }
      }
      async deleteContent(id) {
        const content = await this.readFile(this.contentFile);
        const initialLength = content.length;
        const filteredContent = content.filter((item) => item.id !== id);
        if (filteredContent.length !== initialLength) {
          await this.writeFile(this.contentFile, filteredContent);
          return true;
        }
        return false;
      }
      // Enrollment methods
      async getEnrollmentsByStudent(studentId) {
        const enrollments = await this.readFile(this.enrollmentsFile);
        return enrollments.filter((enrollment) => enrollment.studentId === studentId);
      }
      async getEnrollmentsByCourse(courseId) {
        const enrollments = await this.readFile(this.enrollmentsFile);
        return enrollments.filter((enrollment) => enrollment.courseId === courseId);
      }
      async createEnrollment(enrollmentData) {
        const enrollments = await this.readFile(this.enrollmentsFile);
        const newEnrollment = enrollmentData;
        enrollments.push(newEnrollment);
        await this.writeFile(this.enrollmentsFile, enrollments);
        return newEnrollment;
      }
      async isEnrolled(studentId, courseId) {
        const enrollments = await this.readFile(this.enrollmentsFile);
        return enrollments.some(
          (enrollment) => enrollment.studentId === studentId && enrollment.courseId === courseId
        );
      }
      async initializeSampleData() {
        try {
          const users = await this.readFile(this.usersFile);
          if (users.length > 0) {
            console.log("Sample data already exists, skipping initialization");
            return;
          }
          console.log("Initializing sample data...");
          const bcrypt2 = await import("bcryptjs");
          const hashedPassword = await bcrypt2.hash("password123", 10);
          const teacherId = randomUUID();
          const studentId = randomUUID();
          const teacher = {
            id: teacherId,
            username: "teacher@example.com",
            password: hashedPassword,
            name: "Prof. Johnson",
            role: "teacher",
            createdAt: /* @__PURE__ */ new Date()
          };
          const student = {
            id: studentId,
            username: "student@example.com",
            password: hashedPassword,
            name: "John Doe",
            role: "student",
            createdAt: /* @__PURE__ */ new Date()
          };
          await this.writeFile(this.usersFile, [teacher, student]);
          const mathCourseId = randomUUID();
          const physicsCourseId = randomUUID();
          const mathCourse = {
            id: mathCourseId,
            title: "Mathematics 101",
            description: "Basic algebra and geometry concepts",
            teacherId,
            teacherName: "Prof. Johnson",
            icon: "fas fa-calculator",
            color: "academic-blue",
            createdAt: /* @__PURE__ */ new Date()
          };
          const physicsCourse = {
            id: physicsCourseId,
            title: "Physics 201",
            description: "Mechanics and thermodynamics",
            teacherId,
            teacherName: "Prof. Johnson",
            icon: "fas fa-atom",
            color: "success-green",
            createdAt: /* @__PURE__ */ new Date()
          };
          await this.writeFile(this.coursesFile, [mathCourse, physicsCourse]);
          const content1Id = randomUUID();
          const content1 = {
            id: content1Id,
            courseId: mathCourseId,
            title: "Introduction to Algebra",
            description: "Basic concepts and fundamentals",
            type: "video",
            fileName: "intro-algebra.mp4",
            fileSize: "15.3 MB",
            filePath: "/uploads/intro-algebra.mp4",
            views: "143",
            createdAt: /* @__PURE__ */ new Date()
          };
          await this.writeFile(this.contentFile, [content1]);
          console.log("Sample data initialized successfully");
        } catch (error) {
          console.error("Error initializing sample data:", error);
        }
      }
    };
    fileStorage = new FileStorage();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_database();
import { createServer } from "http";
import session from "express-session";
import multer from "multer";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID as randomUUID2 } from "crypto";
var upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024
    // 100MB limit
  }
});
async function registerRoutes(app2) {
  const sessionSecret = process.env.SESSION_SECRET || "study-sphere-secret-key";
  app2.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "studysphere.sid",
    // Custom session name
    cookie: {
      secure: process.env.NODE_ENV === "production",
      // HTTPS in production
      httpOnly: true,
      // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      sameSite: "strict"
      // CSRF protection
    }
  }));
  const requireAuth = (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({
        message: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }
    if (req.session.cookie.maxAge && req.session.cookie.maxAge < 0) {
      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
      });
      return res.status(401).json({
        message: "Session expired",
        code: "SESSION_EXPIRED"
      });
    }
    next();
  };
  const requireRole = (role) => (req, res, next) => {
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
  const checkRateLimit = (req, res, next) => {
    const now = Date.now();
    const maxAttempts = 5;
    const lockoutTime = 15 * 60 * 1e3;
    if (!req.session.loginAttempts) {
      req.session.loginAttempts = 0;
    }
    if (req.session.loginAttempts >= maxAttempts) {
      const timeSinceLastFailed = now - (req.session.lastFailedLogin || 0);
      if (timeSinceLastFailed < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime - timeSinceLastFailed) / 1e3 / 60);
        return res.status(429).json({
          message: `Too many failed attempts. Try again in ${remainingTime} minutes`,
          code: "RATE_LIMITED",
          retryAfter: remainingTime
        });
      } else {
        req.session.loginAttempts = 0;
        req.session.lastFailedLogin = void 0;
      }
    }
    next();
  };
  const validateInput = (schema) => (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid input data",
          code: "VALIDATION_ERROR",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
  const registrationSchema = z.object({
    username: z.string().email("Must be a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["student", "teacher"])
  });
  const loginSchema = z.object({
    username: z.string().email("Must be a valid email address"),
    password: z.string().min(1, "Password is required")
  });
  app2.post("/api/auth/register", validateInput(registrationSchema), async (req, res) => {
    try {
      const userData = req.body;
      const existingUser = await fileStorage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({
          message: "User already exists",
          code: "USER_EXISTS"
        });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const newUser = {
        id: randomUUID2(),
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        createdAt: /* @__PURE__ */ new Date()
      };
      const user = await fileStorage.createUser(newUser);
      req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };
      req.session.loginAttempts = 0;
      req.session.lastFailedLogin = void 0;
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
      console.error("Registration error:", error);
      res.status(500).json({
        message: "Registration failed",
        code: "REGISTRATION_ERROR"
      });
    }
  });
  app2.post("/api/auth/login", checkRateLimit, validateInput(loginSchema), async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await fileStorage.getUserByUsername(username);
      if (!user || !await bcrypt.compare(password, user.password)) {
        req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
        req.session.lastFailedLogin = Date.now();
        return res.status(401).json({
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS"
        });
      }
      req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };
      req.session.loginAttempts = 0;
      req.session.lastFailedLogin = void 0;
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
      console.error("Login error:", error);
      res.status(500).json({
        message: "Login failed",
        code: "LOGIN_ERROR"
      });
    }
  });
  app2.post("/api/auth/logout", requireAuth, (req, res) => {
    const userId = req.session?.user?.id;
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          message: "Logout failed",
          code: "LOGOUT_ERROR"
        });
      }
      res.clearCookie("studysphere.sid");
      res.json({
        message: "Logged out successfully",
        code: "LOGOUT_SUCCESS"
      });
    });
  });
  app2.get("/api/auth/me", (req, res) => {
    if (req.session?.user) {
      if (Math.random() < 0.1) {
        req.session.regenerate((err) => {
          if (err) console.error("Session regeneration error:", err);
        });
      }
      res.json({
        user: req.session.user,
        sessionInfo: {
          createdAt: req.session.cookie.originalMaxAge ? new Date(Date.now() - (24 * 60 * 60 * 1e3 - (req.session.cookie.maxAge || 0))).toISOString() : null,
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
  app2.post("/api/auth/change-password", requireAuth, validateInput(z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters")
  })), async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.user.id;
      const user = await fileStorage.getUserByUsername(req.session.user.username);
      if (!user || !await bcrypt.compare(currentPassword, user.password)) {
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
      console.error("Password change error:", error);
      res.status(500).json({
        message: "Password change failed",
        code: "PASSWORD_CHANGE_ERROR"
      });
    }
  });
  app2.post("/api/auth/refresh", requireAuth, (req, res) => {
    req.session.touch();
    res.json({
      message: "Session refreshed",
      code: "SESSION_REFRESHED",
      user: req.session.user
    });
  });
  app2.get("/api/courses", requireAuth, async (req, res) => {
    try {
      const courses = await fileStorage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });
  app2.get("/api/courses/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/teacher/courses", requireAuth, requireRole("teacher"), async (req, res) => {
    try {
      const courses = await fileStorage.getCoursesByTeacher(req.session.user.id);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher courses" });
    }
  });
  app2.post("/api/courses", requireAuth, requireRole("teacher"), async (req, res) => {
    try {
      const courseData = {
        ...req.body,
        id: randomUUID2(),
        teacherId: req.session.user.id,
        teacherName: req.session.user.name,
        createdAt: /* @__PURE__ */ new Date()
      };
      const course = await fileStorage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      res.status(400).json({ message: "Invalid course data" });
    }
  });
  app2.get("/api/courses/:courseId/content", requireAuth, async (req, res) => {
    try {
      const content = await fileStorage.getContentByCourse(req.params.courseId);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });
  app2.post("/api/courses/:courseId/content", requireAuth, requireRole("teacher"), upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const contentData = {
        id: randomUUID2(),
        courseId: req.params.courseId,
        title: req.body.title,
        description: req.body.description || null,
        type: req.body.type,
        fileName: req.file.originalname,
        fileSize: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
        filePath: req.file.path,
        views: "0",
        createdAt: /* @__PURE__ */ new Date()
      };
      const content = await fileStorage.createContent(contentData);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: "Invalid content data" });
    }
  });
  app2.put("/api/content/:id/view", requireAuth, async (req, res) => {
    try {
      await fileStorage.updateContentViews(req.params.id);
      res.json({ message: "View count updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update view count" });
    }
  });
  app2.delete("/api/content/:id", requireAuth, requireRole("teacher"), async (req, res) => {
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
  app2.get("/api/student/enrollments", requireAuth, requireRole("student"), async (req, res) => {
    try {
      const enrollments = await fileStorage.getEnrollmentsByStudent(req.session.user.id);
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
  app2.post("/api/courses/:courseId/enroll", requireAuth, requireRole("student"), async (req, res) => {
    try {
      const isAlreadyEnrolled = await fileStorage.isEnrolled(req.session.user.id, req.params.courseId);
      if (isAlreadyEnrolled) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      const enrollment = await fileStorage.createEnrollment({
        id: randomUUID2(),
        studentId: req.session.user.id,
        courseId: req.params.courseId,
        enrolledAt: /* @__PURE__ */ new Date()
      });
      res.json(enrollment);
    } catch (error) {
      res.status(400).json({ message: "Failed to enroll in course" });
    }
  });
  app2.get("/api/teacher/stats", requireAuth, requireRole("teacher"), async (req, res) => {
    try {
      const courses = await fileStorage.getCoursesByTeacher(req.session.user.id);
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
        engagementRate: 89
        // Mock value
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher stats" });
    }
  });
  app2.get("/api/student/stats", requireAuth, requireRole("student"), async (req, res) => {
    try {
      const enrollments = await fileStorage.getEnrollmentsByStudent(req.session.user.id);
      res.json({
        coursesEnrolled: enrollments.length,
        hoursStudied: 47,
        // Mock value
        completed: 8
        // Mock value
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.removeHeader("X-Powered-By");
  next();
});
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const { fileStorage: fileStorage2 } = await Promise.resolve().then(() => (init_database(), database_exports));
  await fileStorage2.connect();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
