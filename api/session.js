// /api/session.js
import sessions from './sessions.json' assert { type: 'json' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      session: {
        id: sessionId,
        phoneNumber: session.phoneNumber,
        status: session.status,
        createdAt: session.createdAt,
        linkedAt: session.linkedAt,
        lastActive: session.lastActive,
        country: session.country
      }
    });
  }
  
  if (req.method === 'POST') {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Update last active
    session.lastActive = Date.now();
    
    return res.status(200).json({
      success: true,
      session: {
        id: sessionId,
        status: session.status,
        phoneNumber: session.phoneNumber,
        canAccessDashboard: session.status === 'linked'
      }
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}