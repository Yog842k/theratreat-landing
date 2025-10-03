import connectDB from '@/lib/mongodb';
import Therapist from '@/lib/models/Therapist';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const specialization = searchParams.get('specialization');
    const minRating = parseFloat(searchParams.get('minRating')) || 0;
    const maxFee = parseFloat(searchParams.get('maxFee'));
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build query
    const query = { isActive: true };
    if (specialization) {
      query.specializations = { $in: [specialization] };
    }
    if (minRating > 0) {
      query.rating = { $gte: minRating };
    }
    if (maxFee) {
      query.consultationFee = { $lte: maxFee };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    if (sortBy === 'rating') {
      sort.rating = sortOrder;
    } else if (sortBy === 'experience') {
      sort.experience = sortOrder;
    } else if (sortBy === 'fee') {
      sort.consultationFee = sortOrder;
    } else {
      sort[sortBy] = sortOrder;
    }

    // Fetch therapists with user data populated
    const therapists = await Therapist.find(query)
      .populate('userId', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Count total
    const totalCount = await Therapist.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        therapists,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get therapists error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch therapists' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Basic validation
    const { displayName, title, specializations, experience, consultationFee, userId } = body;
    
    if (!displayName || !title || !specializations || !experience || !consultationFee || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if therapist profile already exists for this user
    const existingTherapist = await Therapist.findOne({ userId });
    if (existingTherapist) {
      return NextResponse.json(
        { success: false, message: 'Therapist profile already exists for this user' },
        { status: 400 }
      );
    }

    // Create new therapist profile
    const therapist = new Therapist({
      userId,
      displayName,
      title,
      specializations: Array.isArray(specializations) ? specializations : [specializations],
      experience,
      consultationFee,
      ...body // Include other optional fields
    });

    await therapist.save();

    return NextResponse.json({
      success: true,
      data: { therapist }
    }, { status: 201 });

  } catch (error) {
    console.error('Create therapist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create therapist profile' },
      { status: 500 }
    );
  }
}
