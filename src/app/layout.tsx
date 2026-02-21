import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ThockForge - 次世代客制化键盘模拟器',
  description: '高保真 3D 视觉 + 物理级声学模拟的网页端客制化键盘组装与模拟平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
