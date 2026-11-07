import { prisma } from '../../shared/prisma.js';
import { 
  UserRole, 
  UserStatus, 
  ApprovalStatus, 
  BookingStatus, 
  DisputeStatus,
  DepositStatus 
} from '@prisma/client';

export class AdminService {
  static async getPlatformStats() {
    const [
      totalUsers,
      totalOwners,
      totalCustomers,
      totalProducts,
      pendingProductApprovals,
      activeBookings,
      completedBookings,
      disputesCount,
      paymentsAgg,
      depositsAgg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.OWNER } }),
      prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      prisma.product.count(),
      prisma.product.count({ where: { approvalStatus: ApprovalStatus.PENDING } }),
      prisma.booking.count({ where: { status: BookingStatus.ACTIVE } }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.dispute.count({ where: { status: DisputeStatus.OPEN } }),
      prisma.payment.aggregate({
        _sum: { amount: true, rentalAmount: true },
        where: { status: 'SUCCESSFUL' },
      }),
      prisma.securityDeposit.aggregate({
        _sum: { originalAmount: true, deductionAmount: true, refundedAmount: true },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        owners: totalOwners,
        customers: totalCustomers,
      },
      products: {
        total: totalProducts,
        pendingApproval: pendingProductApprovals,
      },
      bookings: {
        active: activeBookings,
        completed: completedBookings,
        openDisputes: disputesCount,
      },
      financials: {
        grossSimulatedVolume: paymentsAgg._sum.amount || 0,
        totalRentalFees: paymentsAgg._sum.rentalAmount || 0,
        depositsHeld: depositsAgg._sum.originalAmount || 0,
        depositsRefunded: depositsAgg._sum.refundedAmount || 0,
        damageDeductions: depositsAgg._sum.deductionAmount || 0,
      },
    };
  }

  static async getUsers(query: { role?: UserRole; status?: UserStatus; search?: string }) {
    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isVerifiedOwner: true,
        trustScore: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            bookings: true,
          },
        },
      },
    });
  }

  static async updateUserStatus(
    userId: string,
    data: { status?: UserStatus; isVerifiedOwner?: boolean }
  ) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.isVerifiedOwner !== undefined && { isVerifiedOwner: data.isVerifiedOwner }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        isVerifiedOwner: true,
      },
    });

    return updated;
  }

  static async reviewProduct(
    productId: string,
    data: { approvalStatus: ApprovalStatus; rejectionReason?: string }
  ) {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        approvalStatus: data.approvalStatus,
        rejectionReason: data.rejectionReason,
      },
    });

    return updated;
  }

  static async getAllBookings(status?: BookingStatus) {
    const where = status ? { status } : {};
    return prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, location: true } },
        customer: { select: { fullName: true, email: true } },
        payments: true,
        depositRecord: true,
      },
    });
  }

  static async getDisputes() {
    return prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            bookingNumber: true,
            product: { select: { name: true, ownerId: true } },
            depositRecord: true,
          },
        },
        raisedBy: { select: { fullName: true, email: true, role: true } },
      },
    });
  }

  static async resolveDispute(
    disputeId: string,
    adminId: string,
    data: {
      status: DisputeStatus;
      resolutionNotes: string;
      deductedFromDeposit: number;
    }
  ) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { booking: { include: { depositRecord: true } } },
    });

    if (!dispute) {
      throw new Error('Dispute not found.');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update Dispute record
      const resolved = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: data.status,
          resolutionNotes: data.resolutionNotes,
          deductedFromDeposit: data.deductedFromDeposit,
          resolvedById: adminId,
          resolvedAt: new Date(),
        },
      });

      // 2. Adjust Security Deposit record if deposit exists
      if (dispute.booking.depositRecord) {
        const deposit = dispute.booking.depositRecord;
        const deduction = Math.min(deposit.originalAmount, data.deductedFromDeposit);
        const refundRemaining = Math.max(0, deposit.originalAmount - deduction);

        await tx.securityDeposit.update({
          where: { id: deposit.id },
          data: {
            deductionAmount: deduction,
            refundedAmount: refundRemaining,
            deductionReason: data.resolutionNotes,
            status: deduction > 0 ? DepositStatus.DEDUCTED : DepositStatus.FULLY_REFUNDED,
            releasedAt: new Date(),
          },
        });
      }

      // 3. Mark booking COMPLETED
      await tx.booking.update({
        where: { id: dispute.bookingId },
        data: { status: BookingStatus.COMPLETED },
      });

      return resolved;
    });
  }
}
