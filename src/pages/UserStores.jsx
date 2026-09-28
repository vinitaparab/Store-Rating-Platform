import { useEffect, useState } from 'react';
import { api, nextSort, toQuery } from '../api.js';
import DataTable from '../components/DataTable.jsx';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const [draft, setDraft] = useState({});
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    api(`/stores?${toQuery({ ...filters, sortBy: sort.by, order: sort.order })}`)
      .then((data) => {
        if (active) setStores(data);
      })
      .catch((err) => setError(err.message));
    return () => {
      active = false;
    };
  }, [filters, sort, refresh]);

  const submitRating = async (store) => {
    const value = draft[store.id] || store.userRating;
    if (!value) {
      setError('Please choose a rating between 1 and 5.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api(`/stores/${store.id}/rating`, { method: 'PUT', body: { rating: Number(value) } });
      setSuccess(`Rating saved for ${store.name}.`);
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Overall Rating', sortable: true, render: (s) => (s.avgRating === null ? 'No ratings' : s.avgRating) },
    { key: 'userRating', label: 'Your Rating', sortable: true, render: (s) => (s.userRating === null ? 'Not rated' : s.userRating) },
    {
      key: 'action',
      label: 'Rate',
      render: (s) => (
        <div className="inline">
          <select value={draft[s.id] || s.userRating || ''} onChange={(e) => setDraft({ ...draft, [s.id]: e.target.value })}>
            <option value="">Select</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <button type="button" onClick={() => submitRating(s)}>
            {s.userRating === null ? 'Submit' : 'Modify'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="card">
      <h2>Registered Stores</h2>
      <div className="filters">
        <input placeholder="Search by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Search by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
      </div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <DataTable columns={columns} rows={stores} sort={sort} onSort={(key) => setSort(nextSort(sort, key))} />
    </div>
  );
}
