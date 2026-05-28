import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { useAuth, RegisterData } from '../context/AuthContext';
import { Gender } from '../data/mockData';
import { Mail, ArrowLeft } from 'lucide-react';

const genderOptions: Gender[] = ['Male', 'Female', 'Other', 'Prefer not to say'];

const emptyRegistrationForm: RegisterData = {
  name: '',
  age: 0,
  address: '',
  email: '',
  gender: 'Prefer not to say',
  contactNumber: '',
  password: '',
};

export function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset' | null>(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationForm, setRegistrationForm] = useState<RegisterData>(emptyRegistrationForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingRegistration, setPendingRegistration] = useState<RegisterData | null>(null);
  const { login, register, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const updateRegistrationForm = <K extends keyof RegisterData>(field: K, value: RegisterData[K]) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const loginSuccess = login(email, password);
    if (loginSuccess) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !registrationForm.name.trim() ||
      !registrationForm.age ||
      !registrationForm.address.trim() ||
      !registrationForm.email.trim() ||
      !registrationForm.gender ||
      !registrationForm.contactNumber.trim() ||
      !registrationForm.password
    ) {
      setError('Please complete all registration fields');
      return;
    }

    if (registrationForm.age < 1) {
      setError('Please enter a valid age');
      return;
    }

    if (registrationForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setPendingRegistration(registrationForm);
    setShowOtpVerification(true);
  };

  const handleOtpVerification = () => {
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (otp === '123456' || otp.length === 6) {
      if (pendingRegistration) {
        const result = register(pendingRegistration);
        if (result.success) {
          setSuccess('Email verified successfully! Logging you in...');
        } else {
          setError(result.message);
          setShowOtpVerification(false);
          setPendingRegistration(null);
        }
      }
    } else {
      setError('Invalid verification code');
    }
  };

  const handleBackToRegister = () => {
    setShowOtpVerification(false);
    setPendingRegistration(null);
    setOtp('');
    setError('');
    setSuccess('');
  };

  const handleForgotPasswordStart = () => {
    setForgotPasswordStep('email');
    setForgotPasswordEmail(email);
    setForgotPasswordOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleForgotPasswordEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotPasswordEmail.trim()) {
      setError('Please enter your registered email');
      return;
    }

    setForgotPasswordStep('otp');
    setSuccess('OTP sent to your registered email');
  };

  const handleForgotPasswordOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (forgotPasswordOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (forgotPasswordOtp !== '123456') {
      setError('Invalid OTP. Use 123456 for this wireframe demo.');
      return;
    }

    setForgotPasswordStep('reset');
    setSuccess('OTP verified. You can now set a new password.');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSuccess('Password changed successfully. You can now log in.');
    setPassword('');
    setForgotPasswordStep(null);
    setForgotPasswordOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleBackToLogin = () => {
    setForgotPasswordStep(null);
    setForgotPasswordEmail('');
    setForgotPasswordOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setForgotPasswordStep(null);
    setForgotPasswordEmail('');
    setForgotPasswordOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setRegistrationForm(emptyRegistrationForm);
    setShowOtpVerification(false);
    setPendingRegistration(null);
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f4f6] via-background to-[#f0f9fa] px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              UYA Connect
            </h1>
            <p className="text-muted-foreground">
              {showOtpVerification
                ? 'Verify your email'
                : forgotPasswordStep
                  ? 'Recover your account'
                  : isRegisterMode
                    ? 'Create your account'
                    : 'Sign in to your account'}
            </p>
          </div>

          {showOtpVerification ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">We've sent a verification code to</p>
                  <p className="font-medium">{pendingRegistration?.email}</p>
                  <p className="text-xs text-muted-foreground">Enter the 6-digit code to verify your email</p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                {error && (
                  <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg w-full">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-primary text-sm text-center bg-primary/10 p-3 rounded-lg w-full">
                    {success}
                  </div>
                )}

                <Button onClick={handleOtpVerification} className="w-full">
                  Verify Email
                </Button>

                <button
                  onClick={handleBackToRegister}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to registration
                </button>
              </div>
            </div>
          ) : forgotPasswordStep ? (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                {forgotPasswordStep === 'email' && (
                  <form onSubmit={handleForgotPasswordEmailSubmit} className="space-y-4">
                    <Input
                      type="email"
                      label="Registered Email"
                      placeholder="Enter your registered email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                    />

                    {error && (
                      <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="text-primary text-sm text-center bg-primary/10 p-3 rounded-lg">
                        {success}
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Send OTP
                    </Button>
                  </form>
                )}

                {forgotPasswordStep === 'otp' && (
                  <form onSubmit={handleForgotPasswordOtpSubmit} className="space-y-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Enter the OTP sent to</p>
                      <p className="font-medium">{forgotPasswordEmail}</p>
                      <p className="text-xs text-muted-foreground">Wireframe demo OTP: 123456</p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                      <InputOTP maxLength={6} value={forgotPasswordOtp} onChange={(value) => setForgotPasswordOtp(value)}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error && (
                      <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="text-primary text-sm text-center bg-primary/10 p-3 rounded-lg">
                        {success}
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Verify OTP
                    </Button>
                  </form>
                )}

                {forgotPasswordStep === 'reset' && (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <Input
                      type="password"
                      label="New Password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Input
                      type="password"
                      label="Confirm Password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />

                    {error && (
                      <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="text-primary text-sm text-center bg-primary/10 p-3 rounded-lg">
                        {success}
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Change Password
                    </Button>
                  </form>
                )}

                <button
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>
              </div>

              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5">
                <p className="text-sm font-semibold text-foreground mb-4">Forgot Password Wireframe</p>
                <div className="space-y-3">
                  <div className={`rounded-lg border p-3 ${forgotPasswordStep === 'email' ? 'border-primary bg-background shadow-sm' : 'border-border bg-background/60'}`}>
                    <p className="text-xs text-muted-foreground mb-1">Step 1</p>
                    <p className="font-medium text-sm">Enter registered email</p>
                  </div>
                  <div className={`rounded-lg border p-3 ${forgotPasswordStep === 'otp' ? 'border-primary bg-background shadow-sm' : 'border-border bg-background/60'}`}>
                    <p className="text-xs text-muted-foreground mb-1">Step 2</p>
                    <p className="font-medium text-sm">Type the OTP from email</p>
                  </div>
                  <div className={`rounded-lg border p-3 ${forgotPasswordStep === 'reset' ? 'border-primary bg-background shadow-sm' : 'border-border bg-background/60'}`}>
                    <p className="text-xs text-muted-foreground mb-1">Step 3</p>
                    <p className="font-medium text-sm">Set new password and confirm</p>
                  </div>
                </div>
              </div>
            </div>
          ) : isRegisterMode ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={registrationForm.name}
                  onChange={(e) => updateRegistrationForm('name', e.target.value)}
                  required
                />
                <Input
                  type="number"
                  label="Age"
                  placeholder="Enter age"
                  min={1}
                  value={registrationForm.age || ''}
                  onChange={(e) => updateRegistrationForm('age', Number(e.target.value))}
                  required
                />
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter email address"
                  value={registrationForm.email}
                  onChange={(e) => updateRegistrationForm('email', e.target.value)}
                  required
                />
                <div className="w-full">
                  <label className="block mb-2 text-sm text-foreground">Gender</label>
                  <select
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                    value={registrationForm.gender}
                    onChange={(e) => updateRegistrationForm('gender', e.target.value as Gender)}
                    required
                  >
                    {genderOptions.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                <Input
                  type="tel"
                  label="Contact Number"
                  placeholder="Enter contact number"
                  value={registrationForm.contactNumber}
                  onChange={(e) => updateRegistrationForm('contactNumber', e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="Password"
                  placeholder="Minimum 6 characters"
                  value={registrationForm.password}
                  onChange={(e) => updateRegistrationForm('password', e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Input
                type="text"
                label="Address"
                placeholder="Enter complete address"
                value={registrationForm.address}
                onChange={(e) => updateRegistrationForm('address', e.target.value)}
                required
              />

              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-primary text-sm text-center bg-primary/10 p-3 rounded-lg">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full">
                Register
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-primary text-sm text-center bg-primary/10 p-3 rounded-lg">
                  {success}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleForgotPasswordStart}
                  className="text-sm text-primary hover:underline font-medium"
                  type="button"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          )}

          {!showOtpVerification && !forgotPasswordStep && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={toggleMode}
                  className="text-primary hover:underline font-medium"
                  type="button"
                >
                  {isRegisterMode ? 'Login' : 'Register'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
