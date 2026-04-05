const { supabaseAdmin } = require('../config/supabase');

function getCelebrationData(users) {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const birthdays = [];
  const anniversaries = [];

  for (const u of users) {
    // Birthday
    if (u.date_of_birth) {
      const dob = new Date(u.date_of_birth + 'T00:00:00');
      const bMonth = dob.getMonth() + 1;
      const bDay = dob.getDate();
      const isToday = bMonth === todayMonth && bDay === todayDay;

      // Days until next birthday
      let next = new Date(today.getFullYear(), bMonth - 1, bDay);
      if (next < today && !isToday) {
        next = new Date(today.getFullYear() + 1, bMonth - 1, bDay);
      }
      const daysUntil = isToday ? 0 : Math.ceil((next - today) / (1000 * 60 * 60 * 24));

      birthdays.push({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        avatar_url: u.avatar_url,
        date_of_birth: u.date_of_birth,
        is_birthday_today: isToday,
        days_until_birthday: daysUntil,
        birth_month: bMonth,
        birth_day: bDay,
      });
    }

    // Anniversary
    if (u.wedding_anniversary) {
      const wa = new Date(u.wedding_anniversary + 'T00:00:00');
      const aMonth = wa.getMonth() + 1;
      const aDay = wa.getDate();
      const aYear = wa.getFullYear();
      const isToday = aMonth === todayMonth && aDay === todayDay;
      const yearsMarried = today.getFullYear() - aYear;

      let next = new Date(today.getFullYear(), aMonth - 1, aDay);
      if (next < today && !isToday) {
        next = new Date(today.getFullYear() + 1, aMonth - 1, aDay);
      }
      const daysUntil = isToday ? 0 : Math.ceil((next - today) / (1000 * 60 * 60 * 24));

      anniversaries.push({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        avatar_url: u.avatar_url,
        wedding_anniversary: u.wedding_anniversary,
        is_anniversary_today: isToday,
        days_until_anniversary: daysUntil,
        years_married: yearsMarried,
      });
    }
  }

  // Sort by days until
  birthdays.sort((a, b) => a.days_until_birthday - b.days_until_birthday);
  anniversaries.sort((a, b) => a.days_until_anniversary - b.days_until_anniversary);

  return { birthdays, anniversaries };
}

const birthdayController = {
  /**
   * GET /api/birthdays — All celebrations data
   */
  getAll: async (req, res, next) => {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email, phone, avatar_url, date_of_birth, wedding_anniversary')
        .eq('is_active', true);

      if (error) return res.status(400).json({ error: error.message });

      const { birthdays, anniversaries } = getCelebrationData(users);

      const todayBirthdays = birthdays.filter(b => b.is_birthday_today);
      const upcomingBirthdays = birthdays.filter(b => !b.is_birthday_today && b.days_until_birthday <= 30);

      res.json({
        today_birthdays: todayBirthdays,
        upcoming_birthdays: upcomingBirthdays,
        all_birthdays: birthdays,
        anniversaries,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/birthdays/upcoming — This week's celebrations (next 7 days)
   */
  getUpcoming: async (req, res, next) => {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email, phone, avatar_url, date_of_birth, wedding_anniversary')
        .eq('is_active', true);

      if (error) return res.status(400).json({ error: error.message });

      const { birthdays, anniversaries } = getCelebrationData(users);

      const weekBirthdays = birthdays.filter(b => b.days_until_birthday <= 7);
      const weekAnniversaries = anniversaries.filter(a => a.days_until_anniversary <= 7);

      res.json({
        birthdays: weekBirthdays,
        anniversaries: weekAnniversaries,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/birthdays/message — Send birthday message
   */
  sendMessage: async (req, res, next) => {
    try {
      const { user_id } = req.body;
      const sender = req.user.profile;

      const { data: recipient, error } = await supabaseAdmin
        .from('users')
        .select('full_name')
        .eq('id', user_id)
        .single();

      if (error || !recipient) return res.status(404).json({ error: 'User not found' });

      // Create a notification
      await supabaseAdmin.from('notifications').insert({
        user_id,
        title: '🎂 Birthday Wishes!',
        message: `Happy Birthday! ${sender.full_name} and the STOBA 98 family wish you a wonderful birthday celebration!`,
        type: 'reminder',
      });

      res.json({ message: `Birthday message sent to ${recipient.full_name}!` });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = birthdayController;
