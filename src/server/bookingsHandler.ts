import fs from 'fs';
import os from 'os';
import path from 'path';
import { BookingRequest } from '../types';

const SEED_BOOKINGS_FILE = path.resolve(process.cwd(), 'bookings_store.json');
const RUNTIME_BOOKINGS_FILE = path.join(os.tmpdir(), 'panditji_bookings_store.json');

export function getStoredBookings(): BookingRequest[] {
  try {
    if (fs.existsSync(RUNTIME_BOOKINGS_FILE)) {
      const data = fs.readFileSync(RUNTIME_BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data || '[]');
      if (Array.isArray(parsed)) return parsed;
    }
    if (fs.existsSync(SEED_BOOKINGS_FILE)) {
      const data = fs.readFileSync(SEED_BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data || '[]');
      if (Array.isArray(parsed)) {
        try {
          fs.writeFileSync(RUNTIME_BOOKINGS_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        } catch {
          // ignore
        }
        return parsed;
      }
    }
    return [];
  } catch (err) {
    console.error('Error reading bookings:', err);
    return [];
  }
}

export function saveNewBooking(booking: BookingRequest): BookingRequest[] {
  try {
    const existing = getStoredBookings();
    const updated = [booking, ...existing];
    fs.writeFileSync(RUNTIME_BOOKINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Error saving booking:', err);
    return [booking];
  }
}

export function deleteStoredBookings(options: { id?: string; phone?: string }): BookingRequest[] {
  try {
    const existing = getStoredBookings();
    const cleanTargetPhone = (options.phone || '').replace(/\D/g, '').slice(-10);
    const updated = existing.filter((b) => {
      if (options.id && b.id === options.id) return false;
      if (cleanTargetPhone && (b.phone || '').replace(/\D/g, '').slice(-10) === cleanTargetPhone) {
        return false;
      }
      return true;
    });
    fs.writeFileSync(RUNTIME_BOOKINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Error deleting bookings:', err);
    return [];
  }
}
