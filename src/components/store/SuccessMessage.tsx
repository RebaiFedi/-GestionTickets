import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  title: string;
  message: string;
}

export default function SuccessMessage({ title, message }: SuccessMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        exit={{ y: 20 }}
        className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center space-y-4 max-w-md mx-4"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500 text-center">{message}</p>
        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden mt-4">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2 }}
            className="h-full bg-green-500"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
