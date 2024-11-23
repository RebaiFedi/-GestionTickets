'use client'

import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { LockKeyhole, User, Key, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      router.push('/')
    } catch (err) {
      setError('Échec de la connexion. Veuillez vérifier vos identifiants.')
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 mx-4 mt-4 transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-500 rounded-full p-4 mb-4">
            <LockKeyhole className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900">Connexion</h2>
        </div>
        
        {error && (
          <div className="mb-6 flex items-center justify-center bg-red-100 rounded-lg py-3 px-4">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-orange-500 hover:text-orange-600">
                Mot de passe oublié?
              </a>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform hover:scale-105"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}