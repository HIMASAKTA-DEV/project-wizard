import jsPDF from "jspdf";

export async function generateProjectPDF(data: any, sessionId: string) {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let cursorY = 25;
    let pageNum = 1;

    const checkPageEnd = (neededHeight: number) => {
        if (cursorY + neededHeight > pageHeight - 30) {
            drawFooter();
            doc.addPage();
            pageNum++;
            cursorY = 25;
            drawGraphics();
            return true;
        }
        return false;
    };

    const drawFooter = () => {
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text("ProjectWizard | Dokumen Teknis", margin, pageHeight - 15);
        doc.text(`Halaman ${pageNum}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
        doc.text("Platform by HIMASAKTA-DEV", pageWidth / 2, pageHeight - 20, { align: 'center' });
    };

    const drawGraphics = () => {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.1);
        doc.line(margin, 15, pageWidth - margin, 15);
        doc.setFillColor(245, 245, 245);
        doc.circle(pageWidth, 0, 40, 'F');
    };

    drawGraphics();

    // Header
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`SESSION: ${sessionId}`, pageWidth - margin, 12, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, margin, 12);

    // Title
    doc.setFontSize(26);
    doc.setTextColor(30, 30, 30);
    const splitTitle = doc.splitTextToSize(data.title || "PROJECT BLUEPRINT", pageWidth - (margin * 2));
    doc.text(splitTitle, margin, cursorY);
    cursorY += (splitTitle.length * 10) + 10;

    // I. VISI & STRATEGI
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("I. VISI & STRATEGI", margin, cursorY);
    cursorY += 8;
    doc.setLineWidth(0.5);
    doc.setDrawColor(50, 100, 255);
    doc.line(margin, cursorY, margin + 40, cursorY);
    cursorY += 10;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const splitPitch = doc.splitTextToSize(data.pitch || "No pitch provided.", pageWidth - (margin * 2));
    doc.text(splitPitch, margin, cursorY);
    cursorY += (splitPitch.length * 6) + 15;

    // II. TUJUAN UTAMA
    if (data.objectives) {
        checkPageEnd(30);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("II. TUJUAN UTAMA", margin, cursorY);
        cursorY += 10;
        doc.setFontSize(11);
        data.objectives.forEach((obj: string) => {
            checkPageEnd(10);
            doc.text(`• ${obj}`, margin + 5, cursorY);
            cursorY += 7;
        });
        cursorY += 10;
    }

    // III. DETAIL TEKNIS DIVISI (BREAKDOWN)
    if (data.technicalDetail) {
        const detail = data.technicalDetail;

        // --- UI/UX ---
        checkPageEnd(50);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("III. DETAIL DIVISI UI/UX", margin, cursorY);
        cursorY += 10;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Aset & Desain:", margin + 5, cursorY);
        cursorY += 7;
        doc.setFont("helvetica", "normal");
        (detail.uiux?.assets || []).forEach((asset: string) => {
            checkPageEnd(10);
            doc.text(`- ${asset}`, margin + 10, cursorY);
            cursorY += 6;
        });
        cursorY += 4;

        checkPageEnd(20);
        doc.setFont("helvetica", "bold");
        doc.text("Filosofi & Target:", margin + 5, cursorY);
        cursorY += 7;
        doc.setFont("helvetica", "normal");
        const luxInfo = `Filosofi: ${detail.uiux?.philosophy || '-'} \nTarget: ${detail.uiux?.targetUsers || '-'}`;
        const splitLux = doc.splitTextToSize(luxInfo, pageWidth - (margin * 2) - 10);
        doc.text(splitLux, margin + 5, cursorY);
        cursorY += (splitLux.length * 6) + 10;

        // --- BACKEND ---
        checkPageEnd(50);
        doc.setFontSize(14);
        doc.text("IV. DETAIL DIVISI BACKEND (BE)", margin, cursorY);
        cursorY += 10;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("API Routes & Responses:", margin + 5, cursorY);
        cursorY += 7;
        doc.setFont("helvetica", "normal");
        (detail.be?.routes || []).forEach((route: any) => {
            const rText = `[${route.method}] ${route.path} -> Targets: ${route.response}`;
            const splitR = doc.splitTextToSize(rText, pageWidth - (margin * 2) - 20);
            checkPageEnd((splitR.length * 6) + 2);
            doc.text(splitR, margin + 10, cursorY);
            cursorY += (splitR.length * 6);
        });
        cursorY += 5;

        checkPageEnd(30);
        doc.setFont("helvetica", "bold");
        doc.text("Sistem Akun & Keamanan:", margin + 5, cursorY);
        cursorY += 7;
        doc.setFont("helvetica", "normal");
        const authText = doc.splitTextToSize(detail.be?.authSystem || "N/A", pageWidth - (margin * 2) - 15);
        doc.text(authText, margin + 10, cursorY);
        cursorY += (authText.length * 6) + 5;

        checkPageEnd(30);
        doc.setFont("helvetica", "bold");
        doc.text("Fitur Utama (API):", margin + 5, cursorY);
        cursorY += 7;
        doc.setFont("helvetica", "normal");
        (detail.be?.apiFeatures || []).forEach((f: string) => {
            checkPageEnd(8);
            doc.text(`- ${f}`, margin + 10, cursorY);
            cursorY += 6;
        });
        cursorY += 10;

        // --- FRONTEND ---
        checkPageEnd(50);
        doc.setFontSize(14);
        doc.text("V. DETAIL DIVISI FRONTEND (FE)", margin, cursorY);
        cursorY += 10;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Detail Halaman & Konten:", margin + 5, cursorY);
        cursorY += 7;
        doc.setFont("helvetica", "normal");
        (detail.fe?.pageDetails || []).forEach((p: any) => {
            const pText = `Halaman: ${p.page}\nIsi: ${(p.content || []).join(', ')}`;
            const splitP = doc.splitTextToSize(pText, pageWidth - (margin * 2) - 20);
            checkPageEnd((splitP.length * 6) + 4);
            doc.text(splitP, margin + 10, cursorY);
            cursorY += (splitP.length * 6) + 4;
        });

        checkPageEnd(20);
        doc.setFont("helvetica", "bold");
        doc.text("Flow Halaman & UI Features:", margin + 5, cursorY);
        cursorY += 7;
        doc.setFont("helvetica", "normal");
        const feInfo = `Flow: ${detail.fe?.pageFlow || '-'} \nUI Features: ${(detail.fe?.uiFeatures || []).join(', ')}`;
        const splitFe = doc.splitTextToSize(feInfo, pageWidth - (margin * 2) - 15);
        doc.text(splitFe, margin + 10, cursorY);
        cursorY += (splitFe.length * 6) + 15;
    }

    // SPRINT PLAN (6 WEEKS)
    if (data.sprintPlan) {
        checkPageEnd(30);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("VI. RENCANA IMPLEMENTASI (ROADMAP)", margin, cursorY);
        cursorY += 15;

        data.sprintPlan.forEach((sprint: any) => {
            const tasks = (sprint.tasks || []);
            const totalH = 10 + (tasks.length * 6) + 10;
            checkPageEnd(totalH);

            doc.setFontSize(12);
            doc.setTextColor(50, 50, 50);
            doc.text(`Minggu ${sprint.week}:`, margin + 5, cursorY);
            cursorY += 7;

            doc.setFontSize(10);
            doc.setTextColor(110, 110, 110);
            doc.setFont("helvetica", "normal");
            tasks.forEach((task: string) => {
                doc.text(`- ${task}`, margin + 12, cursorY);
                cursorY += 6;
            });
            cursorY += 5;
        });
    }

    drawFooter();
    return doc;
}
