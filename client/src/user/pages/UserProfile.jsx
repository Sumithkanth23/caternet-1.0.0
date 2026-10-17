import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Pencil, Phone, Save, UserRound } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { TAMIL_NADU_DISTRICTS } from '../../data/employeeData';
import { getImageUploadError } from '../../shared/utils/imageUpload';

const empty = { name: '', phone: '', district: '', address: '', profileImageUrl: '' };

export default function UserProfile({ creation = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(creation);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch('/api/user/me').then((data) => {
      setForm({ ...empty, ...data });
      if (creation && data.phone && data.district) navigate('/user/dashboard', { replace: true });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [creation, navigate]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^[0-9]{10}$/.test(form.phone) || !form.district) {
      setError('Add your name, a 10-digit phone number, and district before saving.'); return;
    }
    setError('');
    const body = file ? new FormData() : JSON.stringify({ name: form.name.trim(), phone: form.phone, district: form.district, address: form.address });
    if (file) { body.append('name', form.name.trim()); body.append('phone', form.phone); body.append('district', form.district); body.append('address', form.address); body.append('profileImage', file); }
    try {
      const data = await apiFetch('/api/user/profile', { method: 'PATCH', body });
      setForm({ ...empty, ...data }); setEditing(false); setMessage('Your profile is up to date.');
      if (creation) navigate('/user/dashboard');
    } catch (err) { setError(err.message); }
  };

  return <div className="min-h-screen bg-gray-50 flex flex-col"><Navbar /><main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
    {loading ? <div className="ui-loading">Loading your profile…</div> : <form onSubmit={save} className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4 min-w-0">
        {form.profileImageUrl ? <img src={toAbsoluteUrl(form.profileImageUrl)} className="h-16 w-16 shrink-0 rounded-2xl border border-blue-100 object-cover" alt="Profile" /> : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700"><UserRound size={28} /></div>}
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Customer account</p><h1 className="truncate text-2xl font-bold text-gray-800">{form.name || 'My Profile'}</h1><p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={15} /> {form.district || 'Add your district'}</p></div>
      </div>{!editing && <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"><Pencil size={17} /> Edit Profile</button>}</div><p className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-500">Your saved details make booking requests faster and easier to manage.</p></section>
      {error && <p className="ui-alert" role="alert">{error}</p>}{message && <p className="ui-alert" role="status">{message}</p>}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-bold text-gray-800">Personal details</h2><p className="text-sm text-gray-500">Information visible with your booking request.</p></div>{editing && <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"><Camera size={16} /> Photo<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const nextFile = event.target.files?.[0]; const imageError = getImageUploadError(nextFile); if (imageError) { setError(imageError); event.target.value = ''; return; } setError(''); setFile(nextFile); }} /></label>}</div>
        <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium text-gray-700">Full name *<input disabled={!editing} value={form.name} onChange={update('name')} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 disabled:bg-gray-50" /></label><label className="text-sm font-medium text-gray-700">Phone number *<span className="relative mt-1.5 flex"><Phone size={16} className="absolute left-3 top-3.5 text-gray-400" /><input disabled={!editing} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))} className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-3 disabled:bg-gray-50" /></span></label><label className="text-sm font-medium text-gray-700">District *<select disabled={!editing} value={form.district} onChange={update('district')} className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 disabled:bg-gray-50"><option value="">Select district</option>{TAMIL_NADU_DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select></label><label className="text-sm font-medium text-gray-700">Address<textarea disabled={!editing} value={form.address} onChange={update('address')} rows="3" className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 disabled:bg-gray-50" /></label></div>
        {editing && <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5"><button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"><Save size={17} /> Save changes</button></div>}
      </section>
    </form>}
  </main><Footer /></div>;
}
