import { createApp, addAppFeatures, addAppTags, updateAppStatus, updateAppVerified } from '../lib/db'
import { sampleApps } from '../data/sample-apps'

async function seed() {
  console.log('🌱 Seeding database...')

  for (const app of sampleApps) {
    console.log(`  Adding: ${app.name}`)
    
    const appId = await createApp({
      name: app.name,
      description: app.description,
      long_description: app.longDescription,
      category: app.category,
      price: app.price,
      currency: app.currency,
      version: app.version,
      status: 'published', // 샘플 앱은 모두 판매 중
      file_hash: `sample_${app.id}_hash`,
      file_path: `/uploads/sample_${app.id}.zip`,
      api_access: app.apiAccess,
      developer_name: app.developer.name,
      developer_verified: app.developer.verified,
    })

    await addAppFeatures(appId, app.features)
    await addAppTags(appId, app.tags)
    
    if (app.verified) {
      await updateAppVerified(appId, true)
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`   Added ${sampleApps.length} sample apps`)
}

seed().catch(console.error)
