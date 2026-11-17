# BorrowBuy – Comprehensive API & Serverless Contract Documentation

**Version:** 3.0.0-enterprise  
**Platform:** BorrowBuy Equipment Rental Platform  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Base URL:** `http://localhost:5000/api` (Local) / `https://api.borrowbuy.in/api` (Production) / `https://<api-id>.execute-api.ap-south-1.amazonaws.com` (API Gateway)

---

## 1. Authentication & Security Headers

### Bearer Token Authentication
All protected routes require an `Authorization` header containing a valid JWT (Local) or Cognito ID Token (AWS Cognito):
```http
Authorization: Bearer <jwt_or_cognito_token>
```

### Rate Limiting & Threat Protection
- **AWS WAFv2**: 1,000 requests per 5 minutes per IP address.
- **Express Rate Limiter**: 100 requests per 15 minutes on `/api/auth/*`.

---

## 2. Cloud Operations & Telemetry API (`/api/cloud`)

### `GET /api/cloud/overview`
Returns real-time server telemetry, database health probe latency, environment variables, driver configurations, and the full 16 AWS services matrix.

**Headers:** Optional Bearer token  
**Response Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "platform": "BorrowBuy Enterprise Cloud Platform",
    "version": "3.0.0",
    "region": "ap-south-1",
    "environment": "production",
    "uptimeSeconds": 1420,
    "timestamp": "2026-11-17T15:45:00.000Z",
    "compute": {
      "platform": "linux",
      "architecture": "x64",
      "cpus": 4,
      "memoryUsedMB": 680,
      "memoryTotalMB": 4096,
      "memoryPercent": 16
    },
    "database": {
      "engine": "PostgreSQL 16",
      "status": "CONNECTED",
      "latencyMs": 2,
      "productCount": 116,
      "bookingCount": 42,
      "userCount": 28
    },
    "drivers": {
      "storage": "s3",
      "notifications": "local",
      "payments": "mock",
      "queue": "memory"
    },
    "serviceCatalog": [
      {
        "id": 1,
        "name": "Amazon S3",
        "category": "Foundational",
        "status": "CONNECTED",
        "role": "Static SPA & Private Media Storage",
        "file": "s3-storage.service.ts"
      }
    ]
  }
}
```

### `POST /api/cloud/quote` (AWS Lambda via API Gateway)
Invokes the pure serverless Lambda handler (`backend/src/lambda/quote-calculator.ts`) to compute rental duration, volume discounts, GST (18%), and escrow security deposits.

**Request Body:**
```json
{
  "pricePerDay": 2800,
  "startDate": "2026-11-20T10:00:00.000Z",
  "endDate": "2026-11-27T10:00:00.000Z",
  "securityDeposit": 15000
}
```

**Response Status:** `200 OK`
```json
{
  "success": true,
  "data": {
    "days": 7,
    "dailyRate": 2800,
    "basePrice": 19600,
    "discountPercent": 15,
    "discountAmount": 2940,
    "subtotalAfterDiscount": 16660,
    "gstPercent": 18,
    "gstAmount": 2998.8,
    "platformFee": 300,
    "securityDeposit": 15000,
    "totalPayableNow": 19958.8,
    "totalWithDeposit": 34958.8,
    "refundableDeposit": 15000,
    "breakdown": "7 days @ ₹2,800/day = ₹19,600. Discount (15%): -₹2,940. GST (18%): ₹2,998.80. Refundable Deposit: ₹15,000.",
    "execution": {
      "environment": "AWS Lambda (Serverless)",
      "durationMs": 1.45,
      "memoryUsedMb": 18.2
    }
  }
}
```

### `GET /api/cloud/audit-logs`
Streams immutable rental audit log entries from Amazon DynamoDB (`BorrowBuy-RentalAuditLogs`).

**Query Parameters:**
- `bookingId` (optional): Filter events for a specific booking.
- `eventType` (optional): `RESERVATION_CREATED`, `PAYMENT_HELD`, `QR_CHECKIN`, `INSPECTION_LOGGED`, `ITEM_RETURNED`, `DEPOSIT_RELEASED`.
- `limit` (optional): Default 30.

**Response Status:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "source": "Amazon DynamoDB (BorrowBuy-RentalAuditLogs)",
  "data": [
    {
      "id": "audit-1794930650-a1b2",
      "bookingId": "983b9520-a481-4176-8ac5-9bf15772ceeb",
      "eventType": "PAYMENT_HELD",
      "actorId": "4d6b0d14-6914-46db-ac24-22a1b6b8f443",
      "timestamp": "2026-11-17T15:45:00.000Z",
      "pk": "RENTAL#983b9520-a481-4176-8ac5-9bf15772ceeb",
      "sk": "EVENT#2026-11-17T15:45:00.000Z#audit-1794930650-a1b2",
      "payload": {
        "rentalAmount": 500,
        "securityDeposit": 500,
        "transactionId": "TXN-SIM-1794930650477-4767D192"
      }
    }
  ]
}
```

---

## 3. Core Relational REST API Endpoints

### 3.1 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new renter or owner account | No |
| `POST` | `/api/auth/login` | Email/password sign in (returns JWT) | No |
| `GET` | `/api/auth/me` | Fetch active user profile and trust score | Yes |
| `POST` | `/api/auth/logout` | Revoke session / clear client cookie | Yes |

### 3.2 Product Catalog (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/products` | Filtered list of products (search, location, category, sort) | No |
| `GET` | `/api/products/categories` | Retrieve all 25 categories with listing counts | No |
| `GET` | `/api/products/:id` | Fetch detailed product specs, reviews, and availability | No |
| `POST` | `/api/products` | Create new equipment listing | Yes (OWNER/ADMIN) |
| `PUT` | `/api/products/:id` | Update equipment listing details | Yes (Owner) |
| `DELETE` | `/api/products/:id` | Archive listing (soft delete) | Yes (Owner/Admin) |

### 3.3 Bookings & Escrow (`/api/bookings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/bookings` | Create temporary 15-minute reservation hold | Yes |
| `GET` | `/api/bookings/my-rentals` | Get customer bookings & digital pass tokens | Yes |
| `GET` | `/api/bookings/owner-requests` | Get incoming rental approvals for owner | Yes (Owner) |
| `POST` | `/api/bookings/:id/cancel` | Cancel reservation and release hold | Yes |

### 3.4 Payments & Escrow (`/api/payments`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/payments/simulate` | Process payment, hold deposit, confirm booking | Yes |
| `GET` | `/api/payments/receipt/:id` | Download digital PDF/HTML tax invoice | Yes |

### 3.5 QR Handover & Inspection (`/api/qr`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/qr/token/:bookingId` | Generate single-use cryptographic pickup/return pass | Yes |
| `POST` | `/api/qr/verify-pickup` | Owner verifies borrower pass, logs condition, transitions to ACTIVE | Yes (Owner) |
| `POST` | `/api/qr/verify-return` | Owner verifies return pass, releases deposit | Yes (Owner) |

---

## 4. Background Job & Serverless Specifications

### Hold Sweeper (`backend/src/lambda/hold-sweeper.ts`)
- **Trigger**: Amazon EventBridge rule `rate(15 minutes)`.
- **Logic**: Queries PostgreSQL for bookings with status `RESERVED` where `holdExpiresAt < NOW()`. Transitions status to `EXPIRED` and restores equipment calendar availability.

### Audit Consumer (`backend/src/lambda/audit-consumer.ts`)
- **Trigger**: Amazon SQS Queue event batch (`BorrowBuy-EventQueue`).
- **Logic**: Reads event payloads (`BOOKING_CONFIRMED`, `PICKUP_VERIFIED`, etc.) and persists immutable audit records to DynamoDB.
