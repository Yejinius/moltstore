import { getAllApps, createReview, createVersion, recordDownload } from '../lib/db'

async function seedReviews() {
  console.log('🌱 Seeding reviews and stats...')

  const apps = await getAllApps('published')

  if (apps.length === 0) {
    console.log('⚠️  No published apps found. Run npm run seed first.')
    process.exit(1)
  }

  // 각 앱에 리뷰 추가
  for (const app of apps) {
    console.log(`  Adding reviews for: ${app.name}`)
    
    // 3-5개의 랜덤 리뷰 추가
    const reviewCount = Math.floor(Math.random() * 3) + 3
    
    for (let i = 0; i < reviewCount; i++) {
      const rating = Math.floor(Math.random() * 2) + 4 // 4-5점 위주
      const reviewTemplates = [
        { title: 'Great app!', comment: 'Very useful and easy to use.' },
        { title: 'Highly recommended', comment: 'Solved my problem perfectly.' },
        { title: 'Excellent tool', comment: 'Worth every penny. Great support too.' },
        { title: 'Love it', comment: 'Simple and powerful. Exactly what I needed.' },
        { title: 'Amazing', comment: 'Best app in its category.' },
      ]
      
      const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)]
      
      await createReview({
        app_id: app.id,
        user_name: `User ${i + 1}`,
        user_email: `user${i + 1}@example.com`,
        rating,
        title: template.title,
        comment: template.comment,
      })
    }
    
    // 버전 이력 추가
    console.log(`  Adding version history for: ${app.name}`)
    await createVersion({
      app_id: app.id,
      version: app.version,
      release_notes: 'Initial release',
      file_hash: app.file_hash,
      file_path: app.file_path,
    })
    
    // 다운로드 기록 추가 (랜덤)
    const downloadCount = Math.floor(Math.random() * 50) + 10
    console.log(`  Adding ${downloadCount} downloads for: ${app.name}`)
    
    for (let i = 0; i < downloadCount; i++) {
      await recordDownload(app.id, `user${i}@example.com`)
    }
  }

  console.log('✅ Reviews and stats seeded successfully!')
}

seedReviews().catch(console.error)
