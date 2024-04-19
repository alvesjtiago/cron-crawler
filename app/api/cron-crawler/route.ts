import { NextResponse } from 'next/server'
import { check } from 'linkinator'
import { Resend } from 'resend'

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
    if (process.env.RESEND_API_KEY && process.env.EMAIL_RECEIVER) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: process.env.EMAIL_SENDER ?? 'onboarding@resend.dev',
        to: process.env.EMAIL_RECEIVER ?? '',
        subject: 'Failed Crawler',
        html: `<p>Detected ${
          brokenLinks.length
        } broken links.</p><p>Broken links: ${brokenLinks
          .map((link) => link.url)
          .join(', ')}</p>`,
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: `Passed: ${brokenLinks.length == 0}`,
  })
}
