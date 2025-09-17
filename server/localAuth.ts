import bcrypt from "bcrypt";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { loginSchema, registerSchema, type LoginRequest, type RegisterRequest, type PublicUser } from "@shared/schema";

// Extend session type to include userId
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

const SALT_ROUNDS = 12;

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createUser(userData: RegisterRequest): Promise<PublicUser> {
  const existingUser = await storage.getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await hashPassword(userData.password);
  const user = await storage.createUserWithPassword({
    email: userData.email,
    passwordHash,
    firstName: userData.firstName,
    lastName: userData.lastName,
  });

  // Return public user without password hash
  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}

export async function authenticateUser(credentials: LoginRequest): Promise<PublicUser | null> {
  const user = await storage.getUserByEmail(credentials.email);
  if (!user || !user.passwordHash) {
    return null;
  }

  const isPasswordValid = await verifyPassword(credentials.password, user.passwordHash);
  if (!isPasswordValid) {
    return null;
  }

  // Return public user without password hash
  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const user = await createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      
      res.status(201).json({ user });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await authenticateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      res.json({ user });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });
}