import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff, FiCamera, FiCheckSquare, FiSquare, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const USER_AGREEMENT = `
STOBA 98 OLD BOYS ASSOCIATION
MEMBERSHIP AGREEMENT & CODE OF CONDUCT

Effective Date: January 1, 2026

This Membership Agreement ("Agreement") is entered into between the St. Teresa's College Nsukka Old Boys Association, 1992–1998 Set ("STOBA 98" or "the Association") and the undersigned individual ("Member") upon successful registration on the STOBA 98 Platform.

By clicking "I Accept" and completing registration, you acknowledge that you have read, understood, and agree to be bound by the following terms:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 1 — OBJECTIVES OF THE ASSOCIATION

The Association exists to:
  1. Promote unity, brotherhood, and mutual support among all members of the 1992–1998 graduating set of St. Teresa's College, Nsukka.
  2. Foster personal and professional development of members through networking, mentorship, and collaboration.
  3. Give back to our alma mater — St. Teresa's College, Nsukka — through projects, sponsorships, and community engagement.
  4. Organize social, cultural, and networking events that strengthen the bond among members.
  5. Provide welfare support to members and their families in times of need, celebration, or bereavement.
  6. Uphold the values of integrity, discipline, and service that were instilled in us during our years at St. Teresa's College.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 2 — ELIGIBILITY

Membership is open exclusively to former students of St. Teresa's College, Nsukka, who were part of the 1992–1998 set. By registering, you confirm that you are a bona fide member of this set.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 3 — MEMBER OBLIGATIONS

As a registered member, you agree to:

  a) FINANCIAL OBLIGATIONS
     • Pay the annual membership due of ₦10,000 (Ten Thousand Naira) as and when due, either in full or in approved installments.
     • Contribute to special levies, projects, or fundraising initiatives as approved by the Executive Committee (EXCO) and ratified by the general membership.
     • Submit payment proofs promptly through the platform for verification.

  b) PARTICIPATION
     • Attend quarterly meetings held on the last Sunday of March, June, September, and December, whether in person or via the platform's virtual meeting facility.
     • Actively participate in association events, projects, and programmes.
     • Respond to communications, notifications, and directives from the EXCO in a timely manner.

  c) CONDUCT
     • Treat all fellow members with respect, dignity, and courtesy at all times.
     • Refrain from any form of harassment, discrimination, hate speech, or conduct that brings the Association into disrepute.
     • Maintain confidentiality of member information and internal discussions shared on the platform.
     • Not use the Association's name, logo, or platform for personal commercial gain without prior written approval from the EXCO.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 4 — USE OF THE STOBA 98 PLATFORM

  a) You agree to provide accurate and truthful information during registration and to keep your profile updated.
  b) Your account is personal and non-transferable. You are responsible for maintaining the security of your login credentials.
  c) You shall not upload, share, or transmit any content that is offensive, defamatory, fraudulent, or violates any applicable law.
  d) The Association reserves the right to suspend or terminate your account for violation of this Agreement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 5 — GOVERNANCE

  a) The Association is governed by its Constitution, which is accessible on the platform under the "Constitution" section.
  b) Decisions are made democratically. Constitutional amendments follow the prescribed voting process on the platform.
  c) The EXCO, elected by the general membership, manages the day-to-day affairs of the Association.
  d) Members have the right to propose amendments to the Constitution through the platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 6 — PRIVACY & DATA PROTECTION

  a) Your personal data (name, email, phone, state of residence, profile photo) is collected solely for the purpose of managing your membership and facilitating Association activities.
  b) Your information will not be sold, shared, or disclosed to third parties without your consent, except as required by law.
  c) You may request the deletion of your account and associated data by contacting the EXCO. Note that financial records may be retained for audit purposes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 7 — SANCTIONS & DISPUTE RESOLUTION

  a) Violation of this Agreement may result in a warning, suspension, or expulsion from the Association, at the discretion of the EXCO.
  b) Any disputes between members shall be resolved amicably. Where resolution is not possible, the matter shall be referred to the EXCO or a committee appointed for that purpose.
  c) Decisions of the EXCO on disciplinary matters are final, subject to appeal at a general meeting.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 8 — LIMITATION OF LIABILITY

  a) The Association and its officers shall not be held liable for any loss, damage, or injury arising from participation in Association activities, except in cases of gross negligence.
  b) The platform is provided "as is." While we strive for reliability, the Association does not guarantee uninterrupted access or availability of the platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 9 — AMENDMENTS TO THIS AGREEMENT

This Agreement may be amended from time to time by the EXCO. Members will be notified of any changes through the platform. Continued use of the platform after notification constitutes acceptance of the amended terms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 10 — ACCEPTANCE

By checking the acceptance box and completing registration, I, the undersigned, hereby declare that:
  • I am a bona fide member of the 1992–1998 set of St. Teresa's College, Nsukka.
  • I have read and understood this Membership Agreement in its entirety.
  • I agree to abide by the Association's Constitution, this Agreement, and all lawful directives of the EXCO.
  • I commit to fully participate in the activities, meetings, and programmes of the Association.
  • I understand that failure to comply with these terms may result in disciplinary action.

God bless STOBA 98. God bless St. Teresa's College, Nsukka.

— The Executive Committee, STOBA 98 Old Boys Association
`.trim();

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const fileInputRef = useRef(null);
  const agreementRef = useRef(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    state_of_residence: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('You must read and accept the Membership Agreement to register');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('full_name', form.full_name);
      payload.append('email', form.email);
      payload.append('password', form.password);
      if (form.phone) payload.append('phone', form.phone);
      if (form.state_of_residence) payload.append('state_of_residence', form.state_of_residence);
      if (avatarFile) payload.append('avatar', avatarFile);

      await register(payload);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-stoba-brown items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/logo.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center px-12">
          <img src="/logo.png" alt="STOBA 98" className="w-32 h-32 mx-auto mb-6 rounded-full shadow-2xl border-4 border-stoba-yellow" />
          <h1 className="text-4xl font-bold text-white mb-3">Join STOBA 98</h1>
          <p className="text-lg text-brown-100 text-white/80">Become a member of our vibrant community</p>
          <div className="mt-8 bg-white/10 rounded-xl p-6 text-left">
            <h3 className="text-stoba-yellow font-semibold mb-3">Bank Details for Dues</h3>
            <p className="text-white text-sm">Bank: Access Bank</p>
            <p className="text-white text-sm">Account: 0760005400</p>
            <p className="text-white text-sm">Name: STOBA 98</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <img src="/logo.png" alt="STOBA 98" className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-stoba-green" />
            <h1 className="text-xl font-bold text-stoba-green">STOBA 98</h1>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
            <p className="text-gray-500 mb-6">Register as a STOBA 98 member</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar picker */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-stoba-green transition-colors group"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-stoba-green">
                      <FiCamera size={24} />
                      <span className="text-xs mt-1">Photo</span>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-1">Optional — tap to upload</p>
              </div>

              <div>
                <label className="label">Full Name *</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    name="full_name"
                    className="input-field pl-10"
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    className="input-field pl-10"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-10 pr-10"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Phone (WhatsApp)</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3 text-gray-400" />
                  <input
                    name="phone"
                    type="tel"
                    className="input-field pl-10"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="label">State of Residence</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                  <select
                    name="state_of_residence"
                    className="input-field pl-10 appearance-none"
                    value={form.state_of_residence}
                    onChange={handleChange}
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Membership Agreement */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-stoba-green/10 px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-stoba-green">Membership Agreement</h3>
                  <p className="text-xs text-gray-500">Please read the agreement below before registering</p>
                </div>
                <div
                  ref={agreementRef}
                  onScroll={(e) => {
                    const el = e.target;
                    if (el.scrollHeight - el.scrollTop - el.clientHeight < 30) {
                      setHasScrolledToBottom(true);
                    }
                  }}
                  className="p-4 max-h-48 overflow-y-auto bg-gray-50 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed"
                >
                  {USER_AGREEMENT}
                </div>
                {!hasScrolledToBottom && (
                  <div className="flex items-center justify-center gap-1 py-1.5 bg-stoba-yellow/20 text-stoba-brown text-xs animate-bounce">
                    <FiChevronDown size={14} /> Scroll down to read the full agreement
                  </div>
                )}
                <label className={`flex items-start gap-3 px-4 py-3 border-t border-gray-200 cursor-pointer ${!hasScrolledToBottom ? 'opacity-50 pointer-events-none' : 'hover:bg-green-50'}`}>
                  <button
                    type="button"
                    onClick={() => hasScrolledToBottom && setAgreed(!agreed)}
                    className="mt-0.5 flex-shrink-0 text-stoba-green"
                  >
                    {agreed ? <FiCheckSquare size={20} /> : <FiSquare size={20} />}
                  </button>
                  <span className="text-xs text-gray-700 leading-relaxed">
                    I have read and understood the <strong>STOBA 98 Membership Agreement</strong>. I confirm that I am a member of the 1992–1998 set of St. Teresa's College, Nsukka, and I agree to fully participate in the activities of the Association and abide by its Constitution.
                  </span>
                </label>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading || !agreed}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already a member?{' '}
              <Link to="/login" className="text-stoba-green font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
