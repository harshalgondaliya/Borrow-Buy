import { apiRequest } from './api';

export interface BookingQRCodesResponse {
  bookingNumber: string;
  status: string;
  pickupCode: string;
  returnCode: string;
  pickupQrDataUrl: string | null;
  returnQrDataUrl: string | null;
  isPickedUp: boolean;
  isReturned: boolean;
}

export const qrService = {
  async getBookingQRCodes(bookingId: string): Promise<{ success: boolean; data: BookingQRCodesResponse }> {
    return apiRequest(`/qr/booking/${bookingId}`);
  },

  async verifyPickup(code: string): Promise<{ success: boolean; message: string; booking: any }> {
    return apiRequest('/qr/verify-pickup', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async verifyReturn(code: string): Promise<{
    success: boolean;
    message: string;
    isOverdue: boolean;
    lateFeeCalculated: number;
    booking: any;
  }> {
    return apiRequest('/qr/verify-return', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
};

