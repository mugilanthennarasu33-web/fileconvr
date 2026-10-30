import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

// In-memory model stores for development/testing when PostgreSQL server is not connected
export interface UserRecord {
  id: string;
  email: string;
  passwordHash?: string | null;
  name: string | null;
  avatarUrl?: string | null;
  status: string;
  role: string;
  tier: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface ProcessingJobRecord {
  id: string;
  userId: string | null;
  anonymousId: string | null;
  toolType: string;
  status: string;
  inputFilename: string | null;
  outputFilename: string | null;
  mimeType: string | null;
  inputSizeBytes: bigint | null;
  outputSizeBytes: bigint | null;
  pageCount: number | null;
  taskId: string | null;
  downloadUrl: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
  expiresAt: Date;
}

export interface UsageRecordItem {
  id: string;
  userId: string | null;
  anonymousId: string | null;
  operationType: string;
  quantity: number;
  bytesProcessed: bigint;
  jobId: string | null;
  timestamp: Date;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  tier: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * In-memory Mock Database Store for local execution without a PostgreSQL server.
 */
class MemoryDatabase {
  users: Map<string, UserRecord> = new Map();
  sessions: Map<string, SessionRecord> = new Map();
  jobs: Map<string, ProcessingJobRecord> = new Map();
  usage: Map<string, UsageRecordItem> = new Map();
  subscriptions: Map<string, SubscriptionRecord> = new Map();

  user = {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }): Promise<UserRecord | null> => {
      if (where.id) return this.users.get(where.id) || null;
      if (where.email) {
        const norm = where.email.toLowerCase().trim();
        for (const u of this.users.values()) {
          if (u.email.toLowerCase().trim() === norm) return u;
        }
      }
      return null;
    },
    findFirst: async ({ where }: { where: { email?: string } }): Promise<UserRecord | null> => {
      return this.user.findUnique({ where });
    },
    create: async ({ data }: { data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } }): Promise<UserRecord> => {
      const normEmail = data.email.toLowerCase().trim();
      const existing = await this.user.findUnique({ where: { email: normEmail } });
      if (existing) {
        const err: any = new Error('Unique constraint failed on the fields: (`email`)');
        err.code = 'P2002';
        throw err;
      }
      const now = new Date();
      const record: UserRecord = {
        id: data.id || crypto.randomUUID(),
        email: normEmail,
        passwordHash: data.passwordHash || null,
        name: data.name || null,
        avatarUrl: data.avatarUrl || null,
        status: data.status || 'active',
        role: data.role || 'user',
        tier: data.tier || 'free',
        createdAt: now,
        updatedAt: now,
      };
      this.users.set(record.id, record);
      return record;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<UserRecord> }): Promise<UserRecord> => {
      const existing = this.users.get(where.id);
      if (!existing) throw new Error('Record not found.');
      const updated: UserRecord = { ...existing, ...data, updatedAt: new Date() };
      this.users.set(where.id, updated);
      return updated;
    },
    delete: async ({ where }: { where: { id: string } }): Promise<UserRecord> => {
      const existing = this.users.get(where.id);
      if (!existing) throw new Error('Record not found.');
      this.users.delete(where.id);
      return existing;
    },
    count: async ({ where }: { where?: { id?: string; email?: string } } = {}): Promise<number> => {
      if (!where) return this.users.size;
      let c = 0;
      for (const u of this.users.values()) {
        if (where.id && u.id !== where.id) continue;
        if (where.email && u.email.toLowerCase() !== where.email.toLowerCase()) continue;
        c++;
      }
      return c;
    },
  };

  session = {
    findUnique: async ({ where }: { where: { id?: string; tokenHash?: string } }): Promise<(SessionRecord & { user?: UserRecord }) | null> => {
      let record: SessionRecord | null = null;
      if (where.id) record = this.sessions.get(where.id) || null;
      if (where.tokenHash) {
        for (const s of this.sessions.values()) {
          if (s.tokenHash === where.tokenHash) {
            record = s;
            break;
          }
        }
      }
      if (!record) return null;
      const user = this.users.get(record.userId);
      return user ? { ...record, user } : record;
    },
    create: async ({ data }: { data: { userId: string; tokenHash: string; expiresAt: Date; id?: string; ipAddress?: string | null; userAgent?: string | null; revokedAt?: Date | null } }): Promise<SessionRecord> => {
      const record: SessionRecord = {
        id: data.id || crypto.randomUUID(),
        userId: data.userId,
        tokenHash: data.tokenHash,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        createdAt: new Date(),
        expiresAt: data.expiresAt,
        revokedAt: data.revokedAt || null,
      };
      this.sessions.set(record.id, record);
      return record;
    },
    update: async ({ where, data }: { where: { id?: string; tokenHash?: string }; data: Partial<SessionRecord> }): Promise<SessionRecord> => {
      let record: SessionRecord | null = null;
      if (where.id) record = this.sessions.get(where.id) || null;
      if (where.tokenHash) {
        for (const s of this.sessions.values()) {
          if (s.tokenHash === where.tokenHash) {
            record = s;
            break;
          }
        }
      }
      if (!record) throw new Error('Session not found.');
      const updated = { ...record, ...data };
      this.sessions.set(record.id, updated);
      return updated;
    },
    deleteMany: async ({ where }: { where: { userId?: string; expiresAt?: { lt?: Date } } }) => {
      let count = 0;
      for (const [id, s] of Array.from(this.sessions.entries())) {
        if (where.userId && s.userId !== where.userId) continue;
        if (where.expiresAt?.lt && s.expiresAt >= where.expiresAt.lt) continue;
        this.sessions.delete(id);
        count++;
      }
      return { count };
    },
  };

  processingJob = {
    findUnique: async ({ where }: { where: { id: string } }): Promise<ProcessingJobRecord | null> => {
      return this.jobs.get(where.id) || null;
    },
    findFirst: async (args?: {
      where?: {
        id?: string;
        taskId?: string | null;
        userId?: string | null;
        anonymousId?: string | null;
        status?: string;
        toolType?: string;
      };
    }): Promise<ProcessingJobRecord | null> => {
      let list = Array.from(this.jobs.values());
      if (args?.where) {
        const { id, taskId, userId, anonymousId, status, toolType } = args.where;
        if (id !== undefined) list = list.filter((j) => j.id === id);
        if (taskId !== undefined) list = list.filter((j) => j.taskId === taskId);
        if (userId !== undefined) list = list.filter((j) => j.userId === userId);
        if (anonymousId !== undefined) list = list.filter((j) => j.anonymousId === anonymousId);
        if (status) list = list.filter((j) => j.status === status);
        if (toolType) list = list.filter((j) => j.toolType === toolType);
      }
      return list[0] || null;
    },
    findMany: async (args?: {
      where?: {
        userId?: string | null;
        anonymousId?: string;
        status?: string;
        toolType?: string;
      };
      orderBy?: { createdAt?: 'asc' | 'desc' };
      skip?: number;
      take?: number;
    }): Promise<ProcessingJobRecord[]> => {
      let list = Array.from(this.jobs.values());
      if (args?.where) {
        const { userId, anonymousId, status, toolType } = args.where;
        if (userId !== undefined) list = list.filter((j) => j.userId === userId);
        if (anonymousId !== undefined) list = list.filter((j) => j.anonymousId === anonymousId);
        if (status) list = list.filter((j) => j.status === status);
        if (toolType) list = list.filter((j) => j.toolType === toolType);
      }
      if (args?.orderBy?.createdAt) {
        const asc = args.orderBy.createdAt === 'asc';
        list.sort((a, b) => (asc ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()));
      } else {
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      const skip = args?.skip || 0;
      const take = args?.take || list.length;
      return list.slice(skip, skip + take);
    },
    count: async (args?: { where?: { userId?: string | null; anonymousId?: string | null; status?: string; toolType?: string } }): Promise<number> => {
      let list = Array.from(this.jobs.values());
      if (args?.where) {
        const { userId, anonymousId, status, toolType } = args.where;
        if (userId !== undefined) list = list.filter((j) => j.userId === userId);
        if (anonymousId !== undefined) list = list.filter((j) => j.anonymousId === anonymousId);
        if (status) list = list.filter((j) => j.status === status);
        if (toolType) list = list.filter((j) => j.toolType === toolType);
      }
      return list.length;
    },
    create: async ({ data }: { data: { toolType: string; expiresAt: Date; id?: string; userId?: string | null; anonymousId?: string | null; status?: string; inputFilename?: string | null; outputFilename?: string | null; mimeType?: string | null; inputSizeBytes?: bigint | number | null; outputSizeBytes?: bigint | number | null; pageCount?: number | null; taskId?: string | null; downloadUrl?: string | null; errorCode?: string | null; errorMessage?: string | null; completedAt?: Date | null } }): Promise<ProcessingJobRecord> => {
      const record: ProcessingJobRecord = {
        id: data.id || crypto.randomUUID(),
        userId: data.userId || null,
        anonymousId: data.anonymousId || null,
        toolType: data.toolType,
        status: data.status || 'PENDING',
        inputFilename: data.inputFilename || null,
        outputFilename: data.outputFilename || null,
        mimeType: data.mimeType || null,
        inputSizeBytes: data.inputSizeBytes !== undefined && data.inputSizeBytes !== null ? BigInt(data.inputSizeBytes) : null,
        outputSizeBytes: data.outputSizeBytes !== undefined && data.outputSizeBytes !== null ? BigInt(data.outputSizeBytes) : null,
        pageCount: data.pageCount !== undefined ? data.pageCount : null,
        taskId: data.taskId || null,
        downloadUrl: data.downloadUrl || null,
        errorCode: data.errorCode || null,
        errorMessage: data.errorMessage || null,
        createdAt: new Date(),
        completedAt: data.completedAt || null,
        expiresAt: data.expiresAt,
      };
      this.jobs.set(record.id, record);
      return record;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<ProcessingJobRecord> }): Promise<ProcessingJobRecord> => {
      const existing = this.jobs.get(where.id);
      if (!existing) throw new Error('Processing job not found.');
      const updated: ProcessingJobRecord = {
        ...existing,
        ...data,
        inputSizeBytes: data.inputSizeBytes === undefined ? existing.inputSizeBytes : (data.inputSizeBytes !== null ? BigInt(data.inputSizeBytes) : null),
        outputSizeBytes: data.outputSizeBytes === undefined ? existing.outputSizeBytes : (data.outputSizeBytes !== null ? BigInt(data.outputSizeBytes) : null),
      };
      this.jobs.set(where.id, updated);
      return updated;
    },
    delete: async ({ where }: { where: { id: string } }): Promise<ProcessingJobRecord> => {
      const existing = this.jobs.get(where.id);
      if (!existing) throw new Error('Processing job not found.');
      this.jobs.delete(where.id);
      return existing;
    },
    deleteMany: async ({ where }: { where: { expiresAt?: { lt?: Date } } }) => {
      let count = 0;
      for (const [id, j] of Array.from(this.jobs.entries())) {
        if (where.expiresAt?.lt && j.expiresAt < where.expiresAt.lt) {
          this.jobs.delete(id);
          count++;
        }
      }
      return { count };
    },
  };

  usageRecord = {
    create: async ({ data }: { data: Omit<UsageRecordItem, 'id' | 'timestamp'> & { id?: string } }): Promise<UsageRecordItem> => {
      const record: UsageRecordItem = {
        id: data.id || crypto.randomUUID(),
        userId: data.userId || null,
        anonymousId: data.anonymousId || null,
        operationType: data.operationType,
        quantity: data.quantity || 1,
        bytesProcessed: BigInt(data.bytesProcessed || 0),
        jobId: data.jobId || null,
        timestamp: new Date(),
      };
      this.usage.set(record.id, record);
      return record;
    },
    count: async (args?: { where?: { userId?: string | null; anonymousId?: string; timestamp?: { gte?: Date } } }): Promise<number> => {
      let list = Array.from(this.usage.values());
      if (args?.where) {
        const { userId, anonymousId, timestamp } = args.where;
        if (userId !== undefined) list = list.filter((u) => u.userId === userId);
        if (anonymousId !== undefined) list = list.filter((u) => u.anonymousId === anonymousId);
        if (timestamp?.gte) list = list.filter((u) => u.timestamp >= timestamp.gte!);
      }
      return list.length;
    },
    aggregate: async (args?: {
      where?: { userId?: string | null; anonymousId?: string; timestamp?: { gte?: Date } };
      _sum?: { bytesProcessed?: boolean; quantity?: boolean };
    }) => {
      let list = Array.from(this.usage.values());
      if (args?.where) {
        const { userId, anonymousId, timestamp } = args.where;
        if (userId !== undefined) list = list.filter((u) => u.userId === userId);
        if (anonymousId !== undefined) list = list.filter((u) => u.anonymousId === anonymousId);
        if (timestamp?.gte) list = list.filter((u) => u.timestamp >= timestamp.gte!);
      }
      let totalBytes = 0n;
      let totalQty = 0;
      for (const item of list) {
        totalBytes += item.bytesProcessed;
        totalQty += item.quantity;
      }
      return {
        _sum: {
          bytesProcessed: totalBytes,
          quantity: totalQty,
        },
      };
    },
  };

  subscription = {
    findFirst: async ({ where }: { where: { userId: string } }): Promise<SubscriptionRecord | null> => {
      for (const sub of this.subscriptions.values()) {
        if (sub.userId === where.userId) return sub;
      }
      return null;
    },
    create: async ({ data }: { data: Omit<SubscriptionRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } }): Promise<SubscriptionRecord> => {
      const now = new Date();
      const record: SubscriptionRecord = {
        id: data.id || crypto.randomUUID(),
        userId: data.userId,
        tier: data.tier || 'free',
        status: data.status || 'active',
        currentPeriodStart: data.currentPeriodStart || now,
        currentPeriodEnd: data.currentPeriodEnd,
        createdAt: now,
        updatedAt: now,
      };
      this.subscriptions.set(record.id, record);
      return record;
    },
  };

  // Helper to clear state in tests
  clearAll = () => {
    this.users.clear();
    this.sessions.clear();
    this.jobs.clear();
    this.usage.clear();
    this.subscriptions.clear();
  };
}

export const memoryDb = new MemoryDatabase();

const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql');

if (isProduction && !hasDatabaseUrl) {
  console.error('[CRITICAL DATABASE CONFIGURATION ERROR]');
  console.error('PostgreSQL DATABASE_URL is not configured in production mode.');
  console.error('fileconvr will NOT silently run in-memory fallback in production.');
  console.error('Please configure a valid PostgreSQL connection in .env before deploying to production.');
} else if (process.env.NODE_ENV !== 'test') {
  console.log(`[Database] Active mode: ${hasDatabaseUrl ? 'PostgreSQL (Prisma)' : 'Development In-Memory Engine (Transient)'}`);
}

export function getDatabaseStatus() {
  return {
    mode: isProduction && hasDatabaseUrl ? 'postgresql' : 'in-memory-dev',
    isProduction,
    isPostgresConfigured: hasDatabaseUrl,
    fallbackPermitted: !isProduction,
    error: isProduction && !hasDatabaseUrl ? 'Production PostgreSQL database is required but not configured.' : null,
  };
}

// Guard to ensure production fails safely without silently falling back to in-memory storage
function createSafeDbProxy(target: MemoryDatabase): MemoryDatabase {
  return new Proxy(target, {
    get(obj, prop) {
      const currentIsProd = process.env.NODE_ENV === 'production';
      const currentHasDb = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql');
      if (currentIsProd && !currentHasDb) {
        throw new Error(
          'Database Unavailable: PostgreSQL is required in production mode. In-memory fallback is strictly disabled in production.'
        );
      }
      return (obj as any)[prop];
    },
  });
}

export const db: MemoryDatabase = createSafeDbProxy(memoryDb);

let _prismaInstance: PrismaClient | null = null;
export function getPrismaClient(): PrismaClient | null {
  if (!_prismaInstance) {
    try {
      _prismaInstance = new PrismaClient();
    } catch {
      _prismaInstance = null;
    }
  }
  return _prismaInstance;
}
export const prisma = (typeof Proxy !== 'undefined')
  ? new Proxy({} as PrismaClient, {
      get(_target, prop) {
        const client = getPrismaClient();
        if (!client) {
          return (db as any)[prop];
        }
        return (client as any)[prop];
      },
    })
  : (db as any);


