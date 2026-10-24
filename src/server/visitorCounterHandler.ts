import fs from 'fs';
import path from 'path';

export interface VisitorCounterData {
  count: number;
  baseCount: number;
  activeBase: number;
  activeLivePlus: number;
  activeUsers: number;
  updatedAt: string;
}

// Minimum starting milestone requested by user: 10 Lakh (10,00,000)
const BASE_TEN_LAKH = 1000000;

// Always show 100 base active users + live active user sessions (e.g. 100 + 1 = 101)
const BASE_ACTIVE_USERS = 100;
const ACTIVE_SESSION_TTL_MS = 45000; // 45 seconds heartbeat window

// Map of sessionId -> lastSeenTimestamp
const activeSessions = new Map<string, number>();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PRIMARY_COUNTER_FILE = path.join(DATA_DIR, 'visitor_counter.json');
const TMP_COUNTER_FILE = '/tmp/panditji_visitor_counter.json';

function pruneExpiredSessions(now: number): void {
  for (const [sid, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > ACTIVE_SESSION_TTL_MS) {
      activeSessions.delete(sid);
    }
  }
}

export function touchActiveSession(sessionId?: string): {
  activeBase: number;
  activeLivePlus: number;
  activeUsers: number;
} {
  const now = Date.now();
  pruneExpiredSessions(now);

  if (sessionId && typeof sessionId === 'string' && sessionId.trim().length > 0) {
    activeSessions.set(sessionId.trim().slice(0, 64), now);
  }

  // At least 1 user is active whenever someone is viewing/querying the app
  const activeLivePlus = Math.max(1, activeSessions.size);
  return {
    activeBase: BASE_ACTIVE_USERS,
    activeLivePlus,
    activeUsers: BASE_ACTIVE_USERS + activeLivePlus,
  };
}

export function removeActiveSession(sessionId?: string): void {
  if (sessionId && typeof sessionId === 'string') {
    activeSessions.delete(sessionId.trim().slice(0, 64));
  }
  pruneExpiredSessions(Date.now());
}

function readCountFromFile(filePath: string): number {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (typeof parsed?.count === 'number' && Number.isFinite(parsed.count)) {
        return Math.floor(parsed.count);
      }
    }
  } catch {
    // Ignore read errors and fall back
  }
  return 0;
}

function writeCountToFiles(countVal: number): void {
  const payload = JSON.stringify(
    {
      count: countVal,
      baseCount: BASE_TEN_LAKH,
      updatedAt: new Date().toISOString(),
    },
    null,
    2
  );
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_COUNTER_FILE, payload, 'utf-8');
  } catch (err) {
    console.error('Failed to write primary visitor counter file:', err);
  }

  try {
    fs.writeFileSync(TMP_COUNTER_FILE, payload, 'utf-8');
  } catch {
    // Ignore /tmp write error
  }
}

let inMemoryCount: number = Math.max(
  BASE_TEN_LAKH,
  readCountFromFile(PRIMARY_COUNTER_FILE),
  readCountFromFile(TMP_COUNTER_FILE)
);

// Ensure initial file is persisted right away so it never starts below 10,00,000
if (
  readCountFromFile(PRIMARY_COUNTER_FILE) < BASE_TEN_LAKH &&
  readCountFromFile(TMP_COUNTER_FILE) < BASE_TEN_LAKH
) {
  inMemoryCount = BASE_TEN_LAKH;
  writeCountToFiles(inMemoryCount);
}

export function getVisitorCount(clientKnownMax?: number, sessionId?: string): VisitorCounterData {
  const diskPrimary = readCountFromFile(PRIMARY_COUNTER_FILE);
  const diskTmp = readCountFromFile(TMP_COUNTER_FILE);
  const safeClientMax =
    typeof clientKnownMax === 'number' &&
    Number.isFinite(clientKnownMax) &&
    clientKnownMax >= BASE_TEN_LAKH &&
    clientKnownMax < BASE_TEN_LAKH + 50000000
      ? Math.floor(clientKnownMax)
      : BASE_TEN_LAKH;

  const highest = Math.max(BASE_TEN_LAKH, inMemoryCount, diskPrimary, diskTmp, safeClientMax);
  if (highest > inMemoryCount || highest > diskPrimary) {
    inMemoryCount = highest;
    writeCountToFiles(inMemoryCount);
  }

  const activeStats = touchActiveSession(sessionId);

  return {
    count: inMemoryCount,
    baseCount: BASE_TEN_LAKH,
    ...activeStats,
    updatedAt: new Date().toISOString(),
  };
}

export function incrementVisitorCount(
  clientKnownMax?: number,
  sessionId?: string
): VisitorCounterData {
  const current = getVisitorCount(clientKnownMax, sessionId).count;
  inMemoryCount = Math.max(BASE_TEN_LAKH, current) + 1;

  writeCountToFiles(inMemoryCount);
  const activeStats = touchActiveSession(sessionId);

  return {
    count: inMemoryCount,
    baseCount: BASE_TEN_LAKH,
    ...activeStats,
    updatedAt: new Date().toISOString(),
  };
}
