import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    const subscription = await db.companySubscription.findUnique({
      where: { companyId },
    })

    if (!subscription) {
      // Return default free plan
      return NextResponse.json({
        record: {
          id: null,
          companyId,
          planName: 'free',
          maxEmployees: 10,
          maxBranches: 1,
          features: JSON.stringify(['basic_hr', 'attendance', 'leave']),
          startDate: null,
          endDate: null,
          billingCycle: 'monthly',
          amount: 0,
          currency: 'USD',
          status: 'active',
          trialEndsAt: null,
          autoRenew: true,
        },
      })
    }

    return NextResponse.json({ record: subscription })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    // Check if subscription already exists
    const existing = await db.companySubscription.findUnique({
      where: { companyId: body.companyId },
    })

    if (existing) {
      // Update instead
      const updated = await db.companySubscription.update({
        where: { companyId: body.companyId },
        data: {
          planName: body.planName || existing.planName,
          maxEmployees: body.maxEmployees || existing.maxEmployees,
          maxBranches: body.maxBranches || existing.maxBranches,
          features: body.features || existing.features,
          startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
          endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
          billingCycle: body.billingCycle || existing.billingCycle,
          amount: body.amount !== undefined ? body.amount : existing.amount,
          currency: body.currency || existing.currency,
          status: body.status || existing.status,
          trialEndsAt: body.trialEndsAt ? new Date(body.trialEndsAt) : existing.trialEndsAt,
          autoRenew: body.autoRenew !== undefined ? body.autoRenew : existing.autoRenew,
        },
      })
      return NextResponse.json(updated)
    }

    const subscription = await db.companySubscription.create({
      data: {
        companyId: body.companyId,
        planName: body.planName || 'free',
        maxEmployees: body.maxEmployees || 10,
        maxBranches: body.maxBranches || 1,
        features: body.features || JSON.stringify(['basic_hr', 'attendance', 'leave']),
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        billingCycle: body.billingCycle || 'monthly',
        amount: body.amount || 0,
        currency: body.currency || 'USD',
        status: body.status || 'active',
        trialEndsAt: body.trialEndsAt ? new Date(body.trialEndsAt) : null,
        autoRenew: body.autoRenew !== undefined ? body.autoRenew : true,
      },
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id && !body.companyId) {
      return NextResponse.json({ error: 'Subscription ID or companyId is required' }, { status: 400 })
    }

    const where = body.id ? { id: body.id } : { companyId: body.companyId }

    const subscription = await db.companySubscription.update({
      where,
      data: {
        ...(body.planName !== undefined && { planName: body.planName }),
        ...(body.maxEmployees !== undefined && { maxEmployees: body.maxEmployees }),
        ...(body.maxBranches !== undefined && { maxBranches: body.maxBranches }),
        ...(body.features !== undefined && { features: body.features }),
        ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.billingCycle !== undefined && { billingCycle: body.billingCycle }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.trialEndsAt !== undefined && { trialEndsAt: body.trialEndsAt ? new Date(body.trialEndsAt) : null }),
        ...(body.autoRenew !== undefined && { autoRenew: body.autoRenew }),
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
