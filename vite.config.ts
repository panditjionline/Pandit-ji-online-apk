import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleChatMessage } from './src/server/chatHandler';
import { getStoredBookings, saveNewBooking, deleteStoredBookings } from './src/server/bookingsHandler';
import { getUserByPhone, getUserByEmail, saveOrUpdateUserByPhone, normalizePhone } from './src/server/userStoreHandler';
import { getPermanentPhoto, savePermanentPhoto } from './src/server/photoStoreHandler';
import crypto from 'crypto';
import {
  getVisitorCount,
  incrementVisitorCount,
  removeActiveSession,
} from './src/server/visitorCounterHandler';
import {
  generateDynamicSitemapXml,
  generateDynamicRobotsTxt,
  resolveBaseOrigin,
  syncStaticSeoFilesToPublic,
  buildDynamicSitemapEntries,
  GOOGLE_SITE_VERIFICATION_TOKEN,
} from './src/server/seoHandler';

function normalizeDobForMatch(raw: string): string {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  const dmyMatch = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}${dmyMatch[2]}${dmyMatch[1]}`;
  }
  return trimmed.replace(/\D/g, '');
}

function apiChatPlugin(): Plugin {
  return {
    name: 'api-chat-plugin',
    buildStart() {
      syncStaticSeoFilesToPublic(path.resolve(__dirname, 'public'));
    },
    configureServer(server) {
      syncStaticSeoFilesToPublic(path.resolve(__dirname, 'public'));

      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const url = rawUrl.split('?')[0];

        // Dynamic Sitemap endpoint (/sitemap.xml)
        if (url === '/sitemap.xml' && req.method === 'GET') {
          const baseOrigin = resolveBaseOrigin(req.headers as Record<string, string | string[] | undefined>);
          const xml = generateDynamicSitemapXml(baseOrigin, new Date());
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800');
          res.end(xml);
          return;
        }

        // Dynamic Robots.txt endpoint (/robots.txt)
        if (url === '/robots.txt' && req.method === 'GET') {
          const baseOrigin = resolveBaseOrigin(req.headers as Record<string, string | string[] | undefined>);
          const txt = generateDynamicRobotsTxt(baseOrigin);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
          res.end(txt);
          return;
        }

        // SEO Status endpoint (/api/seo-status)
        if (url === '/api/seo-status' && req.method === 'GET') {
          const baseOrigin = resolveBaseOrigin(req.headers as Record<string, string | string[] | undefined>);
          const entries = buildDynamicSitemapEntries(baseOrigin, new Date());
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'active',
              googleSiteVerification: GOOGLE_SITE_VERIFICATION_TOKEN,
              robotsDirective: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
              sitemapUrl: `${baseOrigin}/sitemap.xml`,
              robotsUrl: `${baseOrigin}/robots.txt`,
              totalIndexedRoutes: entries.length,
              generatedAt: new Date().toISOString(),
            })
          );
          return;
        }

        // Chat API endpoint
        if (url === '/api/chat') {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
          }

          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const body = Buffer.concat(chunks).toString('utf-8');
            const data = JSON.parse(body || '{}');
            const message = data.message || '';
            const history = data.history || [];

            const result = await handleChatMessage(message, history, data.language, data.userProfile);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: unknown) {
            console.error('API Error in /api/chat:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error processing chat' }));
          }
          return;
        }

        // Bookings store endpoint for Pandit Shashank Sharma
        if (url === '/api/bookings') {
          if (req.method === 'GET') {
            const bookings = getStoredBookings();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(bookings));
            return;
          }

          if (req.method === 'POST') {
            try {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              }
              const body = Buffer.concat(chunks).toString('utf-8');
              const newBooking = JSON.parse(body || '{}');
              const updated = saveNewBooking(newBooking);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: updated.length, booking: newBooking }));
            } catch (err: unknown) {
              console.error('API Error in /api/bookings:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to record booking' }));
            }
            return;
          }

          if (req.method === 'DELETE') {
            try {
              const queryPart = rawUrl.split('?')[1] || '';
              const params = new URLSearchParams(queryPart);
              const id = params.get('id') || undefined;
              const phone = params.get('phone') || undefined;
              const updated = deleteStoredBookings({ id, phone });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, bookings: updated }));
            } catch (err: unknown) {
              console.error('API Error in DELETE /api/bookings:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to delete booking' }));
            }
            return;
          }
        }

        // User Mobile Account & Full History Endpoint (/api/user-data)
        if (url === '/api/user-data') {
          if (req.method === 'GET') {
            try {
              const queryPart = rawUrl.split('?')[1] || '';
              const params = new URLSearchParams(queryPart);
              const phone = params.get('phone') || '';
              const email = params.get('email') || '';
              const password = params.get('password') || '';
              const checkOnly = params.get('checkOnly') === 'true';

              const normalizedPhone = normalizePhone(phone);
              let user = getUserByPhone(normalizedPhone);
              if (!user && email) {
                user = getUserByEmail(email);
              }

              if (checkOnly) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ found: !!user, hasPassword: !!(user?.password), name: user?.name || '' }));
                return;
              }

              if (!user) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ found: false, user: null }));
                return;
              }

              const storedPassword = (user.password || '').trim();
              const inputPassword = (password || '').trim();
              const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');

              if (storedPassword && storedPassword !== inputPassword && storedPassword !== inputHash) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    found: true,
                    error: 'WRONG_PASSWORD',
                    message: 'गलत पासवर्ड! इस मोबाइल नंबर का डेटा सुरक्षित है। कृपया सही पासवर्ड दर्ज करें।',
                  })
                );
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ found: true, user }));
            } catch (err: unknown) {
              console.error('API Error in GET /api/user-data:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to load user account' }));
            }
            return;
          }

          if (req.method === 'POST') {
            try {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              }
              const body = Buffer.concat(chunks).toString('utf-8');
              const payload = JSON.parse(body || '{}');
              if (!payload.phone) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Mobile number is required' }));
                return;
              }
              const savedUser = saveOrUpdateUserByPhone(payload);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, user: savedUser }));
            } catch (err: unknown) {
              console.error('API Error in POST /api/user-data:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to save user account' }));
            }
            return;
          }
        }

        // Forgot Password Verification (/api/forgot-password/verify)
        if (url === '/api/forgot-password/verify' && req.method === 'POST') {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const body = Buffer.concat(chunks).toString('utf-8');
            const { phone, dob } = JSON.parse(body || '{}');

            if (!phone || !dob) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'MISSING_FIELDS', message: 'कृपया मोबाइल नंबर और जन्म तिथि दोनों दर्ज करें।' }));
              return;
            }

            const normalizedPhone = normalizePhone(phone);
            const user = getUserByPhone(normalizedPhone);
            if (!user) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'USER_NOT_FOUND', message: 'यह मोबाइल नंबर पंजीकृत नहीं है। कृपया पहले नया खाता (Sign-Up) बनाएँ।' }));
              return;
            }

            const storedDobRaw = String(user.dob || '').trim();
            const inputDobRaw = String(dob || '').trim();

            if (storedDobRaw) {
              const cleanStored = normalizeDobForMatch(storedDobRaw);
              const cleanInput = normalizeDobForMatch(inputDobRaw);
              const rawDigitsStored = storedDobRaw.replace(/\D/g, '');
              const rawDigitsInput = inputDobRaw.replace(/\D/g, '');

              if (cleanStored !== cleanInput && rawDigitsStored !== rawDigitsInput) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'INVALID_VERIFICATION', message: 'जन्म तिथि मेल नहीं खाती! कृपया अपनी पंजीकृत जन्म तिथि दर्ज करें।' }));
                return;
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                verified: true,
                name: user.name,
                phone: user.phone,
                message: 'मोबाइल नंबर एवं जन्म तिथि का सत्यापन सफल रहा!',
              })
            );
          } catch (err) {
            console.error('API Error in /api/forgot-password/verify:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'SERVER_ERROR', message: 'सत्यापन विफल। कृपया पुनः प्रयास करें।' }));
          }
          return;
        }

        // Forgot Password Reset (/api/forgot-password/reset)
        if (url === '/api/forgot-password/reset' && req.method === 'POST') {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const body = Buffer.concat(chunks).toString('utf-8');
            const { phone, dob, newPassword } = JSON.parse(body || '{}');

            if (!phone || !newPassword) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'MISSING_FIELDS', message: 'कृपया मोबाइल नंबर और नया पासवर्ड दर्ज करें।' }));
              return;
            }

            const normalizedPhone = normalizePhone(phone);
            const user = getUserByPhone(normalizedPhone);
            if (!user) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'USER_NOT_FOUND', message: 'यह मोबाइल नंबर पंजीकृत नहीं है।' }));
              return;
            }

            const storedDobRaw = String(user.dob || '').trim();
            const inputDobRaw = String(dob || '').trim();

            if (storedDobRaw && inputDobRaw) {
              const cleanStored = normalizeDobForMatch(storedDobRaw);
              const cleanInput = normalizeDobForMatch(inputDobRaw);
              const rawDigitsStored = storedDobRaw.replace(/\D/g, '');
              const rawDigitsInput = inputDobRaw.replace(/\D/g, '');

              if (cleanStored !== cleanInput && rawDigitsStored !== rawDigitsInput) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'अनधिकृत अनुरोध। जन्म तिथि मेल नहीं खाती।' }));
                return;
              }
            }

            if (String(newPassword).trim().length < 3) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'SHORT_PASSWORD', message: 'पासवर्ड कम से कम 3 अक्षरों का होना चाहिए।' }));
              return;
            }

            const updatedUser = saveOrUpdateUserByPhone({
              phone: normalizedPhone,
              password: String(newPassword).trim(),
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                user: updatedUser,
                message: 'पासवर्ड सफलतापूर्वक अपडेट कर दिया गया है!',
              })
            );
          } catch (err) {
            console.error('API Error in /api/forgot-password/reset:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Password reset failed', message: 'पासवर्ड रीसेट करने में समस्या आई।' }));
          }
          return;
        }

        // Profile photo API endpoint (keeps original photo synced across all sessions and shared links)
        if (url === '/api/pandit-photo') {
          if (req.method === 'GET') {
            const stored = getPermanentPhoto();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(stored));
            return;
          }

          if (req.method === 'POST') {
            try {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              }
              const body = Buffer.concat(chunks).toString('utf-8');
              const { photo } = JSON.parse(body || '{}');
              const saved = savePermanentPhoto(photo);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, ...saved }));
            } catch (err) {
              console.error('API Error in POST /api/pandit-photo:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to save photo' }));
            }
            return;
          }
        }

        // Permanent 10 Lakh+ Visitor Counter + 100+ Live Active Users endpoint
        if (url === '/api/visitor-counter') {
          if (req.method === 'GET') {
            const queryPart = rawUrl.split('?')[1] || '';
            const params = new URLSearchParams(queryPart);
            const clientMax = Number(params.get('clientMax') || 0);
            const sessionId = params.get('sessionId') || undefined;
            const data = getVisitorCount(clientMax, sessionId);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }

          if (req.method === 'POST') {
            try {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              }
              const body = Buffer.concat(chunks).toString('utf-8');
              const parsed = JSON.parse(body || '{}');
              const data =
                parsed.increment === false
                  ? getVisitorCount(Number(parsed.clientKnownMax || 0), parsed.sessionId)
                  : incrementVisitorCount(Number(parsed.clientKnownMax || 0), parsed.sessionId);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            } catch (err) {
              console.error('API Error in POST /api/visitor-counter:', err);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(getVisitorCount()));
            }
            return;
          }
        }

        if (url === '/api/active-users/leave' && req.method === 'POST') {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const body = Buffer.concat(chunks).toString('utf-8');
            const parsed = JSON.parse(body || '{}');
            removeActiveSession(parsed.sessionId);
          } catch {
            // ignore
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiChatPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: {
        ignored: [
          '**/users_store.json',
          '**/bookings_store.json',
          '**/visitor_counter.json',
          '**/data/**',
          '**/profile_photo.json',
          '**/public/*.jpg',
          '**/public/app-icon.svg',
          '**/public/sitemap.xml',
          '**/public/robots.txt',
          '**/dist/**',
          '**/src/assets/pandit-photo.jpg',
          '**/src/data/panditImage.ts',
        ],
      },
    },
  };
});
