import { Request, Response } from 'express';
import { ProductsService } from './products.service.js';
import { 
  createProductSchema, 
  updateProductSchema, 
  productQuerySchema 
} from './products.validation.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export class ProductsController {
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await ProductsService.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch categories',
      });
    }
  }

  static async listProducts(req: Request, res: Response) {
    try {
      const validated = productQuerySchema.parse(req.query);
      const result = await ProductsService.listProducts(validated);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Invalid query filters',
          errors: error.errors,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list products',
      });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const product = await ProductsService.getProductById(req.params.id);
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Product not found',
      });
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validated = createProductSchema.parse(req.body);
      const files = (req.files as Express.Multer.File[]) || [];

      const product = await ProductsService.createProduct(req.user.id, validated, files);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create product',
      });
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validated = updateProductSchema.parse(req.body);
      const files = (req.files as Express.Multer.File[]) || [];

      const updated = await ProductsService.updateProduct(
        req.user.id,
        req.params.id,
        validated,
        files
      );

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update product',
      });
    }
  }

  static async deleteProduct(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await ProductsService.deleteProduct(req.user.id, req.params.id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to deactivate product',
      });
    }
  }

  static async getOwnerProducts(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const products = await ProductsService.getOwnerProducts(req.user.id);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve owner listings',
      });
    }
  }
}

