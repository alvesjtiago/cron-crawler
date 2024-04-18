import { NextResponse } from 'next/server'
import { check } from 'linkinator'

export async function GET(request: Request) {
  const results = await check({
    path: process.env.URLS?.split(',').map((link) => link.trim()) as string[],
    recurse: true,
  })

  const brokenLinks = results.links.filter(
    (x) => x.state === 'BROKEN' && x.status == 404,
  )
  console.log(`Detected ${brokenLinks.length} broken links.`)
  console.log(`Broken links: ${brokenLinks.map((link) => link.url).join(', ')}`)

  if (!results.passed) {
    console.log('Send to Zapier')
  }

  return NextResponse.json({
    success: true,
    message: `Passed: ${brokenLinks.length == 0}`,
  })
}
