/**
 * Builds the CV .docx file from CV_DATA using the `docx` library.
 * buildCvDocument() has no browser dependencies, so it also runs on Node.
 */
(function (root) {
  const ACCENT = "1F4E79";
  const MUTED = "595959";
  // A4: 11906 twips wide, 1134-twip (2cm) left/right margins → 9638-twip content width.
  const CONTENT_WIDTH = 9638;

  function buildCvDocument(docx, data, ui, lang) {
    const {
      Document, Paragraph, TextRun, ExternalHyperlink, AlignmentType,
      BorderStyle, TabStopType, LevelFormat,
    } = docx;

    const common = data.common;
    const cv = data[lang];
    const labels = ui[lang].docx;

    const heading = (text) =>
      new Paragraph({
        spacing: { before: 280, after: 120 },
        keepNext: true,
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 2 } },
        children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: ACCENT, characterSpacing: 20 })],
      });

    const bullet = (text) =>
      new Paragraph({
        numbering: { reference: "cv-bullets", level: 0 },
        spacing: { after: 40 },
        children: [new TextRun(text)],
      });

    // Row with a title on the left and a right-aligned period.
    const titleRow = (left, right) =>
      new Paragraph({
        keepNext: true,
        spacing: { before: 160, after: 20 },
        tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
        children: [
          new TextRun({ text: left, bold: true, size: 22 }),
          new TextRun({ text: `\t${right}`, color: MUTED }),
        ],
      });

    const subRow = (text) =>
      new Paragraph({
        keepNext: true,
        spacing: { after: 60 },
        children: [new TextRun({ text, italics: true, color: MUTED })],
      });

    const labeled = (label, value) =>
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value)],
      });

    const link = (url) =>
      new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text: url.replace(/^https?:\/\/(www\.)?/, ""), style: "Hyperlink" })],
      });

    const sep = () => new TextRun({ text: "  |  ", color: MUTED });

    const children = [];

    // --- Header ---
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: common.name, bold: true, size: 40, color: ACCENT })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: cv.title, size: 26, color: MUTED })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun(cv.location), sep(),
          new TextRun(common.phone), sep(),
          new ExternalHyperlink({
            link: `mailto:${common.email}`,
            children: [new TextRun({ text: common.email, style: "Hyperlink" })],
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [common.linkedin, common.github, common.website]
          .filter(Boolean)
          .flatMap((url, i) => (i ? [sep(), link(url)] : [link(url)])),
      })
    );

    // --- Summary ---
    children.push(heading(labels.summary), new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun(cv.summary)] }));

    // --- Skills ---
    children.push(heading(labels.skills));
    cv.skills.forEach((s) => children.push(labeled(s.group, s.items.join(", "))));

    // --- Experience ---
    children.push(heading(labels.experience));
    cv.experience.forEach((job) => {
      children.push(titleRow(job.role, job.period), subRow(`${job.company} · ${job.location}`));
      if (job.description) children.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun(job.description)] }));
      job.highlights.forEach((h) => children.push(bullet(h)));
      if (job.stack?.length) children.push(labeled(labels.techStack, job.stack.join(", ")));
    });

    // --- Projects ---
    children.push(heading(labels.projects));
    cv.projects.forEach((p) => {
      children.push(
        new Paragraph({
          keepNext: true,
          spacing: { before: 120, after: 20 },
          children: [new TextRun({ text: p.name, bold: true, size: 22 })],
        }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun(p.description)] })
      );
      p.highlights.forEach((h) => children.push(bullet(h)));
      if (p.stack?.length) children.push(labeled(labels.techStack, p.stack.join(", ")));
    });

    // --- Education ---
    children.push(heading(labels.education));
    cv.education.forEach((e) => {
      children.push(titleRow(e.school, e.period), subRow(e.detail ? `${e.degree} · ${e.detail}` : e.degree));
    });

    // --- Certifications ---
    if (cv.certifications?.length) {
      children.push(heading(labels.certifications));
      cv.certifications.forEach((c) =>
        children.push(
          new Paragraph({
            numbering: { reference: "cv-bullets", level: 0 },
            spacing: { after: 40 },
            children: [new TextRun({ text: c.name, bold: true }), new TextRun({ text: ` — ${c.issuer}, ${c.year}`, color: MUTED })],
          })
        )
      );
    }

    // --- Languages ---
    if (cv.languages?.length) {
      children.push(heading(labels.languages));
      cv.languages.forEach((l) => children.push(labeled(l.name, l.level)));
    }

    return new Document({
      creator: common.name,
      title: `CV - ${common.name}`,
      description: `${cv.title} CV (${lang.toUpperCase()})`,
      styles: {
        default: { document: { run: { font: "Calibri", size: 21 }, paragraph: { spacing: { line: 276 } } } },
      },
      numbering: {
        config: [
          {
            reference: "cv-bullets",
            levels: [
              {
                level: 0,
                format: LevelFormat.BULLET,
                text: "•",
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 360, hanging: 240 } } },
              },
            ],
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1000, bottom: 1000, left: 1134, right: 1134 },
            },
          },
          children,
        },
      ],
    });
  }

  function cvFileName(data, lang) {
    const slug = data.common.name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    return `CV_${slug}_${lang.toUpperCase()}.docx`;
  }

  /** Generates and downloads the .docx file in the browser. */
  async function downloadCvDocx(lang) {
    if (!root.docx) throw new Error("docx library not loaded");
    const doc = buildCvDocument(root.docx, CV_DATA, UI_STRINGS, lang);
    const blob = await root.docx.Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cvFileName(CV_DATA, lang);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  root.CvDocx = { buildCvDocument, cvFileName, downloadCvDocx };
  if (typeof module !== "undefined") module.exports = root.CvDocx;
})(typeof window !== "undefined" ? window : globalThis);
