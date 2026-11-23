import { prisma } from '../../shared/prisma.js';
import { storageService } from '../../integrations/storage/index.js';
import { 
  ProductCondition, 
  ListingStatus, 
  ApprovalStatus, 
  BookingStatus,
  UserRole
} from '@prisma/client';

export class ProductsService {
  static async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  static async listProducts(query: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: ProductCondition;
    location?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'deposit_asc';
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      approvalStatus: ApprovalStatus.APPROVED,
      listingStatus: ListingStatus.ACTIVE,
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.condition) {
      where.condition = query.condition;
    }

    if (query.location) {
      where.location = {
        contains: query.location,
        mode: 'insensitive',
      };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.pricePerDay = {};
      if (query.minPrice !== undefined) where.pricePerDay.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.pricePerDay.lte = query.maxPrice;
    }

    if (query.search) {
      const trimmedSearch = query.search.trim();
      const searchTerms = [trimmedSearch];

      // Common Indian equipment rental synonyms & colloquial terms
      const synonymMap: Record<string, string[]> = {
        drill: ['hammer drill', 'drilling', 'drill machine'],
        'drill machine': ['drill', 'hammer drill'],
        camera: ['dslr', 'mirrorless', 'cam'],
        dslr: ['camera', 'mirrorless'],
        mic: ['microphone', 'lavalier', 'wireless mic'],
        mike: ['microphone', 'mic'],
        microphone: ['mic', 'lavalier'],
        speaker: ['sound system', 'pa system', 'sound', 'audio'],
        'sound system': ['speaker', 'pa system', 'amplifier'],
        projector: ['screen', 'presentation'],
        screen: ['projector screen', 'tripod screen'],
        cycle: ['bicycle', 'bike'],
        bike: ['bicycle', 'cycling'],
        bicycle: ['cycle', 'bike'],
        laptop: ['macbook', 'computer', 'notebook'],
        macbook: ['laptop', 'apple'],
        tent: ['camping', 'outdoor shelter'],
        cooler: ['ice box', 'icebox'],
        vacuum: ['cleaning', 'vacuum cleaner'],
        drone: ['quadcopter', 'camera drone'],
      };

      const lowerSearch = trimmedSearch.toLowerCase();
      if (synonymMap[lowerSearch]) {
        searchTerms.push(...synonymMap[lowerSearch]);
      }

      // Also split terms by space for multi-keyword queries (e.g. "Bosch Drill")
      const tokens = trimmedSearch.split(/\s+/).filter(t => t.length >= 3);

      const conditions: any[] = [];
      const termsToSearch = Array.from(new Set([...searchTerms, ...tokens]));

      for (const term of termsToSearch) {
        conditions.push(
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
          { model: { contains: term, mode: 'insensitive' } },
          { location: { contains: term, mode: 'insensitive' } },
          { category: { name: { contains: term, mode: 'insensitive' } } },
          { category: { slug: { contains: term, mode: 'insensitive' } } }
        );
      }

      where.OR = conditions;
    }

    // Determine sorting
    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') orderBy = { pricePerDay: 'asc' };
    if (query.sortBy === 'price_desc') orderBy = { pricePerDay: 'desc' };
    if (query.sortBy === 'deposit_asc') orderBy = { securityDeposit: 'asc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
          productImages: {
            orderBy: { orderIndex: 'asc' },
          },
          owner: {
            select: {
              id: true,
              fullName: true,
              trustScore: true,
              isVerifiedOwner: true,
              avatarUrl: true,
              ownerAddress: true,
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        productImages: {
          orderBy: { orderIndex: 'asc' },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            trustScore: true,
            ownerBio: true,
            ownerAddress: true,
            isVerifiedOwner: true,
            createdAt: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: [
                BookingStatus.COMPLETED,
                BookingStatus.ACTIVE,
                BookingStatus.CONFIRMED,
                BookingStatus.RESERVED,
              ],
            },
          },
          select: {
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found.');
    }

    // Fetch reviews for bookings associated with this product
    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          productId: id,
        },
        type: 'CUSTOMER_TO_OWNER',
      },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 5.0;

    return {
      ...product,
      reviews,
      reviewCount: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(1)),
    };
  }

  static async createProduct(
    ownerId: string,
    data: {
      name: string;
      description: string;
      categoryId: string;
      brand?: string;
      model?: string;
      pricePerDay: number;
      securityDeposit: number;
      condition: ProductCondition;
      location: string;
      specifications?: Record<string, any> | null;
      includedAccessories?: string[];
      quantity?: number;
      rentalInstructions?: string | null;
    },
    files: Express.Multer.File[] = []
  ) {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new Error('Selected category does not exist.');
    }

    // Upload images via storage adapter
    const imageUrls: string[] = [];
    for (const file of files) {
      const upload = await storageService.uploadFile(file, 'products');
      imageUrls.push(upload.url);
    }

    // If no images uploaded, assign high quality placeholder based on category
    if (imageUrls.length === 0) {
      imageUrls.push(
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
      );
    }

    const product = await prisma.product.create({
      data: {
        ownerId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        brand: data.brand,
        model: data.model,
        pricePerDay: data.pricePerDay,
        securityDeposit: data.securityDeposit,
        condition: data.condition,
        location: data.location,
        images: imageUrls,
        specifications: data.specifications ?? undefined,
        includedAccessories: data.includedAccessories ?? [],
        quantity: data.quantity ?? 1,
        rentalInstructions: data.rentalInstructions,
        approvalStatus: ApprovalStatus.APPROVED, // Auto-approve for demo convenience
        listingStatus: ListingStatus.ACTIVE,
        productImages: {
          create: imageUrls.map((url, idx) => ({
            url,
            altText: `${data.name} - view ${idx + 1}`,
            orderIndex: idx,
            isPrimary: idx === 0,
            license: 'Attribution / Verified Rental Photography',
          })),
        },
      },
      include: {
        category: true,
        productImages: {
          orderBy: { orderIndex: 'asc' },
        },
        owner: {
          select: { id: true, fullName: true, trustScore: true },
        },
      },
    });

    return product;
  }

  static async updateProduct(
    ownerId: string,
    productId: string,
    data: Partial<{
      name: string;
      description: string;
      categoryId: string;
      brand?: string;
      model?: string;
      pricePerDay: number;
      securityDeposit: number;
      condition: ProductCondition;
      location: string;
      specifications?: Record<string, any> | null;
      includedAccessories?: string[];
      quantity?: number;
      rentalInstructions?: string | null;
      listingStatus: ListingStatus;
    }>,
    files: Express.Multer.File[] = [],
    role?: UserRole
  ) {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      throw new Error('Product not found.');
    }

    if (role !== UserRole.ADMIN && existing.ownerId !== ownerId) {
      throw new Error('Forbidden: You can only edit your own listings.');
    }

    const newImageUrls: string[] = [];
    for (const file of files) {
      const upload = await storageService.uploadFile(file, 'products');
      newImageUrls.push(upload.url);
    }

    const updatedImages = newImageUrls.length > 0 
      ? [...existing.images, ...newImageUrls] 
      : existing.images;

    if (newImageUrls.length > 0) {
      const startIndex = existing.images.length;
      await prisma.productImage.createMany({
        data: newImageUrls.map((url, idx) => ({
          productId,
          url,
          altText: `${existing.name} - view ${startIndex + idx + 1}`,
          orderIndex: startIndex + idx,
          isPrimary: false,
          license: 'Attribution / Verified Rental Photography',
        })),
      });
    }

    const { categoryId, ...restData } = data;
    const updatePayload: Record<string, any> = {
      ...restData,
      images: updatedImages,
    };
    if (categoryId) {
      updatePayload.categoryId = categoryId;
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updatePayload,
      include: {
        category: true,
        productImages: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return updated;
  }

  static async deleteProduct(ownerId: string, productId: string, role?: UserRole) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        bookings: {
          where: {
            status: {
              in: [
                BookingStatus.RESERVED,
                BookingStatus.CONFIRMED,
                BookingStatus.READY_FOR_PICKUP,
                BookingStatus.ACTIVE,
              ],
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found.');
    }

    if (role !== UserRole.ADMIN && product.ownerId !== ownerId) {
      throw new Error('Forbidden: You can only delete your own listings.');
    }

    if (product.bookings.length > 0) {
      throw new Error(
        'Cannot deactivate product with active, confirmed, or ongoing bookings.'
      );
    }

    // Soft deactivate listing
    const deactivated = await prisma.product.update({
      where: { id: productId },
      data: {
        listingStatus: ListingStatus.INACTIVE,
      },
    });

    return {
      message: 'Product listing deactivated successfully.',
      product: deactivated,
    };
  }

  static async getOwnerProducts(ownerId: string) {
    return prisma.product.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        productImages: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });
  }
}

