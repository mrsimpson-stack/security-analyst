// /api/verify.js
import sessions from './sessions.json' assert { type: 'json' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { code, sessionId } = req.body;
    
    if (!code && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Enter code or session ID'
      });
    }
    
    // Find session by code or sessionId
    let session = null;
    
    if (code) {
      const cleanCode = code.replace(/-/g, '').toUpperCase();
      for (const [sid, sess] of sessions.entries()) {
        if (sess.code === cleanCode) {
          session = sess;
          sessionId = sid;
          break;
        }
      }
    } else if (sessionId) {
      session = sessions.get(sessionId);
    }
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }
    
    // Check if expired
    if (Date.now() > session.expiresAt) {
      sessions.delete(sessionId);
      return res.status(400).json({
        success: false,
        error: 'Code has expired. Generate a new one.'
      });
    }
    
    // Mark as linked
    session.status = 'linked';
    session.linkedAt = Date.now();
    session.lastActive = Date.now();
    
    return res.status(200).json({
      success: true,
      message: '✅ WhatsApp linked successfully!',
      sessionId: sessionId,
      phoneNumber: session.phoneNumber,
      linkedAt: session.linkedAt,
      dashboardUrl: `/dashboard?session=${sessionId}`,
      features: [
        '📱 Send/Receive Messages',
        '💾 Message History',
        '📷 Media Download',
        '🤖 Auto-Reply System',
        '📤 Chat Export',
        '🔔 Notifications',
        '📊 Statistics',
        '⚡ Real-time Updates'
      ]
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
}