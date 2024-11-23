import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Button = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center";
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 focus:ring-orange-500",
    secondary: "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 focus:ring-blue-500",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-500"
  };
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const Input = ({ value, onChange, placeholder, icon: Icon, ...props }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 pl-12 border border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
      {...props}
    />
    {Icon && <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />}
  </div>
);

export const Card = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

export const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-lg p-6 w-full max-w-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
