import { useEffect, useState } from 'react';
import { api, nextSort, toQuery } from '../api.js';
import DataTable from '../components/DataTable.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { firstError, validateAddress, validateEmail, validateName, validatePassword } from '../utils/validation.js';

const EMPTY_USER = { name: '', email: '', address: '', password: '', role: 'USER' };
const EMPTY_STORE = { name: '', email: '', address: '', ownerId: '' };

function AddUserForm({ onCreated, onClose }) {
  const [form, setForm] = useState(EMPTY_USER);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const message = firstError({
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    });
    if (message) {
      setError(message);
      return;
    }
    setError('');
    try {
      await api('/admin/users', { method: 'POST', body: form });
      setSuccess('User created successfully.');
      setForm(EMPTY_USER);
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <h3>Add New User</h3>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <label>Name (20-60 characters)
        <input name="name" value={form.name} onChange={handleChange} />
      </label>
      <label>Email
        <input type="email" name="email" value={form.email} onChange={handleChange} />
      </label>
      <label>Address
        <textarea name="address" rows="2" value={form.address} onChange={handleChange} />
      </label>
      <label>Password
        <PasswordInput name="password" value={form.password} onChange={handleChange} />
      </label>
      <label>Role
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="USER">Normal User</option>
          <option value="ADMIN">Admin</option>
          <option value="OWNER">Store Owner</option>
        </select>
      </label>
      <div className="form-actions">
        <button type="submit">Create User</button>
        <button type="button" className="secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

function AddStoreForm({ onCreated, onClose, refreshKey }) {
  const [form, setForm] = useState(EMPTY_STORE);
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api('/admin/users?role=OWNER').then(setOwners).catch(() => setOwners([]));
  }, [refreshKey]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const message = firstError({
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
    });
    if (message) {
      setError(message);
      return;
    }
    setError('');
    try {
      await api('/admin/stores', { method: 'POST', body: form });
      setSuccess('Store created successfully.');
      setForm(EMPTY_STORE);
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <h3>Add New Store</h3>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <label>Store Name (20-60 characters)
        <input name="name" value={form.name} onChange={handleChange} />
      </label>
      <label>Store Email
        <input type="email" name="email" value={form.email} onChange={handleChange} />
      </label>
      <label>Address
        <textarea name="address" rows="2" value={form.address} onChange={handleChange} />
      </label>
      <label>Store Owner (optional)
        <select name="ownerId" value={form.ownerId} onChange={handleChange}>
          <option value="">No owner</option>
          {owners.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
        </select>
      </label>
      <div className="form-actions">
        <button type="submit">Create Store</button>
        <button type="button" className="secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [userSort, setUserSort] = useState({ by: 'name', order: 'asc' });
  const [storeSort, setStoreSort] = useState({ by: 'name', order: 'asc' });
  const [selected, setSelected] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');

  const bump = () => setRefresh((n) => n + 1);

  useEffect(() => {
    api('/admin/stats').then(setStats).catch((err) => setError(err.message));
  }, [refresh]);

  useEffect(() => {
    let active = true;
    api(`/admin/users?${toQuery({ ...userFilters, sortBy: userSort.by, order: userSort.order })}`)
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((err) => setError(err.message));
    return () => {
      active = false;
    };
  }, [userFilters, userSort, refresh]);

  useEffect(() => {
    let active = true;
    api(`/admin/stores?${toQuery({ ...storeFilters, sortBy: storeSort.by, order: storeSort.order })}`)
      .then((data) => {
        if (active) setStores(data);
      })
      .catch((err) => setError(err.message));
    return () => {
      active = false;
    };
  }, [storeFilters, storeSort, refresh]);

  const viewUser = async (id) => {
    try {
      setSelected(await api(`/admin/users/${id}`));
    } catch (err) {
      setError(err.message);
    }
  };

  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'action', label: 'Details', render: (u) => <button type="button" onClick={() => viewUser(u.id)}>View</button> },
  ];

  const storeColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: (s) => (s.avgRating === null ? 'No ratings' : s.avgRating) },
  ];

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <p className="error">{error}</p>}
      <div className="stats">
        <div className="stat"><span>Total Users</span><strong>{stats ? stats.totalUsers : '-'}</strong></div>
        <div className="stat"><span>Total Stores</span><strong>{stats ? stats.totalStores : '-'}</strong></div>
        <div className="stat"><span>Total Ratings</span><strong>{stats ? stats.totalRatings : '-'}</strong></div>
      </div>

      <div className="tabs">
        <button type="button" className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button type="button" className={tab === 'stores' ? 'active' : ''} onClick={() => setTab('stores')}>Stores</button>
      </div>

      {tab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3>Users</h3>
            {!showAddUser && <button type="button" onClick={() => setShowAddUser(true)}>+ Add User</button>}
          </div>
          {showAddUser && <AddUserForm onCreated={bump} onClose={() => setShowAddUser(false)} />}
          <div className="filters">
            <input placeholder="Filter by name" value={userFilters.name} onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })} />
            <input placeholder="Filter by email" value={userFilters.email} onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })} />
            <input placeholder="Filter by address" value={userFilters.address} onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })} />
            <select value={userFilters.role} onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}>
              <option value="">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">Normal User</option>
              <option value="OWNER">Store Owner</option>
            </select>
          </div>
          <DataTable columns={userColumns} rows={users} sort={userSort} onSort={(key) => setUserSort(nextSort(userSort, key))} />
          {selected && (
            <div className="detail">
              <h3>User Details</h3>
              <p><b>Name:</b> {selected.name}</p>
              <p><b>Email:</b> {selected.email}</p>
              <p><b>Address:</b> {selected.address}</p>
              <p><b>Role:</b> {selected.role}</p>
              {selected.role === 'OWNER' && (
                <>
                  <p><b>Store:</b> {selected.storeName || 'No store assigned'}</p>
                  <p><b>Rating:</b> {selected.rating === null || selected.rating === undefined ? 'No ratings' : selected.rating}</p>
                </>
              )}
              <button type="button" onClick={() => setSelected(null)}>Close</button>
            </div>
          )}
        </div>
      )}

      {tab === 'stores' && (
        <div className="card">
          <div className="card-header">
            <h3>Stores</h3>
            {!showAddStore && <button type="button" onClick={() => setShowAddStore(true)}>+ Add Store</button>}
          </div>
          {showAddStore && <AddStoreForm onCreated={bump} onClose={() => setShowAddStore(false)} refreshKey={refresh} />}
          <div className="filters">
            <input placeholder="Filter by name" value={storeFilters.name} onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })} />
            <input placeholder="Filter by email" value={storeFilters.email} onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })} />
            <input placeholder="Filter by address" value={storeFilters.address} onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })} />
          </div>
          <DataTable columns={storeColumns} rows={stores} sort={storeSort} onSort={(key) => setStoreSort(nextSort(storeSort, key))} />
        </div>
      )}
    </div>
  );
}
