import { NextResponse } from "next/server";
import { extractResumeFields } from "@/lib/llm/extractResume";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ status: "error", error: "file is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  let text: string;
  try {
    if (isPdf) {
      const { PDFParse } = await import("pdf-parse");
      const { getPath } = await import("pdf-parse/worker");
      PDFParse.setWorker(getPath());
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      text = result.text;
    } else {
      const mammoth = (await import("mammoth")).default;
      text = (await mammoth.extractRawText({ buffer })).value;
    }
  } catch (err) {
    console.error("resume text extraction failed:", err);
    return NextResponse.json(
      { status: "error", error: `Couldn't read ${file.name} — is it a valid PDF or DOCX?` },
      { status: 422 }
    );
  }

  // DOCX has no native multimodal path, so it needs extractable text. A
  // scanned/image-only PDF (empty pdf-parse text) is let through rather
  // than erroring — see lib/llm/extractResume.ts on why that degrades to
  // mostly-null fields instead of being read natively right now.
  if (!text.trim() && !isPdf) {
    return NextResponse.json({ status: "error", error: "No extractable text found in the file" }, { status: 422 });
  }

  const fields = await extractResumeFields({ text });
  return NextResponse.json({ status: "ok", data: { fields } });
}
