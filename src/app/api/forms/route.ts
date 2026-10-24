
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        description,
        published,
        responses,
        questions,
        updated_at AS "updatedAt"
      FROM forms
      ORDER BY updated_at DESC
    `);

    return NextResponse.json({
      success: true,
      forms: result.rows,
    });
  } catch (error) {
    console.error("Fetch forms error:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch forms" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      title,
      description = "",
      published = false,
      responses = 0,
      questions = [],
    } = body;

    if (
      typeof id !== "string" ||
      !id.trim() ||
      typeof title !== "string" ||
      !title.trim() ||
      !Array.isArray(questions)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid form data" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO forms
        (id, title, description, published, responses, questions, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         published = EXCLUDED.published,
         responses = EXCLUDED.responses,
         questions = EXCLUDED.questions,
         updated_at = NOW()
       RETURNING
         id, title, description, published, responses,
         questions, updated_at AS "updatedAt"`,
      [
        id,
        title.trim(),
        description,
        published,
        responses,
        JSON.stringify(questions),
      ]
    );

    return NextResponse.json(
      { success: true, form: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save form error:", error);

    return NextResponse.json(
      { success: false, message: "Could not save form" },
      { status: 500 }
    );
  }
}
