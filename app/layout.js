import localFont from 'next/font/local'
import "./globals.css";
import Menu from "@/components/menu";
import BreadcrumbMain from '@/components/breadcrumb';

const myfont = localFont({
  src: [
    {
      path: '../public/fonts/SFMonoRegular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SFMonoBold.woff',
      weight: '700',
      style: 'normal',
    },
  ]
})

export const metadata = {
  title: "FzDown",
  description: "Download movies from tvseries.in and fzmovies.live",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${myfont.className} text-xs antialiased dark`}
      >
        <Menu />
        <BreadcrumbMain />
        {children}
        
      </body>
    </html>
  );
}