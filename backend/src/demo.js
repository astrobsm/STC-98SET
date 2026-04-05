/**
 * Demo mode middleware and data for local development
 * Provides mock auth, users, payments, events, etc. without Supabase
 */
const crypto = require('crypto');

const DEMO_TOKEN = 'demo-token-stoba98';

// Demo users
const demoUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    auth_id: 'auth-admin',
    full_name: 'Admin User',
    email: 'admin@stoba98.com',
    phone: '+234 801 000 0001',
    state_of_residence: 'Lagos',
    date_of_birth: '1980-04-10',
    wedding_anniversary: '2008-12-20',
    role: 'admin',
    is_active: true,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    auth_id: 'auth-exco',
    full_name: 'Exco Member',
    email: 'exco@stoba98.com',
    phone: '+234 802 000 0002',
    state_of_residence: 'Abuja',
    date_of_birth: '1979-07-22',
    wedding_anniversary: '2005-06-15',
    role: 'exco',
    is_active: true,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    auth_id: 'auth-member',
    full_name: 'John Adekunle',
    email: 'member@stoba98.com',
    phone: '+234 803 000 0003',
    state_of_residence: 'Oyo',
    date_of_birth: '1981-04-08',
    wedding_anniversary: null,
    role: 'member',
    is_active: true,
    created_at: '2025-03-10T00:00:00Z',
    updated_at: '2025-03-10T00:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    auth_id: 'auth-member2',
    full_name: 'Emeka Okafor',
    email: 'emeka@stoba98.com',
    phone: '+234 804 000 0004',
    state_of_residence: 'Anambra',
    date_of_birth: '1980-11-15',
    wedding_anniversary: '2010-03-28',
    role: 'member',
    is_active: true,
    created_at: '2025-04-01T00:00:00Z',
    updated_at: '2025-04-01T00:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    auth_id: 'auth-member3',
    full_name: 'Bola Tinubu Jr',
    email: 'bola@stoba98.com',
    phone: '+234 805 000 0005',
    state_of_residence: 'Lagos',
    date_of_birth: '1979-12-25',
    wedding_anniversary: '2007-08-10',
    role: 'member',
    is_active: true,
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2025-05-01T00:00:00Z',
  },
];

// Demo passwords (email -> password)
const demoPasswords = {
  'admin@stoba98.com': 'admin123',
  'exco@stoba98.com': 'exco123',
  'member@stoba98.com': 'member123',
  'emeka@stoba98.com': 'member123',
  'bola@stoba98.com': 'member123',
};

// Demo payments (empty — real payments will be added by members)
const demoPayments = [];

// Demo events (empty — admin will create real events)
const demoEvents = [];

// Demo constitution - Full 14 Articles
const demoConstitution = [
  {
    id: 'c-preamble', title: 'PREAMBLE', article_number: 0,
    content: 'We, the former students of St Teresa\'s College Nsukka (1992 -1998) in order to strengthen the ties between us and our alma mater, St Teresa\'s College Nsukka, and also seek ways of giving back to our alma mater, creating opportunities for group and individual advancement, do hereby form for ourselves this constitution.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-schedule1', title: 'SCHEDULE 1 - OATH OF OFFICE FOR OFFICIALS', article_number: 0.5,
    content: 'I …………………… being elected as …………………. of STOBA 98 do solemnly swear/affirm that I will discharge my duties creditably to the best of my ability, faithfully and in accordance with the constitution of STOBA 98, and always in the best interest of solidarity, integrity, well-being and prosperity of STOBA 98. I will strive to preserve the fundamental objectives and principles of STOBA 98 as contained in the constitution of STOBA 98. I will not allow my personal interest to influence my official conduct or my official decisions. I will do right to all members according to the constitution of STOBA 98 without fear or favour, affection or ill will; and I will do my best to preserve, protect and defend the constitution of STOBA 98.\n\nSo help me God.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art1', title: 'ARTICLE I - NAME', article_number: 1,
    content: 'The name of this group shall be called, STOBA 98.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art2', title: 'ARTICLE II - PURPOSE', article_number: 2,
    content: 'The general purpose of this group shall be; to promote the general welfare and cooperation of members, promote the effectiveness of Saint Teresa\'s College Nsukka, through strengthening the ties between former students of Saint Teresa\'s College (1992 - 1998) and the College. Stimulate the interest and activity of the alumni of Saint Teresa\'s College and participate in further development of Saint Teresa\'s College, Nsukka.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art3', title: 'ARTICLE III - MEMBERSHIP', article_number: 3,
    content: 'SECTION 1. Regular membership of this group shall be open to all graduates of Saint Teresa\'s College 1998 and all other former students who passed through the college between 1992 - 1998 but did not graduate from the college.\n\nSECTION 2. Honorary members of this Group shall be those persons who have interest in the welfare of Saint Teresa\'s College and desire to associate themselves in the activities of this group, and admitted as such, upon approval of the executives. However, the rights of honorary members shall exclude the right to vote or hold office as a member of the group.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art4', title: 'ARTICLE IV - OFFICERS', article_number: 4,
    content: 'SECTION 1. The officers of this group shall be: President, Vice President, Executive Secretary, Treasurer and Public Relations Officer.\n\nSECTION 2. Duties of Officers.\n\nA. PRESIDENT: The President of this group shall be its chief executive. The President shall preside at all meetings of the group, and at meetings of the Executives/ Executive committee. The President shall represent the group in and at all functions and activities required by his office. The President, with the advice and consent of the Executives, shall appoint all committees of the group and all State Coordinators.\n\nB. VICE PRESIDENT: The Vice President shall be an assistant to the President and in the absence of the President, shall exercise the powers of the President, and shall serve on the Executive Committee.\n\nC. EXECUTIVE SECRETARY: The elected secretary shall serve as the Executive Secretary of the Association, and shall as well serve on the Executive Committee. The duties of the Executive Secretary are to:\n(i) be chief assistant to the group;\n(ii) keep minutes of all meetings;\n(iii) be the chief financial officer of the Group;\n(iv) manage the affairs and daily operations of the Group;\n(v) prepare annual report of the group at the end of every year which will be distributed to all members.\n\nD. THE PUBLIC RELATIONS OFFICER (PRO): The duties of the Public Relations Officer are:\n(i) to publicize the notices of all meetings of the group.\n(ii) to disseminate all approved messages and distribute all circulars and other information of the group.\n\nE. TREASURER:\n(i) It shall be the duty of the treasurer to receive all monies from the Executive Secretary for the use of the group, issue receipts to cover such monies and pay same into the group\'s bank account within forty-eight (48) hours of receipt of same.\n(ii) He shall keep an accurate account of all monies received and paid by him on behalf of the group.\n(iii) He shall pay no money without an order/payment voucher signed by the President.\n(iv) He shall render a report of his receipt and disbursements at each executive meeting.\n\nSECTION 3. The office of all the executives shall be two-year tenure. Officers will not be eligible to serve in the same position for more than two consecutive terms.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art5', title: 'ARTICLE V - BOARD OF DIRECTORS', article_number: 5,
    content: 'SECTION 1. The management of this group shall vest on the Board of Directors, consisting of the executives of the group and state coordinators.\n\nSECTION 2. The Board of Directors will meet at least two times each year, at a time and place communicated to its members with at least one-month notification.\n\nSECTION 3. A simple majority of the whole number of board members shall constitute a quorum, and a majority of the votes cast at a regularly convened meeting shall be sufficient to approve all matters of business.\n\nSECTION 4. A board member, who fails to uphold the standards of Saint Teresa\'s College and STOBA 98 Group, shall lose his membership on the Board by a two-third vote of those present and voting thereon.\n\nSECTION 5. The general meeting which shall hold at least once every year shall be the highest decision making body of the group and all major decisions shall be made through a vote in which a simple majority shall prevail.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art6', title: 'ARTICLE VI - ELECTION', article_number: 6,
    content: 'SECTION 1. Election of the members of the Executives shall hold every two years.\n\nSECTION 2. Electoral Committee shall be set up to handle election matters. STOBA 98 members present shall nominate members of such committee on the Election Day. A chairperson who will emerge by a simple majority of the appointed electoral committee members shall head the committee. It will be the duty of the electoral committee to conduct the election in a way deemed fit by them and accepted by all members present.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art7', title: 'ARTICLE VII - MEETINGS', article_number: 7,
    content: 'SECTION 1. A general meeting shall hold at least once every year at a venue, which shall be communicated to all members at least one month before the day, or at such other time as the Board of Directors may determine.\n\nSECTION 2. At least thirty percent (30%) of registered members of the group including at least one executive shall form a quorum, and a majority of the votes cast at a regularly convened meeting shall be sufficient to approve all matters of business.\n\nSECTION 3. The following shall be the usual order of business at regular meetings of the group, but the order may be suspended or changed at any time by the vote of a majority of the members present:\n(i) Prayer;\n(ii) Roll Call;\n(iii) Action on Minutes of Previous Meeting;\n(iv) Reports of Officers of the Association;\n(v) Reports of Special Committees;\n(vi) Unfinished Business;\n(vii) New Business;\n(viii) Any Other Business;\n(ix) Closing Prayer and Adjournment\n\nSECTION 4. Different states/quarters shall hold monthly or quarterly meeting of STOBA 98 at a venue, which shall be communicated to all members in that region at least two weeks before the day. Such meetings shall be presided over by the state coordinator in charge of that region and the minutes of the meetings submitted to the President through the Executive Secretary for proper documentation.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art8', title: 'ARTICLE VIII - COMMITTEES', article_number: 8,
    content: 'SECTION 1. The President of the Group shall appoint Committees, subject to the approval of the Executives.\n\nSECTION 2. Standing committees shall include:\n(i) Special Events Committee. The Special Events Committee shall be responsible for planning the annual general meeting and other events as needed. The President shall appoint at least three Board members to serve on this Committee.\n\nSECTION 3. Special and ad hoc committees shall be appointed by the President and approved by the Board members when the need arises.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art9', title: 'ARTICLE IX - FINANCE', article_number: 9,
    content: 'The group shall derive her funds through but not limited to the following ways;\ni. Monthly dues\nii. Voluntary donations made by members and non members\niii. Fund raising activities such as launching and freewill donations\niv. Fines\nv. Any profit-making venture that the group may get involved in',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art10', title: 'ARTICLE X - ADMINISTRATION OF FUND', article_number: 10,
    content: 'The administration of the group\'s fund shall be guided by the following principles:\ni. The group shall open an account with a recognized bank.\nii. All monies collected for and on behalf of the group shall be deposited in the bank account.\niii. Signatories to the bank account shall be any two of the president, the executive secretary and the treasurer.\niv. All withdrawals must get approval from the president.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art11', title: 'ARTICLE XI - DISCIPLINE', article_number: 11,
    content: 'The following disciplinary actions shall be taken for any of the following offenses.\ni. Any member who is late for any of our official gatherings without prior notice communicated to and approved by the executives shall pay a fine of five hundred naira (N500) only.\nii. Failure to attend any of our meetings without cogent and verifiable reason communicated to the executives shall attract a fine of one thousand naira (N1,000) only.\niii. Any member who is found in any disgraceful act which is not worthy of a product of St Teresa\'s College shall stand suspended until after investigation which will be conducted by board of directors and also after the offender has been given opportunity for fair hearing. The board of directors shall have the power to suspend or terminate such a person\'s membership after fair hearing. However, the person involved can appeal the outcome of the investigation to the general house. If after hearing the investigation report of the board of directors as well as the concerned person\'s side of the story, the general house, through a simple majority vote, finds the person guilty, his membership will be terminated.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art12', title: 'ARTICLE XII - RESIGNATION AND IMPEACHMENT OF OFFICERS', article_number: 12,
    content: 'SECTION 1. RESIGNATION OF OFFICERS\nAn officer of the group can at any time resign his position if for cogent verifiable reasons he is no longer able to perform his functions as spelt out in the constitution. Such resignation can only take effect when approved by the board of directors.\n\nSECTION 2. IMPEACHMENT OF OFFICERS\n\nA. GROUNDS FOR IMPEACHMENT\nAn officer of the group can be impeached on any of the following grounds.\ni. Financial misappropriation.\nii. Gross misconduct and negligence of duty as an executive member.\niii. Insubordination.\n\nB. IMPEACHMENT PROCESS\ni. The impeachment process shall begin by an impeachment motion moved by a registered member of the group.\nii. The motion shall be seconded by another registered member.\niii. This shall be proceeded by deliberation and hearing from all the involved parties.\niv. After due hearing and deliberations, the concerned officer shall stand impeached upon a two-third vote of members present at meeting on the impeachment motion.\n\nC. Any impeached officer automatically ceases to be a member of the board of directors and will not be eligible to occupy any office in the group after such impeachment.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art13', title: 'ARTICLE XIII - FILLING OF VACANCIES', article_number: 13,
    content: 'In case of any vacancy that may arise before the end of the tenure of elected officials, the board of directors shall have the power to fill such vacancies. However, if thirty percent (30%) of registered members indicate their rejection of the appointed officer, an election shall be held to fill the vacancy during the annual general meeting provided that an announcement is made to that effect at least one month before the day of the meeting.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
  {
    id: 'c-art14', title: 'ARTICLE XIV - AMENDMENTS', article_number: 14,
    content: 'This Constitution and By-laws shall be subject to amendment at any annual general meeting of the group by a two-thirds vote of those present and voting thereon, provided that the proposed amendment or amendments have been submitted in writing to the Board of Directors and a notice of the proposed amendment given to members before the day of the meeting.',
    version: 1, is_active: true, status: 'approved', created_at: '2017-01-01T00:00:00Z',
  },
];

// Demo amendments (empty — admin will propose real amendments)
const demoAmendments = [];

// Demo EXCO
const demoExco = [
  { id: 'x1', user_id: '11111111-1111-1111-1111-111111111111', name: 'Admin User', position: 'President', contact: '+234 801 000 0001', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'x2', user_id: '22222222-2222-2222-2222-222222222222', name: 'Exco Member', position: 'Vice President', contact: '+234 802 000 0002', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'x3', user_id: null, name: 'Kunle Adeyemi', position: 'Executive Secretary', contact: '+234 806 000 0006', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'x4', user_id: null, name: 'Chidi Nnamdi', position: 'Treasurer', contact: '+234 807 000 0007', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'x5', user_id: null, name: 'Femi Ogunlana', position: 'Public Relations Officer', contact: '+234 808 000 0008', is_active: true, created_at: '2025-01-01T00:00:00Z' },
];

// Demo notifications (empty — notifications generated by system actions)
const demoNotifications = [];

// Demo contributions (empty — admin will create real contribution campaigns)
const demoContributions = [];

const demoContributionPayments = [];

// Active tokens -> user id mapping
const activeTokens = {};

function generateToken(userId) {
  const token = `demo-${userId}-${crypto.randomBytes(16).toString('hex')}`;
  activeTokens[token] = userId;
  return token;
}

function getUserByToken(token) {
  const userId = activeTokens[token];
  if (!userId) return null;
  return demoUsers.find((u) => u.id === userId) || null;
}

function isDemoMode() {
  // Default to demo mode when DEMO_MODE is true or when no Supabase is configured
  return process.env.DEMO_MODE === 'true' || !process.env.SUPABASE_URL;
}

/**
 * Demo auth middleware - replaces Supabase auth in demo mode
 */
function demoAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }
  const token = authHeader.split(' ')[1];
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = { id: user.auth_id, profile: user };
  next();
}

/**
 * Mount demo API routes
 */
function mountDemoRoutes(app) {
  console.log('🟡 DEMO MODE ACTIVE — using mock data, no Supabase connection');

  // AUTH
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const correctPw = demoPasswords[email.toLowerCase()];
    if (!correctPw || correctPw !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = demoUsers.find((u) => u.email === email.toLowerCase());
    const token = generateToken(user.id);
    res.json({
      message: 'Login successful',
      session: { access_token: token, refresh_token: `refresh-${token}`, expires_at: Date.now() + 86400000 },
      user,
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { full_name, email, password, phone, state_of_residence } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    if (demoUsers.find((u) => u.email === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const newUser = {
      id: crypto.randomUUID(),
      auth_id: `auth-${crypto.randomUUID().slice(0, 8)}`,
      full_name,
      email: email.toLowerCase(),
      phone: phone || null,
      state_of_residence: state_of_residence || null,
      role: 'member',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoUsers.push(newUser);
    demoPasswords[newUser.email] = password;
    res.status(201).json({ message: 'Registration successful', user: newUser });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) delete activeTokens[token];
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', demoAuthenticate, (req, res) => {
    res.json({ user: req.user.profile });
  });

  app.post('/api/auth/refresh', (req, res) => {
    // Just return a new token for demo
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'Refresh token required' });
    // Find the userId from the old token pattern
    const oldKey = refresh_token.replace('refresh-', '');
    const userId = activeTokens[oldKey];
    if (!userId) return res.status(401).json({ error: 'Invalid refresh token' });
    delete activeTokens[oldKey];
    const newToken = generateToken(userId);
    res.json({ access_token: newToken, refresh_token: `refresh-${newToken}` });
  });

  // USERS
  app.get('/api/users', demoAuthenticate, (req, res) => {
    const user = req.user.profile;
    if (!['admin', 'exco'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    res.json({ users: demoUsers, pagination: { total: demoUsers.length, page: 1, limit: 50 } });
  });

  app.get('/api/users/stats/overview', demoAuthenticate, (req, res) => {
    const total = demoUsers.length;
    const byRole = { admin: 0, exco: 0, member: 0 };
    demoUsers.forEach((u) => byRole[u.role]++);
    res.json({ stats: { total, ...byRole } });
  });

  app.get('/api/users/:id', demoAuthenticate, (req, res) => {
    const u = demoUsers.find((u) => u.id === req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ user: u });
  });

  app.patch('/api/users/:id', demoAuthenticate, (req, res) => {
    const u = demoUsers.find((u) => u.id === req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    Object.assign(u, req.body, { updated_at: new Date().toISOString() });
    res.json({ user: u });
  });

  app.patch('/api/users/:id/role', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const u = demoUsers.find((u) => u.id === req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    u.role = req.body.role;
    res.json({ user: u });
  });

  // PAYMENTS
  app.get('/api/payments', demoAuthenticate, (req, res) => {
    const user = req.user.profile;
    let payments = [...demoPayments];
    if (!['admin', 'exco'].includes(user.role)) {
      payments = payments.filter((p) => p.user_id === user.id);
    }
    if (req.query.status) payments = payments.filter((p) => p.status === req.query.status);
    // Enrich with user name
    payments = payments.map((p) => ({
      ...p,
      user: demoUsers.find((u) => u.id === p.user_id),
    }));
    res.json({ payments, pagination: { total: payments.length, page: 1, limit: 50 } });
  });

  app.get('/api/payments/summary', demoAuthenticate, (req, res) => {
    const user = req.user.profile;
    if (['admin', 'exco'].includes(user.role)) {
      const verifiedPayments = demoPayments.filter((p) => p.status === 'verified');
      const totalCollected = verifiedPayments.reduce((sum, p) => sum + p.amount_paid, 0);
      const totalDue = demoUsers.length * 10000;
      const paidByUser = {};
      verifiedPayments.forEach((p) => {
        paidByUser[p.user_id] = (paidByUser[p.user_id] || 0) + p.amount_paid;
      });
      const fullyPaid = Object.values(paidByUser).filter((v) => v >= 10000).length;
      res.json({
        summary: {
          total_collected: totalCollected,
          total_due: totalDue,
          outstanding: totalDue - totalCollected,
          members_total: demoUsers.length,
          members_fully_paid: fullyPaid,
        },
      });
    } else {
      const myPayments = demoPayments.filter((p) => p.user_id === user.id && p.status === 'verified');
      const totalPaid = myPayments.reduce((sum, p) => sum + p.amount_paid, 0);
      res.json({
        summary: {
          total_due: 10000,
          total_paid: totalPaid,
          outstanding: Math.max(0, 10000 - totalPaid),
        },
      });
    }
  });

  app.post('/api/payments', demoAuthenticate, (req, res) => {
    const amount = parseFloat(req.body.amount_paid);
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });
    const payment = {
      id: `p-${crypto.randomUUID().slice(0, 8)}`,
      user_id: req.user.profile.id,
      amount_paid: amount,
      total_due: 10000,
      payment_proof_url: null,
      payment_date: new Date().toISOString().split('T')[0],
      year: 2026,
      status: 'pending',
      admin_note: null,
      verified_by: null,
      created_at: new Date().toISOString(),
    };
    demoPayments.push(payment);
    res.status(201).json({ payment });
  });

  app.patch('/api/payments/:id/verify', demoAuthenticate, (req, res) => {
    if (!['admin', 'exco'].includes(req.user.profile.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const p = demoPayments.find((p) => p.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Payment not found' });
    p.status = req.body.status || 'verified';
    p.admin_note = req.body.admin_note || null;
    p.verified_by = req.user.profile.id;
    res.json({ payment: p });
  });

  // EVENTS
  app.get('/api/events', demoAuthenticate, (req, res) => {
    let events = [...demoEvents];
    if (req.query.upcoming === 'true') {
      events = events.filter((e) => new Date(e.event_date) >= new Date());
    }
    if (req.query.type) events = events.filter((e) => e.type === req.query.type);
    events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    if (req.query.limit) events = events.slice(0, parseInt(req.query.limit));
    res.json({ events });
  });

  app.get('/api/events/:id', demoAuthenticate, (req, res) => {
    const e = demoEvents.find((e) => e.id === req.params.id);
    if (!e) return res.status(404).json({ error: 'Event not found' });
    res.json({ event: e });
  });

  app.post('/api/events', demoAuthenticate, (req, res) => {
    if (!['admin', 'exco'].includes(req.user.profile.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    const event = { id: `e-${crypto.randomUUID().slice(0, 8)}`, ...req.body, created_at: new Date().toISOString() };
    demoEvents.push(event);
    res.status(201).json({ event });
  });

  app.patch('/api/events/:id', demoAuthenticate, (req, res) => {
    if (!['admin', 'exco'].includes(req.user.profile.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    const e = demoEvents.find((e) => e.id === req.params.id);
    if (!e) return res.status(404).json({ error: 'Event not found' });
    Object.assign(e, req.body);
    res.json({ event: e });
  });

  app.delete('/api/events/:id', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const idx = demoEvents.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    demoEvents.splice(idx, 1);
    res.json({ message: 'Event deleted' });
  });

  // NOTIFICATIONS
  app.get('/api/notifications', demoAuthenticate, (req, res) => {
    let notifs = demoNotifications.filter((n) => n.user_id === req.user.profile.id);
    if (req.query.unread_only === 'true') notifs = notifs.filter((n) => !n.read_status);
    notifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ notifications: notifs, pagination: { total: notifs.length, page: 1, limit: 50 } });
  });

  app.patch('/api/notifications/:id/read', demoAuthenticate, (req, res) => {
    const n = demoNotifications.find((n) => n.id === req.params.id);
    if (n) n.read_status = true;
    res.json({ message: 'Marked as read' });
  });

  app.patch('/api/notifications/read-all', demoAuthenticate, (req, res) => {
    demoNotifications.filter((n) => n.user_id === req.user.profile.id).forEach((n) => n.read_status = true);
    res.json({ message: 'All marked as read' });
  });

  app.post('/api/notifications/send', demoAuthenticate, (req, res) => {
    if (!['admin', 'exco'].includes(req.user.profile.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    const { user_id, message, type } = req.body;
    const n = { id: `n-${crypto.randomUUID().slice(0, 8)}`, user_id, message, type: type || 'reminder', read_status: false, created_at: new Date().toISOString() };
    demoNotifications.push(n);
    res.status(201).json({ notification: n });
  });

  // CONSTITUTION
  app.get('/api/constitution', demoAuthenticate, (req, res) => {
    const sorted = [...demoConstitution].sort((a, b) => a.article_number - b.article_number);
    res.json({ articles: sorted });
  });

  app.get('/api/constitution/:id', demoAuthenticate, (req, res) => {
    const c = demoConstitution.find((c) => c.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    const amendments = demoAmendments.filter((a) => a.article_id === c.id);
    res.json({ article: c, amendments });
  });

  app.post('/api/constitution', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const num = demoConstitution.length;
    const c = { id: `c-${crypto.randomUUID().slice(0, 8)}`, ...req.body, article_number: num, version: 1, is_active: true, status: 'approved', created_at: new Date().toISOString() };
    demoConstitution.push(c);
    res.status(201).json({ article: c });
  });

  app.patch('/api/constitution/:id', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const c = demoConstitution.find((c) => c.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    Object.assign(c, req.body);
    res.json({ article: c });
  });

  // AMENDMENTS
  app.get('/api/amendments', demoAuthenticate, (req, res) => {
    let amendments = [...demoAmendments];
    if (req.query.status) amendments = amendments.filter((a) => a.status === req.query.status);
    amendments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ amendments });
  });

  app.post('/api/amendments', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { article_id, proposed_text, reason } = req.body;
    const article = demoConstitution.find((c) => c.id === article_id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    const amendment = {
      id: `am-${crypto.randomUUID().slice(0, 8)}`,
      article_id, article_title: article.title,
      proposed_text, reason: reason || '',
      proposed_by: req.user.profile.id,
      proposed_by_name: req.user.profile.full_name,
      status: 'proposed',
      votes_for: 0, votes_against: 0, voted_by: [],
      created_at: new Date().toISOString(),
    };
    demoAmendments.push(amendment);
    res.status(201).json({ amendment });
  });

  app.post('/api/amendments/:id/vote', demoAuthenticate, (req, res) => {
    const am = demoAmendments.find((a) => a.id === req.params.id);
    if (!am) return res.status(404).json({ error: 'Amendment not found' });
    if (am.status !== 'proposed') return res.status(400).json({ error: 'Amendment is no longer open for voting' });
    if (am.voted_by.includes(req.user.profile.id)) return res.status(400).json({ error: 'You have already voted' });
    const { vote } = req.body; // 'for' or 'against'
    if (vote === 'for') am.votes_for++;
    else am.votes_against++;
    am.voted_by.push(req.user.profile.id);
    res.json({ amendment: am });
  });

  app.post('/api/amendments/:id/approve', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const am = demoAmendments.find((a) => a.id === req.params.id);
    if (!am) return res.status(404).json({ error: 'Amendment not found' });
    am.status = 'approved';
    am.approved_at = new Date().toISOString();
    // Apply the amendment to the article
    const article = demoConstitution.find((c) => c.id === am.article_id);
    if (article) {
      article.content = am.proposed_text;
      article.version = (article.version || 1) + 1;
      article.updated_at = new Date().toISOString();
    }
    res.json({ amendment: am, article });
  });

  app.post('/api/amendments/:id/reject', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const am = demoAmendments.find((a) => a.id === req.params.id);
    if (!am) return res.status(404).json({ error: 'Amendment not found' });
    am.status = 'rejected';
    am.rejected_at = new Date().toISOString();
    res.json({ amendment: am });
  });

  // BIRTHDAYS & CELEBRATIONS
  app.get('/api/birthdays', demoAuthenticate, (req, res) => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const membersWithBdays = demoUsers.filter((u) => u.date_of_birth).map((u) => {
      const dob = new Date(u.date_of_birth);
      const dobMonth = dob.getMonth() + 1;
      const dobDay = dob.getDate();
      const isToday = dobMonth === todayMonth && dobDay === todayDay;
      // Calculate days until next birthday
      let nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
      const daysUntil = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
      const age = today.getFullYear() - dob.getFullYear();
      return { ...u, is_birthday_today: isToday, days_until_birthday: daysUntil, age };
    });
    // Sort by days until birthday (soonest first)
    membersWithBdays.sort((a, b) => a.days_until_birthday - b.days_until_birthday);
    const todayBirthdays = membersWithBdays.filter((m) => m.is_birthday_today);
    const upcoming = membersWithBdays.filter((m) => !m.is_birthday_today && m.days_until_birthday <= 30);
    
    // Anniversaries
    const membersWithAnniv = demoUsers.filter((u) => u.wedding_anniversary).map((u) => {
      const anniv = new Date(u.wedding_anniversary);
      const annivMonth = anniv.getMonth() + 1;
      const annivDay = anniv.getDate();
      const isToday = annivMonth === todayMonth && annivDay === todayDay;
      let nextAnniv = new Date(today.getFullYear(), anniv.getMonth(), anniv.getDate());
      if (nextAnniv < today) nextAnniv.setFullYear(today.getFullYear() + 1);
      const daysUntil = Math.ceil((nextAnniv - today) / (1000 * 60 * 60 * 24));
      const years = today.getFullYear() - anniv.getFullYear();
      return { ...u, is_anniversary_today: isToday, days_until_anniversary: daysUntil, years_married: years };
    });
    membersWithAnniv.sort((a, b) => a.days_until_anniversary - b.days_until_anniversary);
    
    res.json({ today_birthdays: todayBirthdays, upcoming_birthdays: upcoming, all_birthdays: membersWithBdays, anniversaries: membersWithAnniv });
  });

  app.post('/api/birthdays/message', demoAuthenticate, (req, res) => {
    const { user_id } = req.body;
    const member = demoUsers.find((u) => u.id === user_id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    const firstName = member.full_name.split(' ')[0];
    const messages = [
      `🎂 Happy Birthday, dear ${firstName}! 🎉\n\nOn this beautiful day, the entire STOBA 98 family celebrates you! Your warmth, kindness, and dedication to our brotherhood continue to inspire us all. May this new year of your life be filled with abundant blessings, good health, prosperity, and happiness beyond measure.\n\nYou are not just a member — you are family. We cherish you and everything you bring to our association.\n\nWishing you a spectacular birthday! 🎊🥳\n\n— With love, from your STOBA 98 Family ❤️`,
      `🎉 Happiest Birthday, ${firstName}! 🎂\n\nToday we celebrate a wonderful soul! From our days at St. Teresa's College to now, the bond we share only grows stronger. May God bless you beyond your wildest dreams today and always.\n\nMay your pockets never run dry, your health remain strong, and your smile never fade. You deserve all the good things life has to offer!\n\nEnjoy your special day, brother! 🥂✨\n\n— STOBA 98 Family 🤗`,
      `🌟 Happy Birthday, ${firstName}! 🎈\n\nAnother year, another reason to celebrate the amazing person you are! STOBA 98 is blessed to have you as part of this great family. Your contributions, your presence, and your spirit make us stronger.\n\nAs you mark this milestone, may every dream you have come true. May you find joy in the little things and strength for the big challenges. We are with you always!\n\nCheers to you! 🎊🍰\n\n— Your STOBA 98 Brothers 💪❤️`,
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    // Also create a notification
    const n = { id: `n-${crypto.randomUUID().slice(0, 8)}`, user_id, message, type: 'birthday', read_status: false, created_at: new Date().toISOString() };
    demoNotifications.push(n);
    res.json({ message, notification: n });
  });

  app.patch('/api/users/:id/birthday', demoAuthenticate, (req, res) => {
    const u = demoUsers.find((u) => u.id === req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (req.body.date_of_birth) u.date_of_birth = req.body.date_of_birth;
    if (req.body.wedding_anniversary) u.wedding_anniversary = req.body.wedding_anniversary;
    u.updated_at = new Date().toISOString();
    res.json({ user: u });
  });

  // CONTRIBUTIONS
  app.get('/api/contributions', demoAuthenticate, (req, res) => {
    const contribs = demoContributions.map((c) => {
      const payments = demoContributionPayments.filter((p) => p.contribution_id === c.id);
      const verifiedPayments = payments.filter((p) => p.status === 'verified');
      const totalCollected = verifiedPayments.reduce((sum, p) => sum + p.amount_paid, 0);
      const membersPaid = new Set(verifiedPayments.map((p) => p.user_id)).size;
      return { ...c, total_collected: totalCollected, members_paid: membersPaid, total_members: demoUsers.length };
    });
    res.json({ contributions: contribs });
  });

  app.get('/api/contributions/:id', demoAuthenticate, (req, res) => {
    const c = demoContributions.find((x) => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Contribution not found' });
    const payments = demoContributionPayments.filter((p) => p.contribution_id === c.id);
    const memberTracker = demoUsers.map((u) => {
      const userPayments = payments.filter((p) => p.user_id === u.id);
      const verifiedTotal = userPayments.filter((p) => p.status === 'verified').reduce((s, p) => s + p.amount_paid, 0);
      const pendingTotal = userPayments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount_paid, 0);
      return {
        user_id: u.id, full_name: u.full_name, email: u.email, phone: u.phone, role: u.role,
        amount_paid: verifiedTotal, pending_amount: pendingTotal,
        outstanding: Math.max(0, c.target_amount - verifiedTotal),
        fully_paid: verifiedTotal >= c.target_amount,
        payments: userPayments,
      };
    });
    const verifiedPayments = payments.filter((p) => p.status === 'verified');
    const totalCollected = verifiedPayments.reduce((s, p) => s + p.amount_paid, 0);
    res.json({
      contribution: {
        ...c, total_collected: totalCollected,
        total_expected: c.target_amount * demoUsers.length,
        members_paid: memberTracker.filter((m) => m.amount_paid > 0).length,
        members_fully_paid: memberTracker.filter((m) => m.fully_paid).length,
        total_members: demoUsers.length,
      },
      members: memberTracker,
    });
  });

  app.post('/api/contributions', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { title, description, target_amount, deadline } = req.body;
    if (!title || !target_amount) return res.status(400).json({ error: 'Title and target amount required' });
    const contrib = {
      id: 'ct-' + crypto.randomUUID().slice(0, 8), title, description: description || '',
      target_amount: parseFloat(target_amount), deadline: deadline || null,
      status: 'active', created_by: req.user.profile.id, created_at: new Date().toISOString(),
    };
    demoContributions.push(contrib);
    res.status(201).json({ contribution: contrib });
  });

  app.patch('/api/contributions/:id', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const c = demoContributions.find((x) => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    Object.assign(c, req.body, { updated_at: new Date().toISOString() });
    res.json({ contribution: c });
  });

  app.delete('/api/contributions/:id', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const idx = demoContributions.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    demoContributions.splice(idx, 1);
    for (let i = demoContributionPayments.length - 1; i >= 0; i--) {
      if (demoContributionPayments[i].contribution_id === req.params.id) demoContributionPayments.splice(i, 1);
    }
    res.json({ message: 'Deleted' });
  });

  app.post('/api/contributions/:id/pay', demoAuthenticate, (req, res) => {
    const c = demoContributions.find((x) => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Contribution not found' });
    const amount = parseFloat(req.body.amount_paid);
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });
    const cp = {
      id: 'cp-' + crypto.randomUUID().slice(0, 8), contribution_id: c.id,
      user_id: req.user.profile.id, amount_paid: amount,
      payment_date: new Date().toISOString().split('T')[0],
      status: 'pending', admin_note: null, created_at: new Date().toISOString(),
    };
    demoContributionPayments.push(cp);
    res.status(201).json({ payment: cp });
  });

  app.patch('/api/contributions/:cid/payments/:pid/verify', demoAuthenticate, (req, res) => {
    if (!['admin', 'exco'].includes(req.user.profile.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    const p = demoContributionPayments.find((x) => x.id === req.params.pid && x.contribution_id === req.params.cid);
    if (!p) return res.status(404).json({ error: 'Payment not found' });
    p.status = req.body.status || 'verified';
    p.admin_note = req.body.admin_note || null;
    p.verified_by = req.user.profile.id;
    res.json({ payment: p });
  });

  // EXCO
  app.get('/api/exco', demoAuthenticate, (req, res) => {
    res.json({ members: demoExco.filter((e) => e.is_active) });
  });

  app.post('/api/exco', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const x = { id: `x-${crypto.randomUUID().slice(0, 8)}`, ...req.body, is_active: true, created_at: new Date().toISOString() };
    demoExco.push(x);
    res.status(201).json({ member: x });
  });

  app.patch('/api/exco/:id', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const x = demoExco.find((x) => x.id === req.params.id);
    if (!x) return res.status(404).json({ error: 'Not found' });
    Object.assign(x, req.body);
    res.json({ member: x });
  });

  app.delete('/api/exco/:id', demoAuthenticate, (req, res) => {
    if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const x = demoExco.find((x) => x.id === req.params.id);
    if (!x) return res.status(404).json({ error: 'Not found' });
    x.is_active = false;
    res.json({ message: 'Removed' });
  });
}

module.exports = { isDemoMode, mountDemoRoutes };
