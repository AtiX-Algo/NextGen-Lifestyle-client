// f:\Feature_02_07\NextGen-Lifestyle-server-main\routes\productRoutes.js
const express = require('express');
const Product = require('../models/product');

const router = express.Router();

/**
 * GET /api/products
 * Query params:
 *  - q: keyword (name/brand/category)
 *  - category
 *  - minPrice, maxPrice
 *  - sort: relevance | price-asc | price-desc | rating-desc | newest
 *  - page, limit
 */
router.get('/', async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sort = 'relevance',
      page = 1,
      limit = 12
    } = req.query;

    const filter = { isArchived: { $ne: true } };

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query;
    let projection = {};

    if (q) {
      filter.$text = { $search: q };
      projection = { score: { $meta: 'textScore' } };
      query = Product.find(filter, projection);
    } else {
      query = Product.find(filter);
    }

    // Sorting
    if (sort === 'price-asc') query = query.sort({ price: 1 });
    else if (sort === 'price-desc') query = query.sort({ price: -1 });
    else if (sort === 'rating-desc') query = query.sort({ ratingAverage: -1 });
    else if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else if (sort === 'relevance' && q) query = query.sort({ score: { $meta: 'textScore' } });
    else query = query.sort({ createdAt: -1 });

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 12;

    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
      query.skip(skip).limit(limitNumber).lean(),
      Product.countDocuments(filter)
    ]);

    let suggestions = null;
    if (!products.length && (q || category || minPrice || maxPrice)) {
      const [categories, brands] = await Promise.all([
        Product.distinct('category', { isArchived: { $ne: true } }),
        Product.distinct('brand', { isArchived: { $ne: true } })
      ]);

      suggestions = {
        message: 'No results. Try changing your keyword or clearing filters.',
        possibleCategories: categories.filter(Boolean),
        possibleBrands: brands.filter(Boolean),
        clearFilters: true
      };
    }

    // Map products to ensure consistent fields for frontend
    const mappedProducts = products.map((product) => {
      const obj = product;
      
      // Force consistent fields for frontend:
      obj.price = typeof obj.price === "number" ? obj.price : (obj.basePrice ?? obj.effectivePrice ?? 0);
      obj.ratingAverage = typeof obj.ratingAverage === "number" && obj.ratingAverage > 0
        ? obj.ratingAverage
        : (obj.rating ?? obj.effectiveRating ?? 0);
      
      return obj;
    });

    res.json({
      products: mappedProducts,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      suggestions
    });

  } catch (err) {
    console.error('Error fetching products', err);
    res.status(500).json({ message: 'Failed to load products' });
  }
});

/**
 * GET /api/products/filters/meta
 */
router.get('/filters/meta', async (req, res) => {
  try {
    const [categories, priceStats] = await Promise.all([
      Product.distinct('category', { isArchived: { $ne: true } }),
      Product.aggregate([
        { $match: { isArchived: { $ne: true } } },
        { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
      ])
    ]);

    const priceGroup = priceStats[0] || { minPrice: 0, maxPrice: 0 };

    res.json({
      categories: categories.filter(Boolean),
      minPrice: priceGroup.minPrice,
      maxPrice: priceGroup.maxPrice
    });

  } catch (err) {
    console.error('Error fetching filters meta', err);
    res.status(500).json({ message: 'Failed to load product filters' });
  }
});

/**
 * GET /api/products/:id
 * Product details
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product || product.isArchived) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure consistent fields for frontend
    const obj = product;
    obj.price = typeof obj.price === "number" ? obj.price : (obj.basePrice ?? obj.effectivePrice ?? 0);
    obj.ratingAverage = typeof obj.ratingAverage === "number" && obj.ratingAverage > 0
      ? obj.ratingAverage
      : (obj.rating ?? obj.effectiveRating ?? 0);

    res.json(obj);

  } catch (err) {
    console.error('Error fetching product detail', err);
    res.status(500).json({ message: 'Failed to load product' });
  }
});

/**
 * POST /api/products
 */
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);

  } catch (err) {
    console.error('Error creating product', err);
    res.status(400).json({
      message: 'Failed to create product',
      error: err.message
    });
  }
});

/**
 * PATCH /api/products/:id/stock
 * Update stock for a product or variant
 */
router.patch('/:id/stock', async (req, res) => {
  try {
    const { variantId, stock } = req.body;
    
    if (variantId) {
      // Update specific variant stock
      const product = await Product.findOneAndUpdate(
        { _id: req.params.id, 'variants._id': variantId },
        { $set: { 'variants.$.stock': Number(stock) } },
        { new: true }
      );
      return res.json(product);
    } else {
      // Update main product stock (if no variants)
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: { stock: Number(stock) } },
        { new: true }
      );
      return res.json(product);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/products/:id/inventory
 * Update inventory (Admin UI)
 */
router.put("/:id/inventory", async (req, res) => {
  try {
    const { variants } = req.body;

    if (!Array.isArray(variants))
      return res.status(400).json({ message: "Variants array required" });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    variants.forEach((updatedVariant) => {
      const target = product.variants.find(
        (v) => v.size === updatedVariant.size && v.color === updatedVariant.color
      );

      if (target) {
        const minStock = target.reserved || 0;
        target.stock = Math.max(updatedVariant.stock, minStock);
      }
    });

    await product.save();

    res.json({
      message: "Inventory updated successfully",
      product
    });

  } catch (err) {
    console.error("Error updating inventory", err);
    res.status(500).json({ message: "Failed to update inventory" });
  }
});

/**
 * PUT /api/products/:id/manual-stock
 * Developer manual stock override (Postman)
 */
router.put("/:id/manual-stock", async (req, res) => {
  try {
    const { size, color, stock } = req.body;

    if (!size || !color || stock === undefined) {
      return res.status(400).json({
        message: "size, color, and stock are required"
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const variant = product.variants.find(
      (v) => v.size === size && v.color === color
    );

    if (!variant)
      return res.status(404).json({ message: "Variant not found" });

    const reserved = variant.reserved || 0;
    variant.stock = Math.max(stock, reserved);

    await product.save();

    res.json({
      message: "Stock updated manually",
      product
    });

  } catch (err) {
    console.error("Error updating manual stock", err);
    res.status(500).json({ message: "Manual stock update failed" });
  }
});

module.exports = router;