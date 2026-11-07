import { prisma } from '../../shared/prisma.js';
import { storageService } from '../../integrations/storage/index.js';
import { InspectionType } from '@prisma/client';

export class InspectionsService {
  static async createInspection(
    inspectorId: string,
    data: {
      bookingId: string;
      type: InspectionType;
      conditionNotes: string;
      existingDamage?: string;
    },
    files: Express.Multer.File[] = []
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { product: true },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    // Verify inspector is customer or owner
    if (booking.customerId !== inspectorId && booking.product.ownerId !== inspectorId) {
      throw new Error('Forbidden: Only the customer or owner can record inspection photos.');
    }

    const photoUrls: string[] = [];
    for (const file of files) {
      const upload = await storageService.uploadFile(file, 'inspections');
      photoUrls.push(upload.url);
    }

    // If no files uploaded, supply placeholder condition photo
    if (photoUrls.length === 0) {
      photoUrls.push(
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'
      );
    }

    const inspection = await prisma.inspection.create({
      data: {
        bookingId: data.bookingId,
        inspectorId,
        type: data.type,
        photos: photoUrls,
        conditionNotes: data.conditionNotes,
        existingDamage: data.existingDamage,
        confirmedByCustomer: inspectorId === booking.customerId,
      },
      include: {
        inspector: {
          select: { id: true, fullName: true, role: true },
        },
      },
    });

    return inspection;
  }

  static async confirmInspection(userId: string, inspectionId: string) {
    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: { booking: true },
    });

    if (!inspection) {
      throw new Error('Inspection record not found.');
    }

    if (inspection.booking.customerId !== userId) {
      throw new Error('Forbidden: Only the customer can sign off on condition reports.');
    }

    const updated = await prisma.inspection.update({
      where: { id: inspectionId },
      data: { confirmedByCustomer: true },
    });

    return updated;
  }

  static async getBookingInspections(bookingId: string) {
    return prisma.inspection.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
      include: {
        inspector: {
          select: { id: true, fullName: true, role: true, avatarUrl: true },
        },
      },
    });
  }
}

