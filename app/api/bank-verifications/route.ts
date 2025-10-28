import { NextResponse } from 'next/server';
import { encrypt, maskAccount } from '@/lib/crypto';
import dbConnect from '@/lib/mongodb.js';
import BankVerification from '@/lib/models/BankVerification.js';
import MicroDeposit from '@/lib/models/MicroDeposit.js';

// POST /api/bank-verifications
export async function POST(req: Request) {
  await dbConnect();
  const { account_number, ifsc, account_name, method = 'lookup' } = await req.json();
  if (!account_number || !ifsc) return NextResponse.json({ error: 'missing' }, { status: 400 });
  // TODO: Get userId from session/auth
  const userId = 'demo-user-id';

  const verification = await BankVerification.create({
    userId,
    accountNumberEncrypted: encrypt(account_number),
    ifsc,
    accountName: account_name,
    method,
    status: 'initiated',
  });

  if (method === 'lookup') {
    try {
      const taskId = `verify_${Date.now()}`;
      const createTask = await fetch('https://api.idfy.com/v3/tasks/async/verify_with_source/ind_bank_account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.IDFY_API_KEY}`
        },
        body: JSON.stringify({
          task_id: taskId,
          data: { account_number, ifsc_code: ifsc }
        })
      });

      const taskResp = await createTask.json();

      // Poll task status after 4 seconds
      await new Promise(r => setTimeout(r, 4000));

      const statusResp = await fetch(`https://api.idfy.com/v3/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${process.env.IDFY_API_KEY}` }
      });
      const result = await statusResp.json();

      const bankResult = result.result?.response?.bank_result || 'UNKNOWN';
      const nameAtBank = result.result?.response?.name_at_bank || null;

      let status = 'failed';
      if (bankResult === 'ACCOUNT_FOUND') status = 'verified';
      else if (bankResult === 'ACCOUNT_NOT_FOUND') status = 'failed';
      else status = 'pending';

      verification.provider = 'idfy';
      verification.meta = result;
      verification.status = status;
      await verification.save();

      return NextResponse.json({
        id: verification._id,
        status,
        name_at_bank: nameAtBank
      });

    } catch (err) {
      console.error('IDfy error:', err);
      verification.status = 'pending';
      await verification.save();
      return NextResponse.json({ id: verification._id, status: 'pending', message: 'Provider error' });
    }
  }
  // else if micro_deposit: enqueue worker (not implemented here)
  return NextResponse.json({ id: verification._id, status: 'initiated' });
}

// GET /api/bank-verifications/:id
export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  const verification = await BankVerification.findById(id);
  if (!verification) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(verification);
}

// PATCH /api/bank-verifications/:id/confirm-micro
export async function PATCH(req: Request) {
  await dbConnect();
  const { id, amounts } = await req.json();
  // Find verification and deposits, compare amounts
  // ...existing code...
  return NextResponse.json({ status: 'not_implemented' });
}
