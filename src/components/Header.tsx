import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Heart, User, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n, Language } from '@/lib/i18n';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const langLabels: Record<Language, string> = { en: 'EN', ar: 'عربي', ur: 'اردو' };

export const Header = () => {
  const { lang, setLang, t } = useI18n();
  const { isDark, toggle } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/categories', label: t('categories') },
    { to: '/tasbeeh', label: t('tasbeeh') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌙</span>
          <span className="font-display text-xl font-bold text-primary">{t('appName')}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                isActive(link.to) ? 'bg-primary/10 text-primary' : 'text-foreground/70'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/favorites"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                isActive('/favorites') ? 'bg-primary/10 text-primary' : 'text-foreground/70'
              }`}
            >
              <Heart className="inline h-4 w-4 ltr:mr-1 rtl:ml-1" />
              {t('favorites')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                {langLabels[lang]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(Object.keys(langLabels) as Language[]).map((l) => (
                <DropdownMenuItem key={l} onClick={() => setLang(l)} className={l !== 'en' ? 'font-arabic' : ''}>
                  {langLabels[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile"><User className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t('profile')}</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><Shield className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t('admin')}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">{t('login')}</Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.to) ? 'bg-primary/10 text-primary' : 'text-foreground/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link to="/favorites" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70">
                <Heart className="inline h-4 w-4 ltr:mr-1 rtl:ml-1" />{t('favorites')}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};
