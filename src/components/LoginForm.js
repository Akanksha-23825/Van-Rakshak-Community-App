import React from 'react';
import { useForm } from 'react-hook-form';

function LoginForm({ onLogin }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleLogin = (data) => {
    onLogin({
      name: data.name,
      phone: data.phone,
      village: data.village
    });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🌿 Van Rakshak</h1>
          <p>Community Forest Protection Portal</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label>Your Full Name *</label>
            <input
              type="text"
              {...register('name', { required: true, minLength: 3 })}
              placeholder="Enter your name"
            />
            {errors.name && <span className="error">Name is required (min 3 characters)</span>}
          </div>

          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="tel"
              {...register('phone', { required: true, pattern: /^[0-9]{10}$/ })}
              placeholder="10-digit mobile number"
            />
            {errors.phone && <span className="error">Enter valid 10-digit number</span>}
          </div>

          <div className="form-group">
            <label>Village/Area Name *</label>
            <input
              type="text"
              {...register('village', { required: true, minLength: 3 })}
              placeholder="Your village or area name"
            />
            {errors.village && <span className="error">Village name is required</span>}
          </div>

          <button
            onClick={handleSubmit(handleLogin)}
            className="btn-submit"
          >
            Continue to Van Rakshak
          </button>
        </div>

        <div className="login-info">
          <p>
            💡 <strong>Your information helps us:</strong> Contact you for incident follow-up and send alerts specific to your area.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;