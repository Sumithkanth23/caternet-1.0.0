import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function NotificationMenu({ path, linkTo, emptyText = 'You are all caught up.', title = 'Updates', itemLabel, statuses = ['Pending'] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!path) return undefined;
    let active = true;
    const load = () => apiFetch(path).then((data) => { if (active) setItems(Array.isArray(data) ? data : []); }).catch(() => { if (active) setItems([]); });
    load();
    const timer = window.setInterval(load, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [path]);
  useEffect(() => {
    const close = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close);
  }, []);

  const pending = items.filter((item) => statuses.includes(item.status)).slice(0, 4);
  return <div ref={menuRef} className="relative"><button type="button" onClick={() => setOpen((value) => !value)} className="relative grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-700" aria-label="Open notifications" aria-expanded={open}><Bell size={19} />{pending.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">{pending.length}</span>}</button>{open && <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-50"><div className="px-3 py-2 text-sm font-semibold text-gray-800">{title}</div>{pending.length ? pending.map((item) => <Link key={item._id} to={linkTo} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-blue-50"><p className="truncate text-sm font-medium text-gray-800">{itemLabel(item)}</p><p className="text-xs text-blue-700">Needs your attention</p></Link>) : <p className="px-3 py-4 text-sm text-gray-500">{emptyText}</p>}<Link to={linkTo} onClick={() => setOpen(false)} className="mt-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">View all <ChevronRight size={16} /></Link></div>}</div>;
}
