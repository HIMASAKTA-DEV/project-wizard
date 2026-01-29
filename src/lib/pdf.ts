import jsPDF from "jspdf";

export async function generateProjectPDF(data: any, sessionId: string) {
    const doc = new jsPDF();
    const margin = 20;
    let cursorY = 20;

    // Header
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`SESSION_ID: ${sessionId}`, 190, 10, { align: 'right' });
    doc.text(`ProjectWizard Blueprint | Generated: ${new Date().toLocaleString('id-ID')}`, margin, 10);

    // Title
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text((data.title || "Untitled Project").toUpperCase(), margin, cursorY);
    cursorY += 15;

    // Pitch (2 paragraphs handled by auto split)
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const splitPitch = doc.splitTextToSize(data.pitch || "No pitch provided.", 170);
    doc.text(splitPitch, margin, cursorY);
    cursorY += (splitPitch.length * 7) + 15;

    // Tech Stack / Modules
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("ARSITEKTUR & FITUR UTAMA", margin, cursorY);
    cursorY += 10;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    (data.techStack || []).forEach((item: string) => {
        doc.text(`• ${item}`, margin + 5, cursorY);
        cursorY += 7;
    });
    cursorY += 15;

    // Sprint Plan
    if (data.sprintPlan && data.sprintPlan.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("ESTIMASI RENCANA KERJA", margin, cursorY);
        cursorY += 10;
        data.sprintPlan.forEach((sprint: any) => {
            doc.setFontSize(12);
            doc.setTextColor(50, 50, 50);
            doc.text(`Minggu ${sprint.week}:`, margin + 5, cursorY);
            cursorY += 7;
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            (sprint.tasks || []).forEach((task: string) => {
                doc.text(`- ${task}`, margin + 12, cursorY);
                cursorY += 6;
            });
            cursorY += 4;
        });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text("Dokumen ini dihasilkan secara otomatis oleh ProjectWizard AI. Segala keputusan teknis harus divalidasi oleh engineer.", margin, 280);
    doc.text("Platform by HIMASAKTA-DEV", 190, 280, { align: 'right' });

    return doc;
}
