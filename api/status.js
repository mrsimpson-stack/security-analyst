// /api/status.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({
    status: 'online',
    service: 'WhatsApp Linker API',
    version: '1.0.0',
    timestamp: Date.now(),
    endpoints: [
      '/api/generate - Generate pairing code',
      '/api/verify - Verify and link',
      '/api/session - Get session status',
      '/api/status - Health check'
    ],
    supportedCountries: ['UG', 'US', 'GB', 'IN', 'KE', 'TZ', 'RW', 'NG', 'ZA', 'GH']
  });
}