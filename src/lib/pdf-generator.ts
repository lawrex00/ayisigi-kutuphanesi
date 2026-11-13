import PDFDocument from "pdfkit";
import type { BookWithChapters } from "./db/queries";

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function generateBookPdf(book: BookWithChapters): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      info: {
        Title: book.title,
        Author: book.author,
        Subject: book.summary || book.title,
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Cover page
    doc.fontSize(28).text(book.title, { align: "center" });
    doc.moveDown(2);
    doc.fontSize(14).fillColor("#8B7355").text(book.author, { align: "center" });
    doc.fillColor("#000000");

    if (book.summary) {
      doc.moveDown(3);
      doc.fontSize(11).text(book.summary, { align: "center" });
    }

    doc.addPage();

    // Table of contents
    doc.fontSize(18).text("İçindekiler", { align: "center" });
    doc.moveDown(1.5);
    doc.fontSize(11);
    for (const ch of book.chapters) {
      doc.text(`${ch.order}. ${ch.title}`);
      doc.moveDown(0.3);
    }

    // Chapters
    for (const ch of book.chapters) {
      doc.addPage();
      doc.fontSize(20).text(ch.title, { align: "center" });
      doc.moveDown(1.5);
      doc.fontSize(11);

      const text = stripHtml(ch.content);
      doc.text(text, { align: "justify", lineGap: 4 });
    }

    doc.end();
  });
}
