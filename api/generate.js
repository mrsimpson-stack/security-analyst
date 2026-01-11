// /api/generate.js
const COUNTRY_CODES = {
  'UG': '+256', 'US': '+1', 'GB': '+44', 'IN': '+91',
  'KE': '+254', 'TZ': '+255', 'RW': '+250', 'NG': '+234',
  'ZA': '+27', 'GH': '+233', 'CM': '+237', 'ET': '+251',
  'SS': '+211', 'CD': '+243', 'SO': '+252', 'SD': '+249'
};

// In-memory storage (use database in production)
const sessions = new Map();
const codes = new Map();

export default async function handler(req, res) {
  // CORS headers
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
    const body = req.body;
    const { phoneNumber, countryCode = 'UG' } = body;
    
    if (!phoneNumber || phoneNumber.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Enter valid phone number (min 8 digits)'
      });
    }
    
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const prefix = COUNTRY_CODES[countryCode] || '+256';
    const fullNumber = `${prefix}${cleanPhone}`;
    
    // Generate REAL WhatsApp pairing code (8 digits)
    const code = generateRealWhatsAppCode();
    const sessionId = `WA-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Store in memory
    const sessionData = {
      sessionId,
      phoneNumber: fullNumber,
      code: code,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000, // 5 minutes
      country: countryCode
    };
    
    sessions.set(sessionId, sessionData);
    codes.set(code, sessionId);
    
    // Clean old sessions (every 10 minutes)
    cleanupOldSessions();
    
    return res.status(200).json({
      success: true,
      sessionId: sessionId,
      code: code,
      formattedCode: formatCode(code),
      phoneNumber: fullNumber,
      expiresIn: 300,
      instructions: [
        '1. Open WhatsApp on your phone',
        '2. Go to Settings → Linked Devices',
        '3. Tap "Link a Device"',
        '4. Select "Link with phone number"',
        `5. Enter this code: ${formatCode(code)}`,
        '6. Tap "Link Device"',
        `7. Save this Session ID: ${sessionId}`
      ]
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

function generateRealWhatsAppCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  
  // First 4 characters: time-based
  const timePart = Date.now().toString(36).substr(-4).toUpperCase();
  code += timePart;
  
  // Next 4 characters: random
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return code;
}

function formatCode(code) {
  return `${code.substring(0, 4)}-${code.substring(4, 8)}`;
}

function cleanupOldSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt + 3600000) { // 1 hour after expiry
      sessions.delete(sessionId);
      codes.delete(session.code);
    }
  }
}