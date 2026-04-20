const prisma = require('../lib/prisma');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const logActivity      = require('../utils/logActivity');
const createNotification = require('../utils/createNotification');

// ── GET /api/properties ───────────────────────────────────────────────────────
const getProperties = async (req, res) => {
  try {
    const {
      city, area, minRent, maxRent, bedrooms,
      propertyType, furnished, sort, page = 1, limit = 12
    } = req.query;

    const where = { status: { not: 'INACTIVE' } };
    if (city)         where.city         = { contains: city, mode: 'insensitive' };
    if (area)         where.area         = { contains: area, mode: 'insensitive' };
    if (propertyType) where.propertyType = propertyType;
    if (furnished)    where.furnished    = furnished;
    if (bedrooms)     where.bedrooms     = { gte: parseInt(bedrooms) };
    if (minRent || maxRent) {
      where.rent = {};
      if (minRent) where.rent.gte = parseInt(minRent);
      if (maxRent) where.rent.lte = parseInt(maxRent);
    }

    const orderBy =
      sort === 'rent_asc'  ? { rent: 'asc'  } :
      sort === 'rent_desc' ? { rent: 'desc' } :
      { listedAt: 'desc' };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const take  = parseInt(limit);

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where, orderBy, skip, take,
        include: { owner: { select: { id: true, name: true, avatar: true } }, _count: { select: { applications: true } } }
      }),
      prisma.property.count({ where }),
    ]);

    return res.json({ properties, total, page: parseInt(page), pages: Math.ceil(total / take) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/properties/mine (owner only) ────────────────────────────────────
const getMyProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.user.id },
      orderBy: { listedAt: 'desc' },
      include: { _count: { select: { applications: true } } }
    });
    return res.json({ properties });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/properties/:id ───────────────────────────────────────────────────
const getProperty = async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { applications: true } }
      }
    });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    return res.json({ property });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── POST /api/properties ─────────────────────────────────────────────────────
const createProperty = async (req, res) => {
  try {
    const {
      title, description, city, area, address,
      rent, deposit, bedrooms, bathrooms, furnished,
      propertyType, floorArea, amenities, status
    } = req.body;

    // Upload images (files from multer)
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path);
        imageUrls.push(url);
      }
    }
    // Fall back to type-based placeholder if no images uploaded
    if (imageUrls.length === 0) {
      const placeholders = {
        APARTMENT: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1e52ab0645?w=800',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        VILLA: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
        ],
        STUDIO: [
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'
        ],
        INDEPENDENT_HOUSE: [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
        ],
        PG: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
          'https://images.unsplash.com/photo-1522771731478-44eb10e5c66e?w=800'
        ],
      };
      const list = placeholders[propertyType] || placeholders.APARTMENT;
      imageUrls.push(list[Math.floor(Math.random() * list.length)]);
    }

    const amenitiesArr = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : []);

    const property = await prisma.property.create({
      data: {
        ownerId: req.user.id,
        title, description, city, area, address,
        rent: parseInt(rent), deposit: parseInt(deposit),
        bedrooms: parseInt(bedrooms), bathrooms: parseInt(bathrooms),
        furnished, propertyType, floorArea: parseInt(floorArea),
        amenities: amenitiesArr, images: imageUrls,
        status: status || 'AVAILABLE',
      }
    });

    await logActivity({ userId: req.user.id, action: 'PROPERTY_CREATED', entity: 'Property', entityId: property.id });
    return res.status(201).json({ property });
  } catch (err) {
    console.error('createProperty error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── PUT /api/properties/:id ───────────────────────────────────────────────────
const updateProperty = async (req, res) => {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Property not found' });
    if (existing.ownerId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Not authorized' });

    const {
      title, description, city, area, address,
      rent, deposit, bedrooms, bathrooms, furnished,
      propertyType, floorArea, amenities, status,
      existingImages
    } = req.body;

    const amenitiesArr = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : existing.amenities);

    const existingImagesArr = Array.isArray(existingImages) ? existingImages : (existingImages ? [existingImages] : []);
    const newImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path);
        newImageUrls.push(url);
      }
    }
    
    let finalImages = [...existingImagesArr, ...newImageUrls];
    if (finalImages.length === 0) {
      const placeholders = {
        APARTMENT: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1e52ab0645?w=800',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        VILLA: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
        ],
        STUDIO: [
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'
        ],
        INDEPENDENT_HOUSE: [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
        ],
        PG: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
          'https://images.unsplash.com/photo-1522771731478-44eb10e5c66e?w=800'
        ],
      };
      const list = placeholders[propertyType] || placeholders.APARTMENT;
      finalImages.push(list[Math.floor(Math.random() * list.length)]);
    }

    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        title, description, city, area, address,
        rent: parseInt(rent), deposit: parseInt(deposit),
        bedrooms: parseInt(bedrooms), bathrooms: parseInt(bathrooms),
        furnished, propertyType, floorArea: parseInt(floorArea),
        amenities: amenitiesArr, status,
        images: finalImages,
      }
    });

    await logActivity({ userId: req.user.id, action: 'PROPERTY_UPDATED', entity: 'Property', entityId: property.id });
    return res.json({ property });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── DELETE /api/properties/:id ────────────────────────────────────────────────
const deleteProperty = async (req, res) => {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Property not found' });
    if (existing.ownerId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Not authorized' });

    await prisma.property.delete({ where: { id: req.params.id } });
    await logActivity({ userId: req.user.id, action: 'PROPERTY_DELETED', entity: 'Property', entityId: req.params.id });
    return res.json({ message: 'Property deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── POST /api/properties/suggest-rent (LLM-powered) ──────────────────────────
const suggestRent = async (req, res) => {
  try {
    const { city, area, bedrooms, propertyType } = req.body;

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-your')) {
      // Return a rule-based fallback
      const baseRent = {
        Hyderabad: 15000, Bangalore: 20000, Mumbai: 30000, Chennai: 16000, Pune: 14000,
        Vijayawada: 12000, Guntur: 11000, Ongole: 10000, Amaravati: 14000, Tadepalli: 13000
      };
      const base = baseRent[city] || 15000;
      const bedroomMultiplier = { 1: 1, 2: 1.5, 3: 2, 4: 3 };
      const typeMultiplier = { APARTMENT: 1, VILLA: 2, STUDIO: 0.7, INDEPENDENT_HOUSE: 1.3, PG: 0.5 };
      const suggested = Math.round(base * (bedroomMultiplier[bedrooms] || 1) * (typeMultiplier[propertyType] || 1));
      return res.json({
        suggestion: `📊 Based on market data, a ${bedrooms}BHK ${propertyType} in ${area}, ${city} typically rents for ₹${suggested.toLocaleString('en-IN')}–₹${(suggested * 1.2).toLocaleString('en-IN')}/month.`
      });
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Give a short, specific rent price suggestion for a ${bedrooms}BHK ${propertyType} in ${area}, ${city}, India. Include a rupee range. Keep it under 60 words.`
      }]
    });
    return res.json({ suggestion: msg.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getProperties, getMyProperties, getProperty, createProperty, updateProperty, deleteProperty, suggestRent };
