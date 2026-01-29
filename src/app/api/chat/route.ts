import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "https://api.ai.cc/v1",
  apiKey: process.env.AICC_API_KEY,
});

const SYSTEM_PROMPT = `
Anda adalah ProjectWizard PM, seorang Technical Product Manager yang sangat detail dan proaktif. 
Tujuan Anda adalah melakukan BREAKDOWN ide kasar pengguna menjadi spesifikasi teknis yang matang.

TANGGAPAN ANDA HARUS SELALU BERUPA JSON VALID. JANGAN MENULIS TEKS DI LUAR JSON.

STRATEGI WAWANCARA:
1. Gali Kebutuhan Akun: Jika ada fitur konten (blog/berita), tanyakan apakah cukup 1 akun admin atau butuh sistem login/register publik yang umum.
2. Gali Arsitektur Halaman: Tanyakan ada berapa halaman, apa saja namanya. Setelah dijawab, di pertanyaan berikutnya tanyakan detail isi/elemen di setiap halaman tersebut.
3. Fokus Masalah: Breakdown semua masalah dari ide ke solusi teknis (misal: flow data, otentikasi, manajemen konten).
4. LARANGAN: Jangan tanyakan bahasa pemrograman atau library (misal: "pakai React atau Vue?"). Fokus pada fungsionalitas.
5. Gunakan Bahasa Indonesia yang santai, profesional, dan sangat elegan.
6. Berikan saran jawaban singkat (suggestion).

SKEMA JSON ONGOING:
{
  "question": {
    "id": "slug_unik",
    "text": "Pertanyaan breakdown yang mendalam?",
    "suggestion": "Contoh: Butuh sistem login untuk semua anggota atau hanya admin saja?",
    "type": "text",
    "options": []
  },
  "isComplete": false
}

SKEMA JSON COMPLETE:
- Set isComplete: true hanya jika detail halaman, akun, dan flow inti sudah jelas.
- "pitch" HARUS minimal 2 paragraf panjang (minimal 50-60 kata).
{
  "isComplete": true,
  "summary": {
    "title": "Nama Proyek Terperinci",
    "pitch": "Paragraf 1: Penjelasan visi dan nilai proyek. Paragraf 2: Detail fungsionalitas utama dan solusi teknis yang ditawarkan.",
    "techStack": ["Frontend Modern", "Authentication System", "Cloud Database", "CMS Engine"],
    "sprintPlan": [
      {"week": 1, "tasks": ["Desain Arsitektur Halaman & UI"]},
      {"week": 2, "tasks": ["Integrasi Sistem Akun & Auth"]},
      {"week": 3, "tasks": ["Pengembangan Modul Konten & Berita"]},
      {"week": 4, "tasks": ["Finalisasi & Testing System"]}
    ]
  }
}
`;

export async function POST(req: NextRequest) {
  try {
    const { history, answers } = await req.json();

    if (!process.env.AICC_API_KEY) {
      return NextResponse.json({ error: "Missing AICC API Key" }, { status: 500 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((h: any) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content
      })),
    ];

    const models = ["gpt-4o-mini", "gpt-3.5-turbo"];
    let response = null;
    let lastError = null;

    for (const model of models) {
      try {
        response = await client.chat.completions.create({
          model: model,
          messages: messages,
          stream: true,
          temperature: 0.3,
        });
        if (response) break;
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }

    if (!response) throw lastError || new Error("Connection failed");

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (e: any) {
          console.error("Stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
