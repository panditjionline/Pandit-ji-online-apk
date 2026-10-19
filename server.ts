import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleChatMessage } from './src/server/chatHandler';
import { getStoredBookings, saveNewBooking, deleteStoredBookings } from './src/server/bookingsHandler';
import { getUserByPhone, saveOrUpdateUserByPhone } from './src/server/userStoreHandler';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API route for Shashank Sharma AI chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const result = await handleChatMessage(message, history || []);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process Vedic consultation chat' });
  }
});

// API routes for Bookings (Private per user phone number)
app.get('/api/bookings', (req, res) => {
  const phone = String(req.query.phone || '').replace(/\D/g, '').slice(-10);
  if (!phone || phone.length !== 10) {
    res.json([]);
    return;
  }
  const bookings = getStoredBookings().filter(
    (b) => (b.phone || '').replace(/\D/g, '').slice(-10) === phone
  );
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  try {
    const newBooking = req.body;
    const updated = saveNewBooking(newBooking);
    res.json({ success: true, count: updated.length, booking: newBooking });
  } catch (error) {
    console.error('Error in /api/bookings:', error);
    res.status(500).json({ error: 'Failed to record booking' });
  }
});

app.delete('/api/bookings', (req, res) => {
  try {
    const id = req.query.id ? String(req.query.id) : undefined;
    const phone = req.query.phone ? String(req.query.phone) : undefined;
    const updated = deleteStoredBookings({ id, phone });
    res.json({ success: true, bookings: updated });
  } catch (error) {
    console.error('Error in DELETE /api/bookings:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// API routes for Mobile Number Login & User History
app.get('/api/user-data', (req, res) => {
  try {
    const phone = String(req.query.phone || '');
    const password = String(req.query.password || '');
    const checkOnly = req.query.checkOnly === 'true';
    const user = getUserByPhone(phone);

    if (checkOnly) {
      res.json({ found: !!user, hasPassword: !!(user?.password) });
      return;
    }

    if (user && user.password && user.password.trim() !== '') {
      if (password.trim() !== user.password.trim()) {
        res.status(401).json({
          found: true,
          error: 'WRONG_PASSWORD',
          message: 'गलत पासवर्ड! इस मोबाइल नंबर का डेटा सुरक्षित है। कृपया सही पासवर्ड दर्ज करें।',
        });
        return;
      }
    }

    res.json({ found: !!user, user });
  } catch (error) {
    console.error('Error in GET /api/user-data:', error);
    res.status(500).json({ error: 'Failed to load user account' });
  }
});

app.post('/api/user-data', (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.phone) {
      res.status(400).json({ error: 'Mobile number is required' });
      return;
    }
    const savedUser = saveOrUpdateUserByPhone(payload);
    res.json({ success: true, user: savedUser });
  } catch (error) {
    console.error('Error in POST /api/user-data:', error);
    res.status(500).json({ error: 'Failed to save user account' });
  }
});

// Serve static frontend in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Pandit Ji Online server running on port ${port}`);
});
