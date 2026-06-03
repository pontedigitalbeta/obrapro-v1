import { createRoot } from "react-dom/client";
import { createElement } from "react";
import type { Orcamento, Cliente, Empresa } from "@/lib/types";
import { PropostaA4 } from "@/components/proposta-a4";

export async function gerarOrcamentoPdf(
  orcamento: Orcamento,
  cliente: Cliente | undefined,
  empresa: Empresa,
) {
  // off-screen host
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#fff;z-index:-1;";
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    root.render(createElement(PropostaA4, { orcamento, cliente, empresa }));
    // wait for layout + fonts + images
    await new Promise((r) => setTimeout(r, 250));
    if (document.fonts && document.fonts.ready) {
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

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas-pro"),
      import("jspdf"),
    ]);

    const canvas = await html2canvas(target, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    const safeCli = (cliente?.nome ?? "cliente").replace(/\s+/g, "_");
    pdf.save(`Orcamento_${orcamento.numero}_${safeCli}.pdf`);
  } finally {
    setTimeout(() => {
      try { root.unmount(); } catch { /* noop */ }
      host.remove();
    }, 0);
  }
}
