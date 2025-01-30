import React, { useState } from 'react';
import { CircleUser } from 'lucide-react';
import axios from 'axios'; // For API requests
import { useNavigate } from 'react-router-dom'; // For navigation

function AuthPage() {
  const [name, setName] = useState(''); // For registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between sign-up and sign-in
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error message
  const navigate = useNavigate(); // For routing

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setLoading(true); // Set loading state
    setError(''); // Clear previous errors

    try {
      const endpoint = isSignUp ? 'auth/register' : 'auth/login'; // Determine API endpoint
      const payload = isSignUp
        ? { username:name, email, password } // Payload for registration
        : { email, password }; // Payload for login

      // Make API request
      const response = await axios.post(`http://localhost:8081/${endpoint}`, payload);
      console.log(response)
      // Handle successful response
      if (response.data.success) {
        localStorage.setItem('token', response.data.token); // Save token to localStorage
        navigate('/overview'); // Redirect to overview page
      } else {
        setError(response.data.message || 'Authentication failed'); // Set error message
      }
    } catch (err) {
	console.log(err)
      setError(err.response?.data?.message || 'Something went wrong'); // Handle API errors
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-black"
      style={{
        backgroundImage: `url('https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2Ffree-navy-blue-solid-background-images-dark-blue-background-poster-size-photo-background-png-and-vectors--8655424271897061%2F&psig=AOvVaw1-ZkSjXh0Wih9TXkxwsATy&ust=1738275793191000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCJDT2aX8m4sDFQAAAAAdAAAAABAE')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md p-8 rounded-2xl bg-gray-900/80 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-2">
            <CircleUser className="w-6 h-6 text-gray-900" />
          </div>
          <h2 className="text-2xl font-semibold text-white">
            {isSignUp ? 'Create an account' : 'Welcome back!'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isSignUp ? 'Sign up to get started' : 'You should login to continue'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2 bg-red-500/20 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field (only for sign-up) */}
          {isSignUp && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
              required
            />
          )}

          {/* Email field */}
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
            required
          />

          {/* Password field */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
            required
          />

          {/* Remember me and forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-400">
              <input
                type="checkbox"
                className="mr-2 rounded bg-gray-800 border-gray-700 text-yellow-400 focus:ring-yellow-400"
              />
              Remember me
            </label>
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        {/* Toggle between sign-up and sign-in */}
        <div className="mt-4 text-center text-gray-400">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-yellow-400 hover:text-yellow-500 transition-colors"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
