export async function sendDiscordMessage(content: string, embed?: any) {
    try {
        await fetch('/api/discord', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,
                embeds: embed ? [embed] : undefined,
            }),
        });
    } catch (error) {
        console.error("Failed to send Discord message:", error);
    }
}

export async function sendDiscordFile(formData: FormData) {
    try {
        await fetch('/api/discord', {
            method: 'POST',
            body: formData, // Browser handles multipart headers automatically
        });
    } catch (error) {
        console.error("Failed to send Discord file:", error);
    }
}
