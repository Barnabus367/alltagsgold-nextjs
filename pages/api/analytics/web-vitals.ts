import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, value, id, url } = req.body;
    
    // In production, send to analytics service
    // For now, just log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', { name, value, id, url });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Web Vitals API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
