import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  const { t } = useI18n();
  const { user, loading, signOut } = useAuth();

  if (loading) return <div className="container py-20 text-center text-muted-foreground">{t('loading')}</div>;
  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
            👤
          </div>
          <CardTitle className="font-display">{t('profile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </p>
          <Button variant="outline" className="w-full" onClick={signOut}>{t('logout')}</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
