import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { useCategories, useAllDuas } from '@/hooks/useDuas';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const AdminPage = () => {
  const { t } = useI18n();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: categories } = useCategories();
  const { data: allDuas } = useAllDuas();
  const queryClient = useQueryClient();

  const [editingDua, setEditingDua] = useState<string | null>(null);
  const [form, setForm] = useState({
    category_id: '',
    arabic_text: '',
    english_translation: '',
    urdu_translation: '',
    reference: '',
    explanation: '',
    benefits: '',
  });

  if (authLoading) return <div className="container py-20 text-center text-muted-foreground">{t('loading')}</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  const resetForm = () => {
    setForm({ category_id: '', arabic_text: '', english_translation: '', urdu_translation: '', reference: '', explanation: '', benefits: '' });
    setEditingDua(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDua) {
      const { error } = await supabase.from('duas').update(form).eq('id', editingDua);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else { toast({ title: 'Updated!' }); resetForm(); }
    } else {
      const { error } = await supabase.from('duas').insert(form);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else { toast({ title: 'Added!' }); resetForm(); }
    }
    queryClient.invalidateQueries({ queryKey: ['all-duas'] });
  };

  const handleEdit = (dua: any) => {
    setEditingDua(dua.id);
    setForm({
      category_id: dua.category_id,
      arabic_text: dua.arabic_text,
      english_translation: dua.english_translation || '',
      urdu_translation: dua.urdu_translation || '',
      reference: dua.reference || '',
      explanation: dua.explanation || '',
      benefits: dua.benefits || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this dua?')) return;
    const { error } = await supabase.from('duas').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Deleted!' });
    queryClient.invalidateQueries({ queryKey: ['all-duas'] });
  };

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">{t('admin')}</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingDua ? 'Edit Dua' : 'Add New Dua'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Arabic Text</Label>
                <Textarea value={form.arabic_text} onChange={(e) => setForm({ ...form, arabic_text: e.target.value })} dir="rtl" className="font-arabic" required />
              </div>
              <div>
                <Label>English Translation</Label>
                <Textarea value={form.english_translation} onChange={(e) => setForm({ ...form, english_translation: e.target.value })} />
              </div>
              <div>
                <Label>Urdu Translation</Label>
                <Textarea value={form.urdu_translation} onChange={(e) => setForm({ ...form, urdu_translation: e.target.value })} dir="rtl" className="font-urdu" />
              </div>
              <div>
                <Label>Reference</Label>
                <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
              </div>
              <div>
                <Label>Explanation</Label>
                <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
              </div>
              <div>
                <Label>Benefits</Label>
                <Textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{editingDua ? 'Update' : 'Add'} Dua</Button>
                {editingDua && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Duas ({allDuas?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] space-y-2 overflow-y-auto">
              {allDuas?.map((dua) => (
                <div key={dua.id} className="flex items-start gap-2 rounded-lg border border-border p-3">
                  <p className="flex-1 truncate font-arabic text-sm" dir="rtl">{dua.arabic_text}</p>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(dua)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(dua.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
