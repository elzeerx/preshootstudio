const PAYPAL_API_BASE = Deno.env.get('PAYPAL_MODE') === 'production' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

interface PayPalAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.statusText}`);
  }

  const data: PayPalAuthResponse = await response.json();
  return data.access_token;
}

export async function paypalRequest(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
  accessToken?: string
): Promise<Response> {
  const token = accessToken || await getPayPalAccessToken();
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  return fetch(`${PAYPAL_API_BASE}${endpoint}`, options);
}
