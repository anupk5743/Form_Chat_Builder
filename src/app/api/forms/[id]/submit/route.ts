
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { PoolClient } from "pg";

type Question = {
  id: string;
  title: string;
  type: string;
  required?: boolean;
  options?: string[];
};

type Answers = Record<string, unknown>;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let client: PoolClient | undefined;
  let transactionStarted = false;

  try {
    const body = (await request.json()) as { answers?: Answers };
    const answers = body.answers;

    if (
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid answers." },
        { status: 400 }
      );
    }

    client = await pool.connect();

    const formResult = await client.query(
      `SELECT id, title, description, questions
       FROM forms
       WHERE id = $1 AND published = TRUE`,
      [id]
    );

    if (formResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Form not found or not published." },
        { status: 404 }
      );
    }

    const form = formResult.rows[0];
    const questions = form.questions as Question[];

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, message: "Form questions are invalid." },
        { status: 500 }
      );
    }

    const allowedIds = new Set(questions.map((q) => q.id));

    for (const key of Object.keys(answers)) {
      if (!allowedIds.has(key)) {
        return NextResponse.json(
          { success: false, message: "Unexpected answer field." },
          { status: 400 }
        );
      }
    }

    for (const question of questions) {
      const value = answers[question.id];
      const empty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (question.required && empty) {
        return NextResponse.json(
          {
            success: false,
            message: `Please answer: ${question.title}`,
          },
          { status: 400 }
        );
      }

      if (empty) continue;

      if (["text", "textarea", "email", "date"].includes(question.type)) {
        if (typeof value !== "string") {
          return NextResponse.json(
            { success: false, message: `Invalid answer: ${question.title}` },
            { status: 400 }
          );
        }

        if (
          question.type === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          return NextResponse.json(
            { success: false, message: `Enter a valid email for: ${question.title}` },
            { status: 400 }
          );
        }
      } else if (question.type === "number") {
        if (
          !(
            (typeof value === "number" && Number.isFinite(value)) ||
            (typeof value === "string" &&
              value.trim() !== "" &&
              Number.isFinite(Number(value)))
          )
        ) {
          return NextResponse.json(
            { success: false, message: `Enter a valid number for: ${question.title}` },
            { status: 400 }
          );
        }
      } else if (["radio", "select"].includes(question.type)) {
        if (
          typeof value !== "string" ||
          !(question.options ?? []).includes(value)
        ) {
          return NextResponse.json(
            { success: false, message: `Choose a valid option for: ${question.title}` },
            { status: 400 }
          );
        }
      } else if (question.type === "checkbox") {
        if (
          !Array.isArray(value) ||
          !value.every(
            (item) =>
              typeof item === "string" &&
              (question.options ?? []).includes(item)
          )
        ) {
          return NextResponse.json(
            { success: false, message: `Choose valid options for: ${question.title}` },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, message: `Unsupported question type: ${question.type}` },
          { status: 400 }
        );
      }
    }

    client.release();
    client = undefined;

    // Start a transaction for saving the submission and incrementing the count.
    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    // Recheck publication status while holding a row lock.
    const lockedForm = await client.query(
      `SELECT id
       FROM forms
       WHERE id = $1 AND published = TRUE
       FOR UPDATE`,
      [id]
    );

    if (lockedForm.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "This form is no longer published." },
        { status: 404 }
      );
    }

    await client.query(
      `INSERT INTO submissions (id, form_id, answers, submitted_at)
       VALUES (gen_random_uuid(), $1, $2::jsonb, NOW())`,
      [id, JSON.stringify(answers)]
    );

    await client.query(
      `UPDATE forms
       SET responses = COALESCE(responses, 0) + 1
       WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json({
      success: true,
      message: "Response submitted successfully.",
    });
  } catch (error) {
    if (client && transactionStarted) {
      await client.query("ROLLBACK").catch(() => undefined);
    }

    console.error("Submit form error:", error);

    return NextResponse.json(
      { success: false, message: "Could not submit response." },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}
