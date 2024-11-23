import React, { useState, useEffect } from 'react';
import api from '../api';

interface User {
  _id: string;
  username: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', { username, password, role });
      fetchUsers();
      setUsername('');
      setPassword('');
      setRole('');
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Utilisateurs</h2>
      <form onSubmit={handleCreateUser} className="mb-8">
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mr-2 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mr-2 p-2 border rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mr-2 p-2 border rounded"
        >
          <option value="">Sélectionner un rôle</option>
          <option value="admin">Admin</option>
          <option value="district">District</option>
          <option value="store">Store</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Créer Utilisateur
        </button>
      </form>
      <table className="w-full">
        <thead>
          <tr>
            <th>Nom d'utilisateur</th>
            <th>Rôle</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
