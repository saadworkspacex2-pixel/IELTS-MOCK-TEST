// LHBD IELTS Course Mocks
//
// This installer imports the Reading, Writing and Listening material supplied by
// the course owner. Text is extracted verbatim from the supplied course book;
// question groups with no supplied answer key are kept as reviewable responses
// rather than inventing answers. Writing task diagrams are copied to /public and
// their paths are stored in sections.image_url.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const LHBD_COURSE_LIBRARY_VERSION = "lhbd-course-book-import-2026-10-25-v1";
export const LHBD_COURSE_CATEGORY = "LHBD IELTS Course Mocks";

const sourcePath = fileURLToPath(new URL("./lhbd-course-source.json", import.meta.url));
const sourceClasses = JSON.parse(readFileSync(sourcePath, "utf8"));

const moduleLabel = {
  reading: "Reading",
  writing: "Writing",
  listening: "Listening",
};

function examTitle(item) {
  return `Class ${item.classNumber} ${moduleLabel[item.module]} Mock — ${item.sourceTitle}`;
}

function descriptionFor(item) {
  const topic = item.sourceTitle;
  if (item.module === "writing") {
    return `LHBD IELTS Course Writing Class ${item.classNumber}: ${topic}. Supplied course task material and diagrams are preserved for instructor review. Free for everyone.`;
  }
  if (item.module === "listening") {
    return `LHBD IELTS Course Listening Class ${item.classNumber}: ${topic}. Supplied question material is preserved. No playable source audio was embedded in the provided book files, so this class is kept in review mode. Free for everyone.`;
  }
  return `LHBD IELTS Course Reading Class ${item.classNumber}: ${topic}. Supplied passage and question material is preserved in class order. Free for everyone.`;
}

function instructionFor(item) {
  if (item.module === "writing") {
    return "Use the supplied LHBD course prompt and any task diagrams. Submit your writing for instructor review.";
  }
  if (item.module === "listening") {
    return "Use the supplied LHBD question sheet. The downloaded course book did not contain playable listening audio or a working source-audio link, so this imported class is available for guided/instructor review.";
  }
  return "Answer using the supplied LHBD course reading material. The downloaded book did not include a machine-readable answer key, so responses are submitted for review rather than auto-marked.";
}

function sourceQuestion(group, position) {
  return {
    qtype: "essay",
    text: `${group}\n\nType your numbered responses for this source exercise below.`,
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: 0,
    acceptedAnswers: "",
    explanation: "This source exercise is preserved for instructor review because no answer key was included in the downloaded course files.",
    sortOrder: position + 1,
  };
}

async function insertCourseExam(client, item, sortOrder) {
  const inserted = await client.query(
    `INSERT INTO lhbd_app.exams
      (title,description,category,module,duration_minutes,marks_per_question,negative_mark,is_live,sort_order,rules,access_level)
     VALUES ($1,$2,$3,$4,$5,1,0,true,$6,$7::jsonb,'free')
     RETURNING id`,
    [
      examTitle(item),
      descriptionFor(item),
      LHBD_COURSE_CATEGORY,
      item.module,
      item.module === "listening" ? 32 : 60,
      sortOrder,
      JSON.stringify({
        hideResults: true,
        showExplanations: false,
        sourceImported: true,
        sourcePages: item.sourcePages,
        reviewRequired: true,
      }),
    ],
  );
  const examId = inserted.rows[0].id;

  const section = await client.query(
    `INSERT INTO lhbd_app.sections
      (exam_id,title,passage_title,passage_text,instruction,audio_url,image_url,sort_order)
     VALUES ($1,$2,$3,$4,$5,'',$6,1)
     RETURNING id`,
    [
      examId,
      `Class ${item.classNumber} course source`,
      item.sourceTitle,
      item.sourceText,
      instructionFor(item),
      (item.imageUrls || []).join("\n"),
    ],
  );
  const sectionId = section.rows[0].id;

  // Writing uses its source prompt sheet and answer booklet directly. Its response
  // is stored by the existing writing workflow, so it needs no rendered question.
  if (item.module === "writing") return;

  for (const [index, group] of (item.questionGroups || []).entries()) {
    const question = sourceQuestion(group, index);
    await client.query(
      `INSERT INTO lhbd_app.questions
        (exam_id,section_id,qtype,text,option_a,option_b,option_c,option_d,correct_option,accepted_answers,explanation,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        examId,
        sectionId,
        question.qtype,
        question.text,
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
        question.correctOption,
        question.acceptedAnswers,
        question.explanation,
        question.sortOrder,
      ],
    );
  }
}

export async function applyLhbdCourseMockLibrary(pool) {
  const marker = await pool.query(
    "SELECT value FROM lhbd_app.settings WHERE key = 'lhbd_course_mock_library_version'",
  );
  const wantsReset = process.env.RESET_LHBD_COURSE_MOCKS === "1";
  if (marker.rows[0]?.value === LHBD_COURSE_LIBRARY_VERSION && !wantsReset) {
    console.log("✓ LHBD IELTS Course Mock library is already installed.");
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (wantsReset) {
      // Course mock attempts/sessions must be removed before their exams. This reset
      // is opt-in and only affects this exact course category.
      await client.query(`
        DELETE FROM lhbd_app.attempts
        WHERE exam_id IN (SELECT id FROM lhbd_app.exams WHERE category = $1)
      `, [LHBD_COURSE_CATEGORY]);
      await client.query(`
        DELETE FROM lhbd_app.exam_sessions
        WHERE exam_id IN (SELECT id FROM lhbd_app.exams WHERE category = $1)
      `, [LHBD_COURSE_CATEGORY]);
      await client.query(
        "DELETE FROM lhbd_app.exams WHERE category = $1",
        [LHBD_COURSE_CATEGORY],
      );
    }

    // A previous, incomplete version cannot coexist with this import. Only remove
    // rows carrying this installer marker, never hand-authored course-category rows.
    if (!wantsReset && marker.rows[0]?.value && marker.rows[0]?.value !== LHBD_COURSE_LIBRARY_VERSION) {
      await client.query(`
        DELETE FROM lhbd_app.attempts
        WHERE exam_id IN (
          SELECT id FROM lhbd_app.exams
          WHERE category = $1 AND rules->>'sourceImported' = 'true'
        )
      `, [LHBD_COURSE_CATEGORY]);
      await client.query(`
        DELETE FROM lhbd_app.exam_sessions
        WHERE exam_id IN (
          SELECT id FROM lhbd_app.exams
          WHERE category = $1 AND rules->>'sourceImported' = 'true'
        )
      `, [LHBD_COURSE_CATEGORY]);
      await client.query(`
        DELETE FROM lhbd_app.exams
        WHERE category = $1 AND rules->>'sourceImported' = 'true'
      `, [LHBD_COURSE_CATEGORY]);
    }

    const maxPosition = await client.query(
      "SELECT COALESCE(MAX(sort_order), 0) AS position FROM lhbd_app.exams",
    );
    let sortOrder = Number(maxPosition.rows[0]?.position || 0);
    for (const item of sourceClasses) {
      sortOrder += 1;
      await insertCourseExam(client, item, sortOrder);
    }

    await client.query(
      `INSERT INTO lhbd_app.settings (key,value)
       VALUES ('lhbd_course_mock_library_version',$1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [LHBD_COURSE_LIBRARY_VERSION],
    );
    await client.query("COMMIT");
    console.log("✓ Installed 10 LHBD Reading, 10 Writing, and 5 Listening course mocks.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
