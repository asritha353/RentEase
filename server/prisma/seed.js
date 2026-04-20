const { PrismaClient } = require('@prisma/client');
const { users, properties, IMG } = require('./seedData1');
const { properties2 } = require('./seedData2');

const prisma = new PrismaClient();
const allProperties = [...properties, ...properties2];

async function main() {
  console.log('🌱 Seeding RentEase database...');

  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);

  // Upsert users
  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: defaultPassword },
      create: { name: u.name, email: u.email, avatar: u.avatar, role: u.role, status: 'ACTIVE', password: defaultPassword }
    });
    createdUsers.push(user);
    console.log(`  ✅ User: ${user.name} (${user.role})`);
  }

  const owners = createdUsers.filter(u => u.role === 'OWNER');

  // Delete existing properties
  await prisma.property.deleteMany({});
  console.log('  🗑️  Cleared existing properties');

  // Create properties — distribute among owners
  for (let i = 0; i < allProperties.length; i++) {
    const p = allProperties[i];
    const owner = owners[i % owners.length];
    const images = IMG[p.propertyType] || IMG.APARTMENT;

    await prisma.property.create({
      data: {
        ownerId: owner.id,
        title: p.title, description: p.description,
        city: p.city, area: p.area, address: p.address,
        rent: p.rent, deposit: p.deposit,
        bedrooms: p.bedrooms, bathrooms: p.bathrooms,
        furnished: p.furnished, propertyType: p.propertyType,
        floorArea: p.floorArea, amenities: p.amenities,
        images, status: p.status,
        viewCount: Math.floor(Math.random() * 200)
      }
    });
  }

  console.log(`  🏠 Created ${allProperties.length} properties`);
  console.log('✨ Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
