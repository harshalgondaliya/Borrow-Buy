export interface ProcessPaymentParams {
  bookingId: string;
  userId: string;
  amount: number;
  rentalAmount: number;
  depositAmount: number;
  simulateFailure?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  status: 'SUCCESSFUL' | 'FAILED';
  paymentMethod: string;
  failureReason?: string;
}

export interface RefundResult {
  success: boolean;
  refundTransactionId: string;
  amountRefunded: number;
  status: 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'FAILED';
}

export interface IPaymentGateway {
  processPayment(params: ProcessPaymentParams): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount: number, reason?: string): Promise<RefundResult>;
}

