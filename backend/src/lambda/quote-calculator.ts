/**
 * AWS Lambda Function: Serverless Rental Quote Calculator
 * Triggered by: Amazon API Gateway (POST /quote or GET /quote)
 * Purpose: Computes rental pricing, multi-day tiered discounts, GST, and security deposits
 */

export interface QuoteRequest {
  pricePerDay: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  insuranceOptIn?: boolean;
}

export interface QuoteResponse {
  rentalDays: number;
  baseRental: number;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
  gstAmount: number; // 18% GST in India
  insuranceFee: number;
  securityDeposit: number;
  totalPayableNow: number;
  estimatedRefundableDeposit: number;
  currency: string;
}

export function calculateQuote(input: QuoteRequest): QuoteResponse {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const rentalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const baseRental = input.pricePerDay * rentalDays;

  // Tiered discounts for Indian rental market
  let discountPercentage = 0;
  if (rentalDays >= 30) {
    discountPercentage = 30; // Monthly discount
  } else if (rentalDays >= 14) {
    discountPercentage = 20; // Fortnight discount
  } else if (rentalDays >= 7) {
    discountPercentage = 15; // Weekly discount
  } else if (rentalDays >= 3) {
    discountPercentage = 5;  // Weekend / 3-day discount
  }

  const discountAmount = Math.round((baseRental * discountPercentage) / 100);
  const subtotal = baseRental - discountAmount;
  const gstAmount = Math.round(subtotal * 0.18); // 18% Goods & Services Tax
  const insuranceFee = input.insuranceOptIn ? Math.round(subtotal * 0.05) : 0;
  const totalPayableNow = subtotal + gstAmount + insuranceFee + input.securityDeposit;

  return {
    rentalDays,
    baseRental,
    discountPercentage,
    discountAmount,
    subtotal,
    gstAmount,
    insuranceFee,
    securityDeposit: input.securityDeposit,
    totalPayableNow,
    estimatedRefundableDeposit: input.securityDeposit,
    currency: 'INR',
  };
}

/**
 * Standard AWS Lambda Handler signature for API Gateway HTTP API
 */
export async function handler(event: any) {
  try {
    const body: QuoteRequest = typeof event.body === 'string'
      ? JSON.parse(event.body)
      : event.queryStringParameters || event;

    if (!body.pricePerDay || !body.startDate || !body.endDate) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required parameters: pricePerDay, startDate, endDate',
        }),
      };
    }

    const quote = calculateQuote({
      pricePerDay: Number(body.pricePerDay),
      securityDeposit: Number(body.securityDeposit || 0),
      startDate: body.startDate,
      endDate: body.endDate,
      insuranceOptIn: Boolean(body.insuranceOptIn),
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: quote,
        computedBy: 'AWS Lambda (ap-south-1)',
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
