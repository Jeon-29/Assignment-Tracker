import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  User,
  Mail,
  Edit,
  Lock,
  Eye,
  EyeOff,
  Camera,
  X,
  Save,
  Calendar,
  MapPin,
  Phone,
  Users,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Gender } from '../data/mockData';

const genderOptions: Gender[] = ['Male', 'Female', 'Other', 'Prefer not to say'];

interface ProfileForm {
  name: string;
  age: string;
  address: string;
  email: string;
  gender: Gender;
  contactNumber: string;
}

export function ProfilePage() {
  const { currentUser, setCurrentUser } = useAuth();
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: currentUser?.name || '',
    age: currentUser?.age?.toString() || '',
    address: currentUser?.address || '',
    email: currentUser?.email || '',
    gender: currentUser?.gender || 'Prefer not to say' as Gender,
    contactNumber: currentUser?.contactNumber || '',
  });

  if (!currentUser) return null;

  const resetProfileForm = () => {
    setProfileForm({
      name: currentUser.name || '',
      age: currentUser.age?.toString() || '',
      address: currentUser.address || '',
      email: currentUser.email || '',
      gender: currentUser.gender || 'Prefer not to say',
      contactNumber: currentUser.contactNumber || '',
    });
  };

  const handleStartEdit = () => {
    resetProfileForm();
    setSaveError('');
    setSaveSuccess('');
    setIsEditingInfo(true);
  };

  const handleCancelEdit = () => {
    resetProfileForm();
    setSaveError('');
    setSaveSuccess('');
    setIsEditingInfo(false);
  };

  const handleProfileFormChange = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setSaveError('');
    setSaveSuccess('');

    if (!profileForm.name.trim()) {
      setSaveError('Name is required');
      return;
    }

    if (!profileForm.age || Number(profileForm.age) < 1) {
      setSaveError('Please enter a valid age');
      return;
    }

    if (!profileForm.address.trim()) {
      setSaveError('Address is required');
      return;
    }

    if (!profileForm.email.trim() || !profileForm.email.includes('@')) {
      setSaveError('Please enter a valid email address');
      return;
    }

    if (!profileForm.contactNumber.trim()) {
      setSaveError('Contact number is required');
      return;
    }

    setCurrentUser({
      ...currentUser,
      name: profileForm.name.trim(),
      age: Number(profileForm.age),
      address: profileForm.address.trim(),
      email: profileForm.email.trim(),
      gender: profileForm.gender,
      contactNumber: profileForm.contactNumber.trim(),
    });

    setSaveSuccess('Personal information updated successfully');
    setIsEditingInfo(false);
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasswordChange = () => {
    setPasswordError('');

    if (!passwordData.currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    alert('Password changed successfully!');
    setIsChangePasswordModalOpen(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and account settings
          </p>
        </div>

        {!isEditingInfo ? (
          <Button onClick={handleStartEdit} className="flex items-center gap-2 w-full md:w-auto">
            <Edit className="w-4 h-4" />
            Edit Personal Info
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSaveProfile} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button onClick={handleCancelEdit} variant="outline">
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-muted/20 p-6">
              <div className="relative group">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-border"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-4xl">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <button
                  onClick={handleProfilePictureClick}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                  title="Change profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {profilePicture && (
                  <button
                    onClick={handleRemovePicture}
                    className="absolute top-0 right-0 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    title="Remove profile picture"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="text-center space-y-2">
                <p className="font-semibold text-lg">{currentUser.name}</p>
                <Badge className="capitalize">{currentUser.role}</Badge>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span className="capitalize">{currentUser.status}</span>
                </div>
              </div>

              <Button
                onClick={() => setIsChangePasswordModalOpen(true)}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </Button>
            </div>

            <div className="space-y-5">
              {saveError && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="text-primary text-sm bg-primary/10 p-3 rounded-lg">
                  {saveSuccess}
                </div>
              )}

              {isEditingInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Name"
                    value={profileForm.name}
                    onChange={(e) => handleProfileFormChange('name', e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    label="Age"
                    min={1}
                    value={profileForm.age}
                    onChange={(e) => handleProfileFormChange('age', e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    label="Email Address"
                    value={profileForm.email}
                    onChange={(e) => handleProfileFormChange('email', e.target.value)}
                    required
                  />
                  <div className="w-full">
                    <label className="block mb-2 text-sm text-foreground">Gender</label>
                    <select
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                      value={profileForm.gender}
                      onChange={(e) => handleProfileFormChange('gender', e.target.value as Gender)}
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
                    value={profileForm.contactNumber}
                    onChange={(e) => handleProfileFormChange('contactNumber', e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    label="Address"
                    value={profileForm.address}
                    onChange={(e) => handleProfileFormChange('address', e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={<User className="w-4 h-4" />} label="Name" value={currentUser.name} />
                  <InfoCard icon={<Calendar className="w-4 h-4" />} label="Age" value={currentUser.age ? `${currentUser.age}` : 'Not set'} />
                  <InfoCard icon={<Mail className="w-4 h-4" />} label="Email Address" value={currentUser.email} />
                  <InfoCard icon={<Users className="w-4 h-4" />} label="Gender" value={currentUser.gender || 'Not set'} />
                  <InfoCard icon={<Phone className="w-4 h-4" />} label="Contact Number" value={currentUser.contactNumber || 'Not set'} />
                  <InfoCard icon={<MapPin className="w-4 h-4" />} label="Address" value={currentUser.address || 'Not set'} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isChangePasswordModalOpen}
        onClose={() => {
          setIsChangePasswordModalOpen(false);
          setPasswordError('');
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Change Password"
        size="md"
      >
        <div className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={passwordData.currentPassword}
            show={showPasswords.current}
            onChange={(value) => setPasswordData({ ...passwordData, currentPassword: value })}
            onToggle={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
          />

          <PasswordInput
            label="New Password"
            value={passwordData.newPassword}
            show={showPasswords.new}
            onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
            onToggle={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
          />

          <PasswordInput
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            show={showPasswords.confirm}
            onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
            onToggle={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
          />

          {passwordError && (
            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              {passwordError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handlePasswordChange} className="flex-1">
              Update Password
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangePasswordModalOpen(false);
                setPasswordError('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 min-h-[96px]">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-medium text-foreground break-words">{value}</p>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  show,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="block mb-2 text-sm text-foreground">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 pr-10 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
