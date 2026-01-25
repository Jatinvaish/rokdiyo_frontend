import React from "react";
// import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import GoogleAnalyticsInit from "@/lib/ga";
import { fontVariables } from "@/lib/fonts";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { ActiveThemeProvider } from "@/components/active-theme";
import { DEFAULT_THEME } from "@/lib/themes";
import { Toaster } from "@/components/ui/sonner";

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ---------------- Root Layout Logic ----------------
  // const cookieStore = await cookies();

  const themeSettings = {
    preset: DEFAULT_THEME.preset,
    scale: DEFAULT_THEME.scale,
    radius:  DEFAULT_THEME.radius,
    contentLayout:DEFAULT_THEME.contentLayout
  };

  const bodyAttributes = Object.fromEntries(
    Object.entries(themeSettings)
      .filter(([_, value]) => value)
      .map(([key, value]) => [
        `data-theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
        value
      ])
  );

  // ---------------- Sidebar Logic ----------------

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn("bg-background group/layout font-sans", fontVariables)}
        {...bodyAttributes}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange>
          <ActiveThemeProvider initialTheme={themeSettings}>
            {children}

            <Toaster position="top-center" richColors />

            <NextTopLoader
              color="var(--primary)"
              showSpinner={false}
              height={2}
              shadow-sm="none"
            />

            {/* {process.env.NODE_ENV === "production" ? <GoogleAnalyticsInit /> : null} */}
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}     