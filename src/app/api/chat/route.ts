import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "https://api.ai.cc/v1",
  apiKey: process.env.AICC_API_KEY,
});

const SYSTEM_PROMPT = `
Anda adalah ProjectWizard PM, seorang Technical Product Manager Senior yang sangat detail dan visioner. 
Tugas Anda adalah melakukan BREAKDOWN ide kasar pengguna menjadi cetak biru teknis yang sangat komprehensif.

TANGGAPAN ANDA HARUS SELALU BERUPA JSON VALID. JANGAN MENULIS TEKS DI LUAR JSON.

STRATEGI WAWANCARA:
1. Gali Arsitektur Halaman: Tanyakan ada berapa halaman, apa saja namanya. Setelah dijawab, di pertanyaan berikutnya tanyakan detail isi/elemen di setiap halaman tersebut.
2. Fokus Masalah: Breakdown semua yang dikatakan user hingga ditemukan solusi teknis (misal: flow data, otentikasi, manajemen konten).
3. Gali Kebutuhan Akun: Jika ada fitur konten (blog/berita), tanyakan apakah cukup 1 superadmin atau butuh sistem login/register publik yang umum.
4. LARANGAN: Jangan tanyakan teknis koding seperti bahasa pemrograman atau library. Fokus pada fungsionalitas dan arsitektur produk.
5. Gunakan Bahasa Indonesia yang santai, profesional, dan sangat elegan.

SKEMA JSON ONGOING:
{
  "question": {
    "id": "slug_unik",
    "text": "Pertanyaan breakdown yang mendalam?",
    "suggestion": "Contoh: Bagaimana alur pengunggahan konten oleh admin?",
    "type": "text",
    "options": []
  },
  "isComplete": false
}

SKEMA JSON COMPLETE:
- "pitch" HARUS minimal 3 paragraf.
- "technicalDetail" HARUS berisi breakdown untuk 3 divisi: UIUX, BE, FE.

{
  "isComplete": true,
  "summary": {
    "title": "Nama Proyek",
    "pitch": "Minimal 3 paragraf panjang.",
    "objectives": ["Objektif 1", "Objektif 2"],
    "technicalDetail": {
        "uiux": {
            "assets": ["Logo", "Icon set", "Hero Illustration"],
            "philosophy": "Penjelasan filosofi desain yang diusung.",
            "targetUsers": "Informasi target pengguna yang mengakses web."
        },
        "be": {
            "routes": [{"path": "/api/v1/posts", "method": "GET", "response": "{ data: [...] }"}],
            "authSystem": "Skema sistem akun dan izin role (jika ada).",
            "requestFlow": "Penjelasan flow request dari client ke server.",
            "apiFeatures": ["CRUD Berita", "Otentikasi JWT"]
        },
        "fe": {
            "pageFlow": "Flow perpindahan halaman.",
            "pageDetails": [{"page": "Home", "content": ["Hero section", "Latest news list"]}],
            "uiFeatures": ["Dynamic Sidebar", "Dark Mode"]
        }
    },
    "techStack": ["Stack 1", "Stack 2"],
    "sprintPlan": [
      {"week": 1, "tasks": ["Task 1", "Task 2"]}
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

    const models = ["x-ai/grok-4-1-fast-reasoning", "google/gemma-3n-e4b-it", "gpt-4o-mini", "gpt-3.5-turbo"];
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
