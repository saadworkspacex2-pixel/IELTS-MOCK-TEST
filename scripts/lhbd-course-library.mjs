// LHBD IELTS Course Mocks
//
// This installer imports the Reading, Writing and Listening material supplied by
// the course owner. Text is extracted verbatim from the supplied course book;
// question groups with no supplied answer key are kept as reviewable responses
// rather than inventing answers. Writing task diagrams are copied to /public and
// their paths are stored in sections.image_url.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const LHBD_COURSE_LIBRARY_VERSION = "lhbd-course-book-import-2026-10-25-v3-typed-questions";
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

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index);
const letters = (from, to) => range(from.charCodeAt(0), to.charCodeAt(0)).map((code) => String.fromCharCode(code));

// The source book has several scanned/visual layouts. This map was inspected
// against every source class so a student gets the input method the source
// actually asks for, not a catch-all essay box.
const COURSE_QUESTION_PLANS = {
  "reading:1": [
    { type: "gap", numbers: range(1, 9), group: 0, hint: "Complete the summary. Type the required letter or word for blank {n}." },
    { type: "ynng", numbers: range(10, 13), group: 0 },
  ],
  "reading:2": [
    { type: "tfng", numbers: range(5, 10), group: 0 },
    { type: "matching", numbers: range(11, 13), group: 1 },
    { type: "gap", numbers: range(10, 13), group: 2, hint: "Complete honeybee flow-chart blank {n}." },
  ],
  "reading:3": [
    { type: "matching", numbers: range(1, 5), group: 0, choices: ["A. Mayra Diaz", "B. Pietra Rivoli", "C. Oakdene Hollins", "D. Susan Strasser"] },
    { type: "multiple", numbers: [6], group: 1, together: true, hint: "Questions 6–8: choose THREE consequences from the source list." },
    { type: "gap", numbers: range(9, 13), group: 2 },
  ],
  "reading:4": [
    { type: "mcq", numbers: range(28, 30), group: 0 },
    { type: "matching", numbers: range(31, 34), group: 1 },
    { type: "gap", numbers: range(35, 40), group: 2 },
  ],
  "reading:5": [
    { type: "matching", numbers: range(1, 4), group: 0, choices: ["A. Mark VanDam", "B. Nairan Ramirez-Esparza", "C. Linda Polka"] },
    { type: "gap", numbers: range(5, 10), group: 1 },
    { type: "matching", numbers: range(11, 13), group: 2, choices: letters("A", "F") },
  ],
  "reading:6": [
    { type: "tfng", numbers: range(1, 5), group: 0 },
    { type: "gap", numbers: range(6, 13), group: 1 },
  ],
  "reading:7": [
    { type: "gap", numbers: range(1, 3), group: 0 },
    { type: "matching", numbers: range(4, 10), group: 1, choices: ["A. Rodomiro Ortiz", "B. David Mclaughlin", "C. Emile Frison", "D. Ronald Romero", "E. Luadir Gasparotto", "F. Geoff Hawtin"] },
    { type: "tfng", numbers: range(11, 13), group: 2 },
    { type: "matching", numbers: range(1, 4), group: 3, choices: letters("A", "F"), hint: "Early Childhood Education: choose the paragraph letter for item {n}." },
    { type: "matching", numbers: range(5, 10), group: 4, choices: letters("A", "D"), hint: "Early Childhood Education: classify source item {n}." },
    { type: "ynng", numbers: range(11, 13), group: 5, hint: "Early Childhood Education: choose YES, NO or NOT GIVEN for statement {n}." },
  ],
  "reading:8": [
    { type: "matching", numbers: range(14, 18), group: 0 },
    { type: "gap", numbers: range(19, 22), group: 1 },
    { type: "gap", numbers: range(23, 26), group: 2 },
    { type: "gap", numbers: range(32, 36), group: 3, hint: "Job Sharing: complete note {n}." },
    { type: "tfng", numbers: range(37, 40), group: 4, hint: "Job Sharing: choose TRUE, FALSE or NOT GIVEN for statement {n}." },
  ],
  "reading:9": [
    { type: "matching", numbers: range(14, 20), group: 0, choices: ["i. The areas and artefacts within the pyramid itself", "ii. A difficult task for those involved", "iii. A king who saved his people", "iv. A single certainty among other less definite facts", "v. An overview of the external buildings and areas", "vi. A pyramid design that others copied", "vii. An idea for changing the design of burial structures", "viii. An incredible experience despite the few remains", "ix. The answers to some unexpected questions"] },
    { type: "gap", numbers: range(21, 24), group: 1 },
    { type: "multiple", numbers: [25], group: 2, together: true, hint: "Questions 25–26: choose TWO letters from the source list." },
  ],
  "reading:10": [
    { type: "tfng", numbers: range(1, 7), group: 0 },
    { type: "gap", numbers: range(8, 13), group: 1 },
  ],
  "listening:1": [
    { type: "gap", numbers: range(1, 10), group: 0, hint: "Student Interview: complete form item {n}." },
    { type: "gap", numbers: range(11, 20), group: 0, hint: "Ten ways to slow down your life: complete item {n}." },
    { type: "gap", numbers: range(6, 10), group: 2, hint: "Doxey's Model: complete summary item {n}." },
  ],
  "listening:2": [
    { type: "gap", numbers: range(1, 10), group: 0, hint: "School Trip Information: complete form item {n}." },
    { type: "mcq", numbers: [11, 12, 14, 15], group: 0 },
    { type: "matching", numbers: range(16, 20), group: 2 },
    { type: "gap", numbers: range(31, 40), group: 3 },
  ],
  "listening:3": [
    { type: "mcq", numbers: range(11, 16), group: 0, source: "full" },
    { type: "gap", numbers: range(17, 20), group: 1, hint: "Anglia Sculpture Park: write the correct source letter for item {n}." },
  ],
  "listening:4": [
    { type: "mcq", numbers: range(21, 25), group: 0, source: "full" },
    { type: "matching", numbers: range(26, 30), group: 1, choices: ["A. excellent", "B. acceptable", "C. poor"] },
    { type: "gap", numbers: range(31, 40), group: 1, source: "full", hint: "Investigating Taste: complete table item {n}." },
  ],
  "listening:5": [
    { type: "gap", numbers: range(1, 10), group: 0, source: "full", hint: "Theatre Royal Plymouth: complete form item {n}." },
    { type: "multiple", numbers: [11], group: 0, source: "full", together: true, hint: "Choose TWO programme topics from the source list.", choices: ["A. taking notes in a lecture", "B. taking part in a discussion", "C. writing a letter of enquiry", "D. preparing a job application", "E. understanding body language", "F. complaining on the telephone"] },
    { type: "gap", numbers: range(13, 20), group: 0, source: "full", hint: "The Golden Rules of Listening: complete item {n}." },
  ],
};

function clean(value) {
  return value.replace(/\[Source book page \d+\]/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function numberedBlock(source, number) {
  const matches = [...source.matchAll(/^[^A-Za-z0-9]*?(\d{1,2})\s*[.)]?\s+(?=\S)/gm)];
  const at = matches.findIndex((match) => Number(match[1]) === number);
  if (at < 0) return "";
  const start = matches[at].index ?? 0;
  const end = at + 1 < matches.length ? (matches[at + 1].index ?? source.length) : source.length;
  return clean(source.slice(start, end));
}

function optionChunks(source) {
  const choices = [];
  for (const rawLine of clean(source).split("\n")) {
    const line = rawLine.trim();
    // The PDF alternates between normal bullets, a private-use bullet and
    // compact A ... B ... C ... lines. Split every real choice marker.
    const markers = [...line.matchAll(/(?:^|\s)([A-I](?:[.)])?|[a-i][.)]|(?:ix|iv|v?i{1,3}|x)[.)]?)\s+/g)];
    if (markers.length === 0) continue;
    for (let index = 0; index < markers.length; index++) {
      const marker = markers[index];
      const start = (marker.index ?? 0) + marker[0].length;
      const end = index + 1 < markers.length ? (markers[index + 1].index ?? line.length) : line.length;
      const label = marker[1].replace(/[.)]/g, "").toUpperCase();
      const value = line.slice(start, end).trim();
      if (value.length > 1) choices.push(`${label}. ${value}`);
    }
  }
  return [...new Set(choices)].filter((choice) => choice.length > 3 && choice.length < 320);
}

function questionAndChoices(source, number) {
  const block = numberedBlock(source, number);
  if (!block) return { text: "", choices: [] };
  const choices = optionChunks(block);
  let text = block;
  const starts = choices
    .map((choice) => text.indexOf(choice.replace(/^[A-Z]+\.\s*/i, "")))
    .filter((index) => index >= 0);
  if (starts.length > 0) {
    const firstChoice = Math.min(...starts);
    text = text.slice(0, firstChoice).replace(/(?:[^A-Za-z0-9\s]+\s*)?[A-I]\s*$/m, "").trim();
  }
  return { text: clean(text), choices };
}

function sourceQuestion(item, plan, number, position) {
  const source = plan.source === "full" ? item.sourceText : item.questionGroups?.[plan.group] || item.sourceText;
  const extracted = plan.choices
    ? { text: numberedBlock(source, number), choices: [] }
    : questionAndChoices(source, number);
  const displayNumber = plan.together ? plan.hint?.match(/Questions?\s+[^:]+/)?.[0] || `Questions ${number}` : `Question ${number}`;
  const fallback = plan.hint?.replace("{n}", String(number)) || "Complete this item using the original source sheet on the left.";
  const rawOptions = plan.choices || (plan.type === "matching" || plan.type === "multiple" ? optionChunks(source) : extracted.choices);
  const options = rawOptions.filter((option, index, all) => {
    const label = option.match(/^([A-Z]+)\./)?.[1] || option;
    return all.findIndex((candidate) => (candidate.match(/^([A-Z]+)\./)?.[1] || candidate) === label) === index;
  });
  const finalOptions = plan.type === "mcq"
    ? options.slice(0, 4).map((option) => option.replace(/^[A-Z]+\.\s*/, ""))
    : options;
  return {
    qtype: plan.type,
    text: `${displayNumber}\n${extracted.text || fallback}`,
    optionA: finalOptions[0] || "",
    optionB: finalOptions[1] || "",
    optionC: finalOptions[2] || "",
    optionD: finalOptions[3] || "",
    choices: finalOptions,
    correctOption: 0,
    acceptedAnswers: "",
    explanation: "This course source did not include a machine-readable answer key. Your response is retained for instructor review.",
    sortOrder: position + 1,
  };
}

function questionsFor(item) {
  const plans = COURSE_QUESTION_PLANS[`${item.module}:${item.classNumber}`] || [];
  const output = [];
  for (const plan of plans) {
    const numbers = plan.together ? [plan.numbers[0]] : plan.numbers;
    for (const number of numbers) output.push(sourceQuestion(item, plan, number, output.length));
  }
  return output;
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

  for (const question of questionsFor(item)) {
    await client.query(
      `INSERT INTO lhbd_app.questions
        (exam_id,section_id,qtype,text,option_a,option_b,option_c,option_d,correct_option,accepted_answers,explanation,choices,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13)`,
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
        JSON.stringify(question.choices || []),
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
