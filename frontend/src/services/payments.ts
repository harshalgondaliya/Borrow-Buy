import { apiRequest } from './api';

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  userId: string;
  transactionId: string;
  amount: number;
  rentalAmount: number;
  depositAmount: number;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod: string;
  failureReason?: string;
  createdAt: string;
  booking?: {
    bookingNumber: string;
    product: {
      name: string;
      images: string[];
    };
  };
}

export const paymentsService = {
  async payBooking(bookingId: string, simulateFailure: boolean = false): Promise<any> {
    return apiRequest('/payments/pay-booking', {
      method: 'POST',
      body: JSON.stringify({ bookingId, simulateFailure }),
    });
  },

  async getPaymentHistory(): Promise<{ success: boolean; data: PaymentTransaction[] }> {
    return apiRequest('/payments/history');
  },
};

