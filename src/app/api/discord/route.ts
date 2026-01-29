import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type");
        const webhookUrl = "https://discord.com/api/webhooks/1466435495360856267/H1nbk9ur-x-12znXJkAKxxeI5U2Spd_Klq-MfqJOpHcXnTY4UFsGD1nuFJqy-FkWv75z";

        if (contentType?.includes("multipart/form-data")) {
            const formData = await req.formData();
            const response = await fetch(webhookUrl, {
                method: "POST",
                body: formData,
            });
            return NextResponse.json({ success: response.ok });
        } else {
            const body = await req.json();
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            return NextResponse.json({ success: response.ok });
        }
    } catch (error: any) {
        console.error("Discord Proxy Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
