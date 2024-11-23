import React, { useState } from 'react';
import './App.css';
import api from './api';  // Add this import at the top of the file

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Tentative de connexion avec:', { email, password });
    try {
      const response = await api.post('/users/login', { email, password });
      console.log('Réponse brute du serveur:', response);
      console.log('Données de la réponse:', response.data);
      // ... reste du code
    } catch (error: any) {
      console.error('Erreur complète:', error);
      console.error('Réponse d\'erreur:', error.response);
      setError('Erreur de connexion. Vérifiez vos identifiants.');
    }
  };

  return (
    <div className="App">
      <div className="login-container">
        <h1>Connexion</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}

export default App;
