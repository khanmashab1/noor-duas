import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InstallPrompt } from "@/components/InstallPrompt";

// Eager load homepage
import Index from "./pages/Index";

// Lazy load all other pages
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const DuaDetailPage = lazy(() => import("./pages/DuaDetailPage"));
const TasbeehPage = lazy(() => import("./pages/TasbeehPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const HadithPage = lazy(() => import("./pages/HadithPage"));
const NamazPage = lazy(() => import("./pages/NamazPage"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const BooksPage = lazy(() => import("./pages/BooksPage"));
const BookReaderPage = lazy(() => import("./pages/BookReaderPage"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <I18nProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/categories/:id" element={<CategoriesPage />} />
                    <Route path="/dua/:id" element={<DuaDetailPage />} />
                    <Route path="/tasbeeh" element={<TasbeehPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/hadith" element={<HadithPage />} />
                    <Route path="/namaz" element={<NamazPage />} />
                    <Route path="/stories" element={<StoriesPage />} />
                    <Route path="/books" element={<BooksPage />} />
                    <Route path="/books/:id" element={<BookReaderPage />} />
                    <Route path="/notifications" element={<NotificationSettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <InstallPrompt />
            </div>
          </I18nProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
