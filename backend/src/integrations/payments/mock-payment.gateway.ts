import crypto from 'crypto';
import { 
  IPaymentGateway, 
  ProcessPaymentParams, 
  PaymentResult, 
  RefundResult 
} from './payment.interface.js';

export class MockPaymentGateway implements IPaymentGateway {
  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    // Artificial small delay to simulate gateway communication
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (params.simulateFailure) {
      return {
        success: false,
        transactionId: `TXN-FAIL-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        amount: params.amount,
        status: 'FAILED',
        paymentMethod: 'SIMULATED_CARD',
        failureReason: 'Simulated insufficient balance or test decline.',
      };
    }

    const transactionId = `TXN-SIM-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    console.log(
      `[MockPaymentGateway] 💳 Processed simulated payment for booking ${params.bookingId}: ` +
      `$${params.amount.toFixed(2)} (Rental: $${params.rentalAmount.toFixed(2)}, Deposit: $${params.depositAmount.toFixed(2)}). ` +
      `TxnID: ${transactionId}`
    );

    return {
      success: true,
      transactionId,
      amount: params.amount,
      status: 'SUCCESSFUL',
      paymentMethod: 'SIMULATED_CARD',
    };
  }

  async refundPayment(transactionId: string, amount: number, reason?: string): Promise<RefundResult> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const refundTransactionId = `REF-SIM-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    console.log(
      `[MockPaymentGateway] 💸 Processed simulated refund of $${amount.toFixed(2)} ` +
      `for original TxnID ${transactionId}. Reason: ${reason || 'End of rental deposit refund'}. ` +
      `RefundTxnID: ${refundTransactionId}`
    );

    return {
      success: true,
      refundTransactionId,
      amountRefunded: amount,
      status: 'REFUNDED',
    };
  }
}

export const paymentGateway = new MockPaymentGateway();

