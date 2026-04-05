const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = process.env.DAILY_DOMAIN || 'stoba98';
const DAILY_API_URL = 'https://api.daily.co/v1';

const meetingController = {
  /**
   * POST /api/meetings/room — Create or get a Daily.co room
   * Body: { name: 'STOBA98-General' }
   */
  createRoom: async (req, res, next) => {
    try {
      if (!DAILY_API_KEY) {
        return res.status(500).json({ error: 'Daily.co API key not configured' });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Room name is required' });
      }

      const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 64);

      // Try to get existing room first
      const getRes = await fetch(`${DAILY_API_URL}/rooms/${sanitized}`, {
        headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
      });

      if (getRes.ok) {
        const room = await getRes.json();
        return res.json({
          url: room.url,
          name: room.name,
          created: false,
        });
      }

      // Create new room — expires in 24 hours
      const createRes = await fetch(`${DAILY_API_URL}/rooms`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitized,
          properties: {
            exp: Math.floor(Date.now() / 1000) + 86400, // 24h expiry
            max_participants: 50,
            enable_chat: true,
            enable_screenshare: true,
            enable_knocking: false,
            start_audio_off: true,
            start_video_off: false,
          },
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        return res.status(createRes.status).json({ error: err.error || 'Failed to create room' });
      }

      const room = await createRes.json();
      res.status(201).json({
        url: room.url,
        name: room.name,
        created: true,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/meetings/config — Return public config (domain only, no key)
   */
  getConfig: async (_req, res) => {
    res.json({
      configured: !!DAILY_API_KEY,
      domain: DAILY_DOMAIN,
    });
  },
};

module.exports = meetingController;
