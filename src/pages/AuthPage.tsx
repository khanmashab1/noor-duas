import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const AuthPage = () => {
  const { t } = useI18n();
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'forgot') {
      const { error } = await resetPassword(email);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Email sent', description: 'Check your inbox for password reset link.' });
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      const { error } = await signUp(email, password, name);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Success', description: 'Please check your email to verify your account.' });
    } else {
      const { error } = await signIn(email, password);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <span className="mb-2 text-4xl">🌙</span>
            <CardTitle className="font-display text-2xl">
              {mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('resetPassword')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <Label htmlFor="name">{t('name')}</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              )}
              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {mode !== 'forgot' && (
                <div>
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('loading') : mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('resetPassword')}
              </Button>
            </form>

            <div className="mt-4 space-y-2 text-center text-sm">
              {mode === 'login' && (
                <>
                  <button onClick={() => setMode('forgot')} className="text-primary hover:underline">{t('forgotPassword')}</button>
                  <p className="text-muted-foreground">
                    Don't have an account?{' '}
                    <button onClick={() => setMode('register')} className="text-primary hover:underline">{t('register')}</button>
                  </p>
                </>
              )}
              {mode === 'register' && (
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-primary hover:underline">{t('login')}</button>
                </p>
              )}
              {mode === 'forgot' && (
                <button onClick={() => setMode('login')} className="text-primary hover:underline">← Back to login</button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
