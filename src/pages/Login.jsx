import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import db from '../../db.json';
  import { ToastContainer, toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [errors ,setErrors] = useState()
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/users?email=${email}&password=${password}`);
      const users = await response.json();

      if (users.length > 0) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(users[0]));
        window.dispatchEvent(new Event('userLogin'));
              toast.success('Logged in successfully (local fallback)');
      setTimeout(() => {
        navigate('/');
      }, 500);
      } else {
        const memberRes = await fetch(`http://localhost:3001/members?email=${email}&password=${password}`);
        const members = await memberRes.json();

        if (members.length > 0) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(members[0]));
          window.dispatchEvent(new Event('userLogin'));
             toast.success('Logged in successfully (local fallback)');
      setTimeout(() => {
        navigate('/');
      }, 500);
        } else {
          checkLocalFallback();
        }
      }
    } catch (err) {
      console.error("Login fetch error (falling back to local db.json):", err);
      checkLocalFallback();
    }
  };
  const seterrorFeilds = (email, password) => {
    const newErrors = {
      email : '',
      passsword:''
    }
    if(email === ''){
      newErrors.email = 'Email is required'
    }
    else if(!/\S+@\S+\.\S+/.test(email)){
      newErrors.email = 'Email is invalid'
    }
    if(password === ''){
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors);
  }

  const checkLocalFallback = () => {
    const member = db.members?.find(m => m.email === email && m.password === password);
    const user = db.users?.find(u => u.email === email && u.password === password);
    seterrorFeilds(email,password)
    console.log(errors)
    if (user) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ name: 'Admin User', designation: 'Administrator', email: user.email, role: 'admin' }));
      window.dispatchEvent(new Event('userLogin'));
      toast.success('Logged in successfully (local fallback)');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } else if (member) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ name: member.name, designation: member.role || 'Member', email: member.email, role: member.role }));
      window.dispatchEvent(new Event('userLogin'));
      toast.success('Logged in successfully (local fallback)');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } else {
      toast.error('Invalid email or password.');
    }
  };

  const handleForgotPassword = () => {
    // alert("Forgot password functionality will send an email reset link to " + (email || "your email."));
    toast.info("Forgot password functionality will send an email reset link to " + (email || "your email."));
  };

  return (
    <>
    <ToastContainer />
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200 p-4`}>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="SmartData Logo" className="h-12 mb-4 drop-shadow-sm" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Please sign in to your account</p>
          </div>

          {/* {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center text-red-600 dark:text-red-400 text-sm animate-scale-in">
              <span className="flex-1">{error}</span>
            </div>
          )} */}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all sm:text-sm"
                  placeholder="admin@smartdata.com"
                />
              </div>
              <p className="text-red-500 text-sm mt-1">{errors?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  )}
                </button>
              <p className="text-red-500 text-sm mt-1">{errors?.password}</p>

              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors mt-2"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
