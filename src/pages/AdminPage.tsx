import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { useCategories, useAllDuas } from '@/hooks/useDuas';
import { useIslamicBooks } from '@/hooks/useIslamicBooks';
import { useBookChapters } from '@/hooks/useBookChapters';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, BookOpen } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const AdminPage = () => {
  const { t } = useI18n();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: categories } = useCategories();
  const { data: allDuas } = useAllDuas();
  const { data: books } = useIslamicBooks();
  const queryClient = useQueryClient();

  // Dua form state
  const [editingDua, setEditingDua] = useState<string | null>(null);
  const [form, setForm] = useState({
    category_id: '', arabic_text: '', english_translation: '', urdu_translation: '', reference: '', explanation: '', benefits: '',
  });

  // Book form state
  const [bookForm, setBookForm] = useState({
    title: '', title_ar: '', title_ur: '', author: '', author_ar: '', author_ur: '',
    description: '', description_ar: '', description_ur: '', category: 'general',
    content: '', content_ar: '', content_ur: '',
  });
  const [editingBook, setEditingBook] = useState<string | null>(null);

  // Chapter form state
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const { data: chapters } = useBookChapters(selectedBookId || undefined);
  const [chapterForm, setChapterForm] = useState({
    chapter_number: 1, chapter_title: '', chapter_title_ar: '', chapter_title_ur: '',
    content: '', content_ar: '', content_ur: '',
  });
  const [editingChapter, setEditingChapter] = useState<string | null>(null);

  if (authLoading) return <div className="container py-20 text-center text-muted-foreground">{t('loading')}</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  // Dua handlers
  const resetForm = () => { setForm({ category_id: '', arabic_text: '', english_translation: '', urdu_translation: '', reference: '', explanation: '', benefits: '' }); setEditingDua(null); };

  const handleDuaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const op = editingDua
      ? supabase.from('duas').update(form).eq('id', editingDua)
      : supabase.from('duas').insert(form);
    const { error } = await op;
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: editingDua ? 'Updated!' : 'Added!' }); resetForm(); }
    queryClient.invalidateQueries({ queryKey: ['all-duas'] });
  };

  const handleEditDua = (dua: any) => {
    setEditingDua(dua.id);
    setForm({ category_id: dua.category_id, arabic_text: dua.arabic_text, english_translation: dua.english_translation || '', urdu_translation: dua.urdu_translation || '', reference: dua.reference || '', explanation: dua.explanation || '', benefits: dua.benefits || '' });
  };

  const handleDeleteDua = async (id: string) => {
    if (!confirm('Delete this dua?')) return;
    await supabase.from('duas').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['all-duas'] });
    toast({ title: 'Deleted!' });
  };

  // Book handlers
  const resetBookForm = () => { setBookForm({ title: '', title_ar: '', title_ur: '', author: '', author_ar: '', author_ur: '', description: '', description_ar: '', description_ur: '', category: 'general', content: '', content_ar: '', content_ur: '' }); setEditingBook(null); };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...bookForm };
    const op = editingBook
      ? supabase.from('islamic_books' as any).update(payload).eq('id', editingBook)
      : supabase.from('islamic_books' as any).insert(payload);
    const { error } = await op;
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: editingBook ? 'Book Updated!' : 'Book Added!' }); resetBookForm(); }
    queryClient.invalidateQueries({ queryKey: ['islamic-books'] });
  };

  const handleEditBook = (book: any) => {
    setEditingBook(book.id);
    setBookForm({
      title: book.title, title_ar: book.title_ar || '', title_ur: book.title_ur || '',
      author: book.author || '', author_ar: book.author_ar || '', author_ur: book.author_ur || '',
      description: book.description || '', description_ar: book.description_ar || '', description_ur: book.description_ur || '',
      category: book.category || 'general',
      content: book.content || '', content_ar: book.content_ar || '', content_ur: book.content_ur || '',
    });
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Delete this book and all its chapters?')) return;
    await supabase.from('islamic_books' as any).delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['islamic-books'] });
    toast({ title: 'Deleted!' });
  };

  // Chapter handlers
  const resetChapterForm = () => { setChapterForm({ chapter_number: 1, chapter_title: '', chapter_title_ar: '', chapter_title_ur: '', content: '', content_ar: '', content_ur: '' }); setEditingChapter(null); };

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) { toast({ title: 'Select a book first', variant: 'destructive' }); return; }
    const payload = { ...chapterForm, book_id: selectedBookId };
    const op = editingChapter
      ? supabase.from('book_chapters' as any).update(payload).eq('id', editingChapter)
      : supabase.from('book_chapters' as any).insert(payload);
    const { error } = await op;
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: editingChapter ? 'Chapter Updated!' : 'Chapter Added!' }); resetChapterForm(); }
    queryClient.invalidateQueries({ queryKey: ['book-chapters', selectedBookId] });
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('Delete this chapter?')) return;
    await supabase.from('book_chapters' as any).delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['book-chapters', selectedBookId] });
    toast({ title: 'Deleted!' });
  };

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="mb-6 font-display text-2xl sm:text-3xl font-bold text-foreground">{t('admin')}</h1>

      <Tabs defaultValue="duas">
        <TabsList className="mb-6">
          <TabsTrigger value="duas">Duas</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
        </TabsList>

        {/* DUAS TAB */}
        <TabsContent value="duas">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />{editingDua ? 'Edit Dua' : 'Add New Dua'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleDuaSubmit} className="space-y-4">
                  <div><Label>Category</Label><Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Arabic Text</Label><Textarea value={form.arabic_text} onChange={e => setForm({ ...form, arabic_text: e.target.value })} dir="rtl" className="font-arabic" required /></div>
                  <div><Label>English Translation</Label><Textarea value={form.english_translation} onChange={e => setForm({ ...form, english_translation: e.target.value })} /></div>
                  <div><Label>Urdu Translation</Label><Textarea value={form.urdu_translation} onChange={e => setForm({ ...form, urdu_translation: e.target.value })} dir="rtl" /></div>
                  <div><Label>Reference</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
                  <div><Label>Explanation</Label><Textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} /></div>
                  <div><Label>Benefits</Label><Textarea value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} /></div>
                  <div className="flex gap-2"><Button type="submit" className="flex-1">{editingDua ? 'Update' : 'Add'} Dua</Button>{editingDua && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}</div>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Existing Duas ({allDuas?.length ?? 0})</CardTitle></CardHeader>
              <CardContent>
                <div className="max-h-[600px] space-y-2 overflow-y-auto">
                  {allDuas?.map(dua => (
                    <div key={dua.id} className="flex items-start gap-2 rounded-lg border border-border p-2">
                      <p className="flex-1 truncate font-arabic text-xs" dir="rtl">{dua.arabic_text}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleEditDua(dua)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => handleDeleteDua(dua.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BOOKS TAB */}
        <TabsContent value="books">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />{editingBook ? 'Edit Book' : 'Add New Book'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleBookSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Title (English)</Label><Input value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required /></div>
                    <div><Label>Category</Label><Select value={bookForm.category} onValueChange={v => setBookForm({ ...bookForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(categoryLabels).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div><Label>Title (Arabic)</Label><Input value={bookForm.title_ar} onChange={e => setBookForm({ ...bookForm, title_ar: e.target.value })} dir="rtl" className="font-arabic" /></div>
                  <div><Label>Title (Urdu)</Label><Input value={bookForm.title_ur} onChange={e => setBookForm({ ...bookForm, title_ur: e.target.value })} dir="rtl" /></div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div><Label>Author (EN)</Label><Input value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} /></div>
                    <div><Label>Author (AR)</Label><Input value={bookForm.author_ar} onChange={e => setBookForm({ ...bookForm, author_ar: e.target.value })} dir="rtl" /></div>
                    <div><Label>Author (UR)</Label><Input value={bookForm.author_ur} onChange={e => setBookForm({ ...bookForm, author_ur: e.target.value })} dir="rtl" /></div>
                  </div>
                  <div><Label>Description (EN)</Label><Textarea value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })} /></div>
                  <div><Label>Description (AR)</Label><Textarea value={bookForm.description_ar} onChange={e => setBookForm({ ...bookForm, description_ar: e.target.value })} dir="rtl" className="font-arabic" /></div>
                  <div><Label>Description (UR)</Label><Textarea value={bookForm.description_ur} onChange={e => setBookForm({ ...bookForm, description_ur: e.target.value })} dir="rtl" /></div>
                  <div><Label>Content (EN)</Label><Textarea value={bookForm.content} onChange={e => setBookForm({ ...bookForm, content: e.target.value })} rows={6} /></div>
                  <div><Label>Content (AR)</Label><Textarea value={bookForm.content_ar} onChange={e => setBookForm({ ...bookForm, content_ar: e.target.value })} dir="rtl" className="font-arabic" rows={6} /></div>
                  <div><Label>Content (UR)</Label><Textarea value={bookForm.content_ur} onChange={e => setBookForm({ ...bookForm, content_ur: e.target.value })} dir="rtl" rows={6} /></div>
                  <div className="flex gap-2"><Button type="submit" className="flex-1">{editingBook ? 'Update' : 'Add'} Book</Button>{editingBook && <Button type="button" variant="outline" onClick={resetBookForm}>Cancel</Button>}</div>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Books ({books?.length ?? 0})</CardTitle></CardHeader>
              <CardContent>
                <div className="max-h-[600px] space-y-2 overflow-y-auto">
                  {books?.map(book => (
                    <div key={book.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.category}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleEditBook(book)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => handleDeleteBook(book.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CHAPTERS TAB */}
        <TabsContent value="chapters">
          <div className="mb-4">
            <Label>Select Book</Label>
            <Select value={selectedBookId} onValueChange={setSelectedBookId}>
              <SelectTrigger className="max-w-md"><SelectValue placeholder="Choose a book..." /></SelectTrigger>
              <SelectContent>{books?.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {selectedBookId && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />{editingChapter ? 'Edit Chapter' : 'Add Chapter'}</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleChapterSubmit} className="space-y-4">
                    <div><Label>Chapter Number</Label><Input type="number" min={1} value={chapterForm.chapter_number} onChange={e => setChapterForm({ ...chapterForm, chapter_number: parseInt(e.target.value) || 1 })} /></div>
                    <div><Label>Title (EN)</Label><Input value={chapterForm.chapter_title} onChange={e => setChapterForm({ ...chapterForm, chapter_title: e.target.value })} required /></div>
                    <div><Label>Title (AR)</Label><Input value={chapterForm.chapter_title_ar} onChange={e => setChapterForm({ ...chapterForm, chapter_title_ar: e.target.value })} dir="rtl" className="font-arabic" /></div>
                    <div><Label>Title (UR)</Label><Input value={chapterForm.chapter_title_ur} onChange={e => setChapterForm({ ...chapterForm, chapter_title_ur: e.target.value })} dir="rtl" /></div>
                    <div><Label>Content (EN)</Label><Textarea value={chapterForm.content} onChange={e => setChapterForm({ ...chapterForm, content: e.target.value })} rows={8} /></div>
                    <div><Label>Content (AR)</Label><Textarea value={chapterForm.content_ar} onChange={e => setChapterForm({ ...chapterForm, content_ar: e.target.value })} dir="rtl" className="font-arabic" rows={8} /></div>
                    <div><Label>Content (UR)</Label><Textarea value={chapterForm.content_ur} onChange={e => setChapterForm({ ...chapterForm, content_ur: e.target.value })} dir="rtl" rows={8} /></div>
                    <div className="flex gap-2"><Button type="submit" className="flex-1">{editingChapter ? 'Update' : 'Add'} Chapter</Button>{editingChapter && <Button type="button" variant="outline" onClick={resetChapterForm}>Cancel</Button>}</div>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Chapters ({chapters?.length ?? 0})</CardTitle></CardHeader>
                <CardContent>
                  <div className="max-h-[600px] space-y-2 overflow-y-auto">
                    {chapters?.map(ch => (
                      <div key={ch.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">Ch {ch.chapter_number}: {ch.chapter_title}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setEditingChapter(ch.id); setChapterForm({ chapter_number: ch.chapter_number, chapter_title: ch.chapter_title, chapter_title_ar: ch.chapter_title_ar || '', chapter_title_ur: ch.chapter_title_ur || '', content: ch.content, content_ar: ch.content_ar || '', content_ur: ch.content_ur || '' }); }}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => handleDeleteChapter(ch.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const categoryLabels: Record<string, string> = {
  hadith: 'Hadith', dua: 'Duas', fiqh: 'Fiqh', tafsir: 'Tafsir', seerah: 'Seerah', general: 'General',
};

export default AdminPage;
