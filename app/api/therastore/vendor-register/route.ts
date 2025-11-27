import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'companyName', 'businessType', 'gstin', 'pan', 'address', 
      'state', 'city', 'pincode', 'contactPersonName', 'email', 'phone',
      'primaryProductCategory', 'brandsRepresented', 'productCount',
      'accountName', 'accountNumber', 'ifscCode', 'bankName',
      'gstCertificate', 'panCard', 'businessRegistrationProof',
      'infoAccurate', 'authorizeListing'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate product images
    if (!body.productImages || body.productImages.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Minimum 5 product images required' },
        { status: 400 }
      );
    }

    // Validate IEC number for importers
    if (body.businessType === 'Importer' && !body.iecNumber) {
      return NextResponse.json(
        { success: false, message: 'IEC Number is required for Importers' },
        { status: 400 }
      );
    }

    // Connect to database
    await database.connect();
    const vendorsCollection = await database.getCollection('therastore_vendors');

    // Check if vendor already exists with same email or GSTIN
    const existingVendor = await vendorsCollection.findOne({
      $or: [
        { email: body.email.toLowerCase() },
        { gstin: body.gstin }
      ]
    });

    if (existingVendor) {
      return NextResponse.json(
        { success: false, message: 'Vendor with this email or GSTIN already exists' },
        { status: 409 }
      );
    }

    // Create vendor document
    const vendorData = {
      ...body,
      email: body.email.toLowerCase(),
      status: 'pending', // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null
    };

    // Insert into database
    const result = await vendorsCollection.insertOne(vendorData);

    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        message: 'Vendor registration submitted successfully',
        data: {
          vendorId: result.insertedId.toString(),
          status: 'pending'
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to save vendor registration' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Vendor registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

