# BorrowBuy – Secure Administrator Configuration & Setup

This guide documents the security architecture, environment variable configuration, and deployment procedures for managing the BorrowBuy Administrator account.

---

## 🔒 1. Administrator Account Specifications

- **Designated Administrator Email**: Configurable via `ADMIN_EMAIL` (default: `admin@borrowbuy.in`)
- **Primary Permissions**:
  - Full Platform Governance & Moderation
  - Financial Ledger & Security Deposit Escrow Oversight
  - User Status Moderation (Suspension / Activation)
  - Damage Claim Arbitration & Mediation
  - Equipment Listing Approval & Quality Review

---

## 🔑 2. Initial Password Provisioning

### Local Development Setup

In local development, the initial administrator password is securely read from the environment variable:

```bash
# In backend/.env or your terminal session
ADMIN_INITIAL_PASSWORD="<YourSecureAdminPasswordHere>"
```

If `ADMIN_INITIAL_PASSWORD` is not explicitly set in development, the database seed uses a fallback configured for local development testing only.
*(In production, omitting `ADMIN_INITIAL_PASSWORD` halts execution with a fatal configuration error).*

To seed or refresh the database with this administrator:
```bash
npm run seed --workspace=database
```

### Production Security Protocol

When deploying to production (e.g., AWS ECS, EKS, or App Runner):

1. **Environment Variables**:
   - Store `ADMIN_INITIAL_PASSWORD` in **AWS Secrets Manager** or **AWS Systems Manager Parameter Store**.
   - Inject it into the container runtime securely.
2. **First Login Password Rotation**:
   - Upon first login with the initial credentials, navigate to Account Settings and update the password.
3. **No Public Credential Exposure**:
   - The BorrowBuy frontend login interface **strictly omits** any 1-click administrative demo buttons.
   - Administrator credentials must never be committed to Git, exposed in client bundles, or logged in server output.
4. **Disabling Seed in Production**:
   - Ensure `npm run seed` is excluded from automated production deployment pipelines (`CI/CD`).
   - Production migrations should only execute `npx prisma migrate deploy`.

---

## 🛡️ 3. Credential Protection Checklist

- [x] Password hashed using `bcrypt` with work factor 10.
- [x] Admin email configurable via environment (`admin@borrowbuy.in`).
- [x] Zero hardcoded admin passwords in frontend code.
- [x] Zero admin credentials displayed on public login screens.
- [x] Role-Based Access Control (`UserRole.ADMIN`) enforced on all `/api/admin/*` routes.
