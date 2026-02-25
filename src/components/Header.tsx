import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, Heart, User, LogOut, Shield, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n, Language } from '@/lib/i18n';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useSearchDuas } from '@/hooks/useDuas';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: searchResults } = useSearchDuas(searchQuery);

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/categories', label: t('categories') },
    { to: '/hadith', label: t('hadith') },
    { to: '/tasbeeh', label: t('tasbeeh') },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="text-2xl">🌙</span>
          <span className="font-display text-lg sm:text-xl font-bold text-primary">{t('appName')}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
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

        {/* Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-xs hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => searchQuery.length > 2 && setSearchOpen(true)}
            className="pl-9 rtl:pr-9 rtl:pl-3 h-9 text-sm"
          />
          {searchOpen && searchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg z-50">
              {searchResults.slice(0, 8).map((dua) => (
                <button
                  key={dua.id}
                  onClick={() => { navigate(`/dua/${dua.id}`); setSearchOpen(false); setSearchQuery(''); }}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                >
                  <p className="font-arabic text-sm truncate" dir="rtl">{dua.arabic_text.slice(0, 80)}...</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{dua.english_translation?.slice(0, 80)}</p>
                  {dua.reference && <span className="text-xs text-accent-foreground">📖 {dua.reference}</span>}
                </button>
              ))}
            </div>
          )}
          {searchOpen && searchQuery.length > 2 && searchResults?.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover p-4 shadow-lg text-center text-sm text-muted-foreground">
              {t('noResults')}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Mobile Search Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-4 w-4" />
          </Button>

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
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div ref={searchRef} className="border-t border-border bg-background p-3 md:hidden relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rtl:pr-9 rtl:pl-3"
              autoFocus
            />
          </div>
          {searchQuery.length > 2 && searchResults && searchResults.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
              {searchResults.slice(0, 6).map((dua) => (
                <button
                  key={dua.id}
                  onClick={() => { navigate(`/dua/${dua.id}`); setSearchOpen(false); setSearchQuery(''); }}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                >
                  <p className="font-arabic text-sm truncate" dir="rtl">{dua.arabic_text.slice(0, 60)}...</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{dua.english_translation?.slice(0, 60)}</p>
                </button>
              ))}
            </div>
          )}
          {searchQuery.length > 2 && searchResults?.length === 0 && (
            <p className="mt-2 text-center text-sm text-muted-foreground">{t('noResults')}</p>
          )}
        </div>
      )}

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background p-4 lg:hidden">
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
