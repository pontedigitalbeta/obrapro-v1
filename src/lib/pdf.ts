import { createRoot } from "react-dom/client";
import { createElement } from "react";
import type { Orcamento, Cliente, Empresa } from "@/lib/types";
import { PropostaA4 } from "@/components/proposta-a4";

// A4 @ 96dpi
const A4_W_PX = 794;
const A4_H_PX = 1123;
// margins in mm (jsPDF unit)
const MARGIN_TOP_MM = 12;
const MARGIN_BOTTOM_MM = 14;
const A4_W_MM = 210;
const A4_H_MM = 297;

export async function gerarOrcamentoPdf(
  orcamento: Orcamento,
  cliente: Cliente | undefined,
  empresa: Empresa,
) {
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${A4_W_PX}px;background:#fff;z-index:-1;padding:24px;box-sizing:border-box;font-family:Inter,system-ui,sans-serif;color:#1e293b;`;
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    root.render(createElement(PropostaA4, { orcamento, cliente, empresa }));
    await new Promise((r) => setTimeout(r, 300));
    if (document.fonts?.ready) {
      try { await document.fonts.ready; } catch { /* noop */ }
    }
    const imgs = Array.from(host.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            })
      )
    );

    const target = host.firstElementChild as HTMLElement | null;
    if (!target) throw new Error("Falha ao renderizar proposta");

    const scale = 2;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas-pro"),
      import("jspdf"),
    ]);

    const canvas = await html2canvas(target, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight,
    });

    // Collect safe break boundaries (Y in canvas px, after each block/row ends)
    const targetTop = target.getBoundingClientRect().top;
    const boundaries = new Set<number>([0]);
    const nodes = target.querySelectorAll<HTMLElement>("[data-pdf-block], [data-pdf-row]");
    nodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      const top = Math.max(0, Math.round((r.top - targetTop) * scale));
      const bottom = Math.round((r.bottom - targetTop) * scale);
      boundaries.add(top);
      boundaries.add(bottom);
    });
    boundaries.add(canvas.height);
    const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pxPerMm = canvas.width / A4_W_MM; // canvas px per mm of pdf width
    const usableHeightPx = (A4_H_MM - MARGIN_TOP_MM - MARGIN_BOTTOM_MM) * pxPerMm;

    // Build pages: walk boundaries, pick the largest boundary <= cursor+usable
    const pageSlices: Array<{ start: number; end: number }> = [];
    let cursor = 0;
    while (cursor < canvas.height) {
      const limit = cursor + usableHeightPx;
      let next = -1;
      for (let i = sortedBoundaries.length - 1; i >= 0; i--) {
        const b = sortedBoundaries[i];
        if (b > cursor && b <= limit) { next = b; break; }
      }
      // No boundary found in window → force-cut at limit (block bigger than page)
      if (next === -1) next = Math.min(canvas.height, Math.ceil(limit));
      if (next <= cursor) next = Math.min(canvas.height, cursor + Math.ceil(usableHeightPx));
      pageSlices.push({ start: cursor, end: next });
      cursor = next;
    }

    const totalPages = pageSlices.length;

    pageSlices.forEach((slice, idx) => {
      const sliceHeight = slice.end - slice.start;
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, slice.start, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);

      if (idx > 0) pdf.addPage();

      const imgWidthMm = A4_W_MM;
      const imgHeightMm = sliceHeight / pxPerMm;
      const yMm = MARGIN_TOP_MM;
      pdf.addImage(imgData, "JPEG", 0, yMm, imgWidthMm, imgHeightMm, undefined, "FAST");

      // Repeat header from page 2
      if (idx > 0) {
        pdf.setDrawColor(217, 119, 6);
        pdf.setLineWidth(0.4);
        pdf.line(8, MARGIN_TOP_MM - 4, A4_W_MM - 8, MARGIN_TOP_MM - 4);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(30, 41, 59);
        pdf.text(truncate(empresa.nome, 60), 8, MARGIN_TOP_MM - 6);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 116, 139);
        const right = `Proposta Nº ${orcamento.numero}`;
        pdf.text(right, A4_W_MM - 8, MARGIN_TOP_MM - 6, { align: "right" });
      }

      // Footer
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.2);
      pdf.line(8, A4_H_MM - MARGIN_BOTTOM_MM + 4, A4_W_MM - 8, A4_H_MM - MARGIN_BOTTOM_MM + 4);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      const footerLeft = truncate(`${empresa.nome} · ${empresa.telefone}`, 80);
      pdf.text(footerLeft, 8, A4_H_MM - MARGIN_BOTTOM_MM + 8);
      pdf.text(`Página ${idx + 1} de ${totalPages}`, A4_W_MM - 8, A4_H_MM - MARGIN_BOTTOM_MM + 8, { align: "right" });
    });

    const safeCli = (cliente?.nome ?? "cliente").replace(/\s+/g, "_");
    pdf.save(`Orcamento_${orcamento.numero}_${safeCli}.pdf`);
  } finally {
    setTimeout(() => {
      try { root.unmount(); } catch { /* noop */ }
      host.remove();
    }, 0);
  }
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
