import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/*
  Twilio <Dial><Sip> TwiML Generator for 100ms SIP Interconnect
  ------------------------------------------------------------
  This endpoint returns TwiML instructing Twilio Voice to connect a PSTN caller
  into a 100ms room via SIP Interconnect.

  Security:
    - Protect this endpoint using an internal shared secret header (x-internal-auth)
      matching process.env.SIP_TWIML_SHARED_SECRET.
    - (Optional) You can also verify Twilio request signatures if exposing publicly.

  Request (POST or GET):
    query/body params:
      roomCode   (required)  - The 100ms room code (NOT room_id) the caller should join.
      displayName(optional)  - Name shown for SIP peer (URL encoded will be handled).
      userId     (optional)  - Internal user identifier.

  Example TwiML produced:
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Dial>
        <Sip username="<HMS_SIP_USERNAME>" password="<HMS_SIP_PASSWORD>">
          sip:ROOMCODE@sip.100ms.live?X-100ms-Display-Name=John%20Doe&X-100ms-UserID=abc123
        </Sip>
      </Dial>
    </Response>

  Notes:
    - Ensure your 100ms account is SIP whitelisted and you have valid SIP credentials.
    - Twilio phone number webhook should point to this endpoint (e.g., /api/sip/twiml?roomCode=XXXX&displayName=Caller).
*/

function xmlEscape(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }

async function handle(req: NextRequest) {
  const url = new URL(req.url);
  let body: any = {};
  if (req.method === 'POST') {
    try { body = await req.json(); } catch { body = {}; }
  }
  const roomCode = (url.searchParams.get('roomCode') || body.roomCode || '').trim();
  const displayName = (url.searchParams.get('displayName') || body.displayName || '').trim();
  const userId = (url.searchParams.get('userId') || body.userId || '').trim();

  const authHeader = req.headers.get('x-internal-auth');
  const shared = (process.env.SIP_TWIML_SHARED_SECRET || '').trim();
  if (shared && authHeader !== shared) {
    return xmlResponse(401, `<Response><Reject/></Response>`);
  }

  if (!process.env.HMS_SIP_USERNAME || !process.env.HMS_SIP_PASSWORD) {
    return xmlResponse(500, `<Response><Say>Server not configured for SIP</Say></Response>`);
  }
  if (!roomCode) {
    return xmlResponse(400, `<Response><Say>Missing room code</Say></Response>`);
  }

  const params: string[] = [];
  if (displayName) params.push(`X-100ms-Display-Name=${encodeURIComponent(displayName)}`);
  if (userId) params.push(`X-100ms-UserID=${encodeURIComponent(userId)}`);
  const queryStr = params.length ? `?${params.join('&')}` : '';

  const sipUsername = xmlEscape(process.env.HMS_SIP_USERNAME);
  const sipPassword = xmlEscape(process.env.HMS_SIP_PASSWORD);
  const sipAddress = `sip:${encodeURIComponent(roomCode)}@sip.100ms.live${queryStr}`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Dial>\n    <Sip username="${sipUsername}" password="${sipPassword}">${xmlEscape(sipAddress)}</Sip>\n  </Dial>\n</Response>`;

  return xmlResponse(200, twiml);
}

function xmlResponse(status: number, xml: string) {
  return new NextResponse(xml, { status, headers: { 'Content-Type': 'application/xml' } });
}
