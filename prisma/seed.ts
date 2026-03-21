import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const password = await bcrypt.hash('demo1234', 10)

  // Cafe Piccolo — Pro
  const shop = await prisma.shop.upsert({
    where: { email: 'cafe@piccolo.com' },
    update: {},
    create: {
      name: 'Cafe Piccolo',
      email: 'cafe@piccolo.com',
      password,
      address: 'Thamel, Kathmandu',
      phone: '9801234567',
      stampGoal: 7,
      reward: '1 free coffee',
      plan: 'pro',
      freeLimit: 50,
      stampLogo: '☕',
      themeColor: '#e8a24b',
    }
  })
  console.log('✓ Cafe Piccolo created')

  // Binod Cafe — Basic
  const shop2 = await prisma.shop.upsert({
    where: { email: 'binod@cafe.com' },
    update: {},
    create: {
      name: 'Binod Cafe',
      email: 'binod@cafe.com',
      password,
      address: 'Pokhara, Lakeside',
      phone: '9807654321',
      stampGoal: 5,
      reward: '1 free momo',
      plan: 'basic',
      freeLimit: 50,
      stampLogo: '🍵',
      themeColor: '#3b82f6',
    }
  })
  console.log('✓ Binod Cafe created')

  // Demo customers
  const customers = [
    { phone: '9841000001', name: 'Aarav Sharma' },
    { phone: '9841000002', name: 'Sita Thapa' },
    { phone: '9841000003', name: 'Binod Gurung' },
    { phone: '9841000004', name: 'Priya Karki' },
    { phone: '9841000005', name: 'Raj Shrestha' },
  ]

  for (const c of customers) {
    const customer = await prisma.customer.upsert({
      where: { phone_shopId: { phone: c.phone, shopId: shop.id } },
      update: {},
      create: { phone: c.phone, name: c.name, shopId: shop.id }
    })
    // Add some stamps
    const count = Math.floor(Math.random() * 7) + 1
    for (let i = 0; i < count; i++) {
      await prisma.stamp.create({ data: { shopId: shop.id, customerId: customer.id } })
    }
  }
  console.log('✓ Demo customers + stamps created')

  // Demo offers
  await prisma.offer.deleteMany({ where: { shopId: shop.id } })
  await prisma.offer.createMany({
    data: [
      { shopId: shop.id, title: 'Buy 1 Get 1 Coffee', description: 'Valid on weekdays only', emoji: '☕', active: true },
      { shopId: shop.id, title: '20% off all pastries', description: 'Every Saturday morning', emoji: '🥐', active: true },
    ]
  })
  console.log('✓ Demo offers created')

  // Demo menu items
  const menuItems = [
    { name: 'Espresso',    price: 150, category: 'Coffee',      imageEmoji: '☕', description: 'Strong single shot' },
    { name: 'Cappuccino',  price: 250, category: 'Coffee',      imageEmoji: '☕', description: 'Espresso with steamed milk foam' },
    { name: 'Latte',       price: 280, category: 'Coffee',      imageEmoji: '☕', description: 'Smooth espresso with steamed milk' },
    { name: 'Cold Brew',   price: 320, category: 'Cold Drinks', imageEmoji: '🧋', description: '12-hour brewed cold coffee' },
    { name: 'Green Tea',   price: 180, category: 'Tea',         imageEmoji: '🍵', description: 'Premium Japanese green tea' },
    { name: 'Croissant',   price: 200, category: 'Food',        imageEmoji: '🥐', description: 'Freshly baked butter croissant' },
    { name: 'Cheesecake',  price: 350, category: 'Desserts',    imageEmoji: '🍰', description: 'New York style cheesecake' },
  ]
  for (const item of menuItems) {
    await prisma.menuItem.create({ data: { ...item, shopId: shop.id } }).catch(() => {})
  }
  console.log('✓ Demo menu items created')

  console.log('\n✅ Seed complete!')
  console.log('\nDemo accounts:')
  console.log('  cafe@piccolo.com / demo1234  (Pro)')
  console.log('  binod@cafe.com   / demo1234  (Basic)')
  console.log('\nAdmin: /admin  PIN: brewpass2024')
}

main().catch(console.error).finally(() => prisma.$disconnect())
