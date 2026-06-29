// PadhAI Push Notification API - Add to web app
// src/app/api/push-notifications/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { Expo } from "expo-server-sdk"

const expo = new Expo()

interface PushPayload { userId: string; title: string; body: string; data?: Record<string, string> }

async function sendPushNotification(token: string, title: string, body: string, data?: Record<string, string>) {
    if (!Expo.isExpoPushToken(token)) return false
    try {
        await expo.sendPushNotificationsAsync([{ to: token, title, body, data }])
        return true
    } catch (e) {
        console.error("Push notification error:", e)
        return false
    }
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get("secret")
    if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { userId, title, body, data }: PushPayload = await req.json()
    if (!userId || !title || !body) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const supabase = await createClient()

    // Get user's push tokens
    const { data: tokens } = await supabase
        .from("push_tokens")
        .select("expo_push_token")
        .eq("user_id", userId)
        .eq("is_active", true)

    if (!tokens?.length) return NextResponse.json({ sent: 0 })

    let sent = 0
    for (const { expo_push_token } of tokens) {
        const success = await sendPushNotification(expo_push_token, title, body, data)
        if (success) sent++
    }

    return NextResponse.json({ sent, total: tokens.length })
}