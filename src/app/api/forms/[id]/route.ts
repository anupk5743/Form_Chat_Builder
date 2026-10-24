import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT id, title, description, questions
       FROM forms
       WHERE id = $1 AND published = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Form not found or not published." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      form: result.rows[0],
    });
  } catch (error) {
    console.error("GET /api/forms/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Could not load form." },
      { status: 500 }
    );
  }
}