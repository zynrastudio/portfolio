import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { auditSchema } from "@/lib/types/audit";
import {
  stageOptions,
  productTypeOptions,
  timelineOptions,
  investingIntentOptions,
} from "@/lib/types/audit";

const resend = new Resend(process.env.RESEND_API_KEY);

function getStageLabel(value: string): string {
  return stageOptions.find((o) => o.value === value)?.label ?? value;
}
function getProductTypeLabels(values: string[]): string {
  return values
    .map((v) => productTypeOptions.find((o) => o.value === v)?.label ?? v)
    .join(", ");
}
function getTimelineLabel(value: string): string {
  return timelineOptions.find((o) => o.value === value)?.label ?? value;
}
function getInvestingIntentLabel(value: string): string {
  return investingIntentOptions.find((o) => o.value === value)?.label ?? value;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = auditSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }

    const textContent = [
      "New AI Product Activation Audit request",
      "",
      "Email: " + data.email,
      "Website: " + data.websiteUrl,
      "",
      "What are you building:",
      data.whatBuilding,
      "",
      "Stage: " + getStageLabel(data.stage),
      "Product type: " + getProductTypeLabels(data.productType),
      "",
      "Biggest bottleneck:",
      data.biggestBottleneck,
      "",
      "Timeline: " + getTimelineLabel(data.timeline),
      "Open to investing: " + getInvestingIntentLabel(data.investingIntent),
    ].join("\n");

    const htmlContent = `
<table role="presentation" width="100%" style="font-family: Arial, sans-serif;">
  <tr><td style="padding: 0 0 24px 0; border-bottom: 1px solid #eee;"><h1 style="margin: 0; font-size: 22px; font-weight: 400;">New AI Product Activation Audit Request</h1></td></tr>
  <tr><td style="padding: 24px 0;">
    <p><strong>Email:</strong> <a href="mailto:${data.email}">${escapeHtml(data.email)}</a></p>
    <p><strong>Website:</strong> <a href="${data.websiteUrl}">${escapeHtml(data.websiteUrl)}</a></p>
    <p><strong>What are you building:</strong></p><p>${escapeHtml(data.whatBuilding)}</p>
    <p><strong>Stage:</strong> ${escapeHtml(getStageLabel(data.stage))}</p>
    <p><strong>Product type:</strong> ${escapeHtml(getProductTypeLabels(data.productType))}</p>
    <p><strong>Biggest bottleneck:</strong></p><p>${escapeHtml(data.biggestBottleneck)}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(getTimelineLabel(data.timeline))}</p>
    <p><strong>Open to investing:</strong> ${escapeHtml(getInvestingIntentLabel(data.investingIntent))}</p>
  </td></tr>
</table>`;

    const { error } = await resend.emails.send({
      from: "Zynra Studio <contact@zynra.studio>",
      to: "contact@zynra.studio",
      replyTo: data.email,
      subject: "New AI Product Activation Audit Request",
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
