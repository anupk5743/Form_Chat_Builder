import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const formResult = await pool.query(
      `SELECT id, title, published, questions
       FROM forms
       WHERE id = $1`,
      [id]
    );

    if (formResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Form not found." },
        { status: 404 }
      );
    }

    const form = formResult.rows[0];

    const submissionsResult = await pool.query(
      `SELECT id, answers, submitted_at AS "submittedAt"
       FROM public.submissions
       WHERE form_id = $1
       ORDER BY submitted_at DESC NULLS LAST`,
      [id]
    );

    return NextResponse.json({
      success: true,
      form,
      responses: submissionsResult.rows,
    });
  } catch (error) {
    console.error("Fetch form responses error:", error);

    return NextResponse.json(
      { success: false, message: "Could not load form responses." },
      { status: 500 }
    );
  }
}