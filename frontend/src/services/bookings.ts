import { apiRequest } from './api';
import { Product } from './products';

export interface BookingCalendarInterval {
  startDate: string;
  endDate: string;
  status: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  productId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyPrice: number;
  rentalTotal: number;
  securityDeposit: number;
  totalAmount: number;
  status:
    | 'PENDING'
    | 'RESERVED'
    | 'CONFIRMED'
    | 'READY_FOR_PICKUP'
    | 'ACTIVE'
    | 'RETURN_REQUESTED'
    | 'RETURNED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'DISPUTED';
  holdExpiresAt?: string;
  pickupCode?: string;
  returnCode?: string;
  pickupAt?: string;
  returnedAt?: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  lateFeePerDay: number;
  lateFeeCalculated: number;
  cancellationReason?: string;
  createdAt: string;
  product: Product;
  customer?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    trustScore: number;
    avatarUrl?: string;
  };
  payments?: any[];
  depositRecord?: any;
}

export const bookingsService = {
  async getProductCalendar(productId: string): Promise<{ success: boolean; data: BookingCalendarInterval[] }> {
    return apiRequest(`/bookings/calendar/${productId}`);
  },

  async checkAvailability(productId: string, startDate: string, endDate: string): Promise<{ success: boolean; available: boolean }> {
    return apiRequest(`/bookings/check-availability?productId=${productId}&startDate=${startDate}&endDate=${endDate}`);
  },

  async createBooking(data: {
    productId: string;
    startDate: string;
    endDate: string;
  }): Promise<{ success: boolean; message: string; data: Booking }> {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCustomerBookings(): Promise<{ success: boolean; data: Booking[] }> {
    return apiRequest('/bookings/my-bookings');
  },

  async getOwnerBookings(): Promise<{ success: boolean; data: Booking[] }> {
    return apiRequest('/bookings/owner-requests');
  },

  async getBookingById(id: string): Promise<{ success: boolean; data: Booking }> {
    return apiRequest(`/bookings/${id}`);
  },

  async cancelBooking(id: string, reason?: string): Promise<{ success: boolean; message: string; data: Booking }> {
    return apiRequest(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async confirmBooking(id: string): Promise<{ success: boolean; message: string; data: Booking }> {
    return apiRequest(`/bookings/${id}/confirm`, {
      method: 'POST',
    });
  },
};

