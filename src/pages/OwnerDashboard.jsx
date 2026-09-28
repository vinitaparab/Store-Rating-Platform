import { useEffect, useState } from 'react';
import { api, nextSort, toQuery } from '../api.js';
import DataTable from '../components/DataTable.jsx';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [sort, setSort] = useState({ by: 'date', order: 'desc' });
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api(`/owner/dashboard?${toQuery({ sortBy: sort.by, order: sort.order })}`)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => setError(err.message));
    return () => {
      active = false;
    };
  }, [sort]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading...</p>;
  if (!data.store) return <div className="card"><p>No store is assigned to your account yet. Please contact the administrator.</p></div>;

  const columns = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true },
    { key: 'date', label: 'Submitted On', sortable: true, render: (r) => new Date(r.date).toLocaleString() },
  ];

  return (
    <div className="card">
      <h2>{data.store.name}</h2>
      <p>{data.store.address}</p>
      <div className="stats">
        <div className="stat"><span>Average Rating</span><strong>{data.store.avgRating === null ? 'No ratings yet' : data.store.avgRating}</strong></div>
        <div className="stat"><span>Total Ratings</span><strong>{data.raters.length}</strong></div>
      </div>
      <h3>Users who rated your store</h3>
      <DataTable columns={columns} rows={data.raters} sort={sort} onSort={(key) => setSort(nextSort(sort, key))} />
    </div>
  );
}
