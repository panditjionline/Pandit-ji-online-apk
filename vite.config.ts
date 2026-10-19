import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleChatMessage } from './src/server/chatHandler';
import { getStoredBookings, saveNewBooking, deleteStoredBookings } from './src/server/bookingsHandler';
import { getUserByPhone, saveOrUpdateUserByPhone } from './src/server/userStoreHandler';

function apiChatPlugin(): Plugin {
  return {
    name: 'api-chat-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const url = rawUrl.split('?')[0];

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

            const result = await handleChatMessage(message, history);

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
              const password = params.get('password') || '';
              const checkOnly = params.get('checkOnly') === 'true';
              const user = getUserByPhone(phone);

              if (checkOnly) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ found: !!user, hasPassword: !!(user?.password) }));
                return;
              }

              if (user && user.password && user.password.trim() !== '') {
                if (password.trim() !== user.password.trim()) {
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
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ found: !!user, user }));
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
        ignored: ['**/users_store.json', '**/bookings_store.json'],
      },
    },
  };
});
