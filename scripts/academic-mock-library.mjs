// Original Academic English mock library. The tests follow the public IELTS Academic
// module structure and timings, but are independently written practice materials and
// are not official IELTS papers or affiliated with IELTS/IELTS partners.

export const ACADEMIC_LIBRARY_VERSION = "academic-original-library-2026-10";

const readingTopics = [
  ["Urban tree canopies", "municipal foresters", "young street trees", "aerial heat maps", "shade over paved streets", "watering during the first two summers", "the city climate office", "28 per cent"],
  ["Ancient pigment workshops", "archaeological chemists", "coastal pottery makers", "microscopic residue analysis", "layers of mineral colour", "contamination from modern handling", "the regional museum laboratory", "two thousand years"],
  ["Restoring tidal marshes", "coastal ecologists", "former grazing land", "sediment-level sensors", "slower incoming water", "negotiating access with farmers", "the estuary partnership", "six kilometres"],
  ["The science of quiet classrooms", "acoustic researchers", "open-plan schools", "sound-level recorders", "clearer speech for pupils", "noise from corridors", "the learning environments unit", "twelve classrooms"],
  ["Seed banks for city gardens", "botanical conservationists", "community allotments", "temperature-controlled storage", "greater genetic variety", "keeping records up to date", "the national seed network", "minus eighteen degrees"],
  ["Mapping underground rivers", "hydrology teams", "old industrial districts", "non-invasive ground radar", "hidden channels beneath roads", "incomplete historic plans", "the metropolitan water archive", "nineteenth century"],
  ["Night-time pollination", "insect ecologists", "suburban orchards", "infrared cameras", "moth visits after dusk", "street lighting near hedges", "the field ecology centre", "four summer months"],
  ["Repairing historic brickwork", "materials engineers", "railway viaducts", "moisture and salt tests", "longer-lasting mortar joints", "matching older brick sizes", "the heritage infrastructure group", "one hundred samples"],
  ["Shared bicycle systems", "transport planners", "commuter routes", "anonymous journey records", "short trips replacing car journeys", "uneven demand at rush hour", "the active travel observatory", "fifteen minutes"],
  ["Libraries of recorded sound", "audio archivists", "local radio collections", "digital restoration software", "clearer access to fragile recordings", "copyright clearance", "the public sound archive", "sixty thousand items"],
  ["Volcanic soils and vineyards", "soil scientists", "hillside vineyards", "mineral sampling", "slower release of nutrients", "erosion after intense rain", "the agricultural geology institute", "three growing seasons"],
  ["Cooling public squares", "urban designers", "dense city centres", "thermal imaging", "lower surface temperatures", "limited space for planting", "the public realm laboratory", "five degrees"],
  ["Citizen weather stations", "climate researchers", "small towns", "calibrated home sensors", "more detailed rainfall records", "uneven equipment quality", "the local climate network", "three hundred volunteers"],
  ["Rewilding railway edges", "landscape ecologists", "disused sidings", "seasonal wildlife surveys", "corridors for small mammals", "safety near active tracks", "the rail biodiversity trust", "nine stations"],
  ["Reusable laboratory glassware", "university technicians", "teaching laboratories", "wash-cycle monitoring", "less single-use plastic", "sterilising delicate equipment", "the campus sustainability office", "forty per cent"],
  ["Reading patterns in coral growth", "marine biologists", "shallow reef sites", "high-resolution core scans", "a record of changing water temperature", "damage from storms", "the ocean observation laboratory", "thirty years"],
  ["Designing flood-resilient parks", "landscape architects", "river-adjacent neighbourhoods", "permeability trials", "temporary storage for storm water", "maintenance after heavy use", "the urban rivers programme", "eight hectares"],
  ["The return of hand tools", "manufacturing historians", "small repair workshops", "interviews with apprentices", "skills passed between generations", "finding specialist trainers", "the craft industries project", "seventy interviews"],
  ["Tracking migratory bats", "wildlife biologists", "woodland boundaries", "lightweight radio tags", "routes between feeding areas", "short battery life", "the nocturnal species team", "twenty-four animals"],
  ["Water-saving textile dyes", "chemical engineers", "fabric dye houses", "closed-loop filtration", "less fresh water in production", "removing trace colour from filters", "the clean manufacturing centre", "half the usual volume"],
  ["Flood stories in oral history", "social historians", "riverside communities", "recorded interviews", "local knowledge of evacuation routes", "locating older residents", "the community memory project", "fifty interviews"],
  ["Small satellites for farms", "agricultural analysts", "mixed crop farms", "weekly satellite images", "earlier signs of plant stress", "cloud cover in spring", "the precision farming institute", "ten-metre resolution"],
  ["Public clocks and city time", "design historians", "railway towns", "maintenance records", "how shared schedules developed", "missing records from early repairs", "the civic time collection", "eighteen clock faces"],
  ["The materials of modern playgrounds", "safety researchers", "school play areas", "impact-resistance testing", "safer landing surfaces", "heat retained by dark rubber", "the child environments laboratory", "six surface types"],
  ["Rainwater on apartment roofs", "building researchers", "mid-rise housing", "roof-tank trials", "water for gardens and cleaning", "structural weight limits", "the housing innovation studio", "nine buildings"],
  ["Recording disappearing dialects", "linguists", "remote island communities", "long-form interviews", "a resource for future speakers", "gaining informed consent", "the language documentation centre", "one hundred hours"],
  ["Restoring seagrass beds", "marine restoration teams", "sheltered bays", "underwater plot surveys", "nursery habitat for fish", "anchors dragged through plots", "the coastal recovery alliance", "fourteen hectares"],
  ["Why old maps still matter", "historical geographers", "regional planning offices", "digitised map overlays", "evidence of earlier land use", "inconsistent place names", "the landscape history archive", "two centuries"],
  ["Paper made from agricultural waste", "materials scientists", "rice-growing districts", "fibre-strength trials", "less pressure on timber supplies", "collecting waste after harvest", "the circular materials hub", "twenty-five tonnes"],
  ["Learning from wild bee nests", "pollination researchers", "urban parks", "small habitat cameras", "how nests respond to heat", "disturbance from visitors", "the urban insect observatory", "six nesting sites"],
];

const writingTasks = [
  ["The table below shows the percentage of household waste recycled in three cities in 2000, 2010 and 2020.\n\nCity A: 18%, 31%, 48%\nCity B: 24%, 29%, 36%\nCity C: 12%, 27%, 55%\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.", "Some people believe universities should require every student to study at least one subject outside their main field. To what extent do you agree or disagree?"],
  ["The chart below shows average daily time spent on four transport modes in a city in 2005 and 2025.\n\nCar: 52 / 38 minutes\nBus: 24 / 31 minutes\nBicycle: 9 / 18 minutes\nWalking: 15 / 20 minutes\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.", "In many countries, young people are encouraged to move away from their home towns for work or study. Do the advantages of this development outweigh the disadvantages?"],
  ["The table below shows the number of visitors (thousands) to four museum departments in 2015 and 2025.\n\nScience: 84 / 121\nHistory: 96 / 88\nArt: 72 / 110\nChildren's: 41 / 93\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.", "Governments should spend more money on preventing illness than on treating people after they become ill. Discuss both views and give your own opinion."],
  ["The diagram describes a community rainwater collection system: roof gutters direct water to a filter; filtered water enters an underground tank; a pump supplies gardens and toilet systems; overflow enters a drainage channel.\n\nSummarise the information by selecting and reporting the main features.", "Some people think employers should allow staff to work a four-day week with longer daily hours. What are the possible benefits and drawbacks?"],
  ["The table below shows the proportion of energy from renewable sources in five regions in 2010 and 2024.\n\nNorth: 14% / 36%\nEast: 22% / 31%\nSouth: 9% / 28%\nWest: 18% / 42%\nCentral: 26% / 34%\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.", "Children should begin learning a foreign language at primary school rather than secondary school. Discuss both views and give your own opinion."],
  ["The chart below shows the percentage of books borrowed in a library in four formats in 2012 and 2022.\n\nPrinted fiction: 46% / 31%\nPrinted non-fiction: 28% / 19%\nE-books: 12% / 34%\nAudiobooks: 14% / 16%\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.", "Many cities are replacing small local shops with large shopping centres. Is this a positive or negative development?"],
  ["The process below shows how food waste is converted into compost: collection from homes; sorting; shredding; controlled decomposition; screening; distribution to gardens.\n\nSummarise the information by selecting and reporting the main features.", "Some people say that the main environmental problem of our time is the loss of particular species of plants and animals. Others say that there are more important environmental problems. Discuss both views and give your own opinion."],
  ["The table below compares the number of students (thousands) studying four subjects at a college in 2008 and 2023.\n\nBusiness: 31 / 44\nEngineering: 22 / 29\nHealth: 18 / 38\nArts: 27 / 19\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.", "People today can work from almost anywhere because of technology. How does this affect individuals and society?"],
  ["The chart below shows average monthly spending by teenagers on three leisure activities in 2010 and 2025.\n\nCinema: $18 / $11\nStreaming services: $4 / $19\nSport and fitness: $12 / $17\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.", "Some people believe public money should be used to support creative artists, while others think it should be spent only on essential services. Discuss both views and give your own opinion."],
  ["The diagram shows the life cycle of a reusable delivery container: delivery; collection; inspection; washing; repair if necessary; redistribution.\n\nSummarise the information by selecting and reporting the main features.", "The best way to reduce traffic congestion is to make public transport free. To what extent do you agree or disagree?"],
];

const listeningScenarios = [
  ["Harbour Community Centre", "weekend pottery course", "Saturday", "9.30", "£38", "Dock Street", "April", "clay apron", "Room 6", "two weeks"],
  ["Greenhill Nature Reserve", "guided dawn walk", "Sunday", "6.15", "£12", "North Gate", "May", "waterproof jacket", "Visitor Hut", "ninety minutes"],
  ["Westbridge Language School", "pronunciation workshop", "Wednesday", "18.00", "£24", "Market Square", "June", "headphones", "Studio B", "four sessions"],
  ["Riverside Theatre", "backstage tour", "Friday", "17.45", "£15", "Canal Road", "July", "flat shoes", "Stage Door", "one hour"],
  ["Meadow Sports Club", "beginner tennis course", "Tuesday", "19.00", "£42", "Park Lane", "August", "indoor shoes", "Court 3", "six weeks"],
  ["Old Mill Museum", "family history workshop", "Thursday", "10.00", "£18", "Mill Road", "September", "notebook", "Archive Room", "two hours"],
  ["City Garden Project", "roof-garden volunteering", "Monday", "8.45", "£0", "King Street", "October", "work gloves", "Glasshouse", "three hours"],
  ["Hillside Arts Centre", "printmaking class", "Saturday", "14.00", "£31", "Station Avenue", "November", "old shirt", "Workshop 2", "five weeks"],
  ["Lakeside College", "study-skills seminar", "Tuesday", "16.30", "£9", "College Drive", "February", "student card", "Lecture Hall C", "seventy-five minutes"],
  ["Northgate Science Hub", "family astronomy evening", "Friday", "19.30", "£16", "Library Way", "March", "warm coat", "Observatory", "two and a half hours"],
];

function readingPassage([title, researchers, focus, method, finding, challenge, organisation, measure], index) {
  const subject = title.toLowerCase();
  const text = `For many years, discussions about ${subject} were shaped by broad assumptions rather than detailed local evidence. Teams working in this field often had to rely on short surveys or on records collected for a different purpose. That situation is changing as ${researchers} develop ways of studying ${focus} over longer periods. Their work is not designed to produce a single universal answer; instead, it asks which small changes can be measured reliably and which explanations remain uncertain.\n\nA recent programme coordinated by ${organisation} combined archival material with ${method}. The first stage was deliberately slow. Researchers compared several locations, recorded baseline conditions and agreed common definitions before drawing conclusions. The approach revealed ${finding}. This was important because earlier reports had treated the pattern as temporary or had measured it only at one time of year. The new evidence also showed that results depend on local conditions, so copying a solution without adaptation is unlikely to work.\n\nThe practical implications are considerable. Where decisions are made early, the findings can help planners, teachers, technicians or community groups direct resources towards the most useful intervention. In several pilot projects, participants reported that the new method made discussion more specific: they could identify what had changed, who was affected and what should be monitored next. However, the work is not effortless. A recurring difficulty is ${challenge}. The team therefore recommends that organisations budget for follow-up checks rather than treating initial installation or collection as the final stage.\n\nThe project has also raised broader questions about scale. Its current dataset covers ${measure}, which is enough to identify tendencies but not enough to predict every outcome. Some critics have asked whether the results can be transferred to very different settings. The researchers agree that caution is necessary, yet argue that transparent methods are more valuable than attractive but untested claims. They have published their procedures so that other groups can repeat the work, compare results and report failures as well as successes.\n\nIn the next phase, ${organisation} plans to involve local participants in selecting questions that matter to them. This may improve the usefulness of the research, but it will not remove the need for expert interpretation. The strongest lesson from the project is that careful evidence can guide action while still leaving room for revision. In that respect, the study of ${subject} offers a model for how academic research and everyday decision-making can inform one another.`;
  const base = index * 100;
  const tfOptions = ["True", "False", "Not Given", ""];
  const gap = (textQuestion, answers, explain, order) => q("gap", textQuestion, [], 0, answers, explain, order);
  const mcq = (textQuestion, options, answer, explain, order, type = "mcq") => q(type, textQuestion, options, answer, "", explain, order);
  const tf = (textQuestion, answer, explain, order) => q("tfng", textQuestion, tfOptions, answer, "", explain, order);
  return {
    title: `Passage ${index % 3 + 1}`,
    passageTitle: title,
    passageText: text,
    instruction: `Questions ${index % 3 === 0 ? "1–13" : index % 3 === 1 ? "14–26" : "27–40"}: Answer the questions. For gap-fill questions, write NO MORE THAN FOUR WORDS AND/OR A NUMBER.`,
    questions: [
      gap(`Complete the sentence. The new programme was coordinated by ______.`, organisation.toLowerCase(), "The coordinating body is named in paragraph two.", base + 1),
      gap(`Complete the sentence. The researchers used ______ as part of their method.`, method.toLowerCase(), "The method is described in paragraph two.", base + 2),
      gap(`Complete the sentence. One continuing difficulty was ______.`, challenge.toLowerCase(), "This challenge is named in paragraph three.", base + 3),
      gap(`Complete the sentence. The current dataset covers ______.`, measure.toLowerCase(), "The scale is stated in paragraph four.", base + 4),
      mcq("What was the purpose of the first stage of the programme?", ["To agree reliable starting measures", "To advertise a finished solution", "To replace local records", "To predict every outcome"], 0, "The team recorded baseline conditions and agreed definitions before concluding anything.", base + 5),
      mcq("Why do the researchers advise caution when using the findings elsewhere?", ["The method cannot be published", "Local conditions can affect results", "The project lasted only one day", "Participants rejected monitoring"], 1, "The passage says solutions need adaptation because results depend on local conditions.", base + 6),
      mcq("What do the researchers regard as more useful than untested claims?", ["Transparent methods", "Larger advertising budgets", "Universal predictions", "Shorter surveys"], 0, "Paragraph four contrasts transparent methods with attractive but untested claims.", base + 7),
      mcq("What is planned for the next phase?", ["Ending expert involvement", "Selecting questions with local participants", "Removing all follow-up checks", "Using only archived material"], 1, "The final paragraph describes involving local participants in question selection.", base + 8),
      tf("The researchers relied only on information collected in one season.", 1, "They used longer-term evidence and say earlier reports measured only one time of year.", base + 9),
      tf("The programme found a pattern that earlier reports had not treated as stable.", 0, "It says earlier reports had treated the pattern as temporary.", base + 10),
      tf("All participants in the pilot projects received identical results.", 2, "The text describes reports from participants but gives no claim that results were identical.", base + 11),
      mcq("Choose the best heading for the passage.", ["Evidence, local context and practical decisions", "Why academic research should avoid communities", "A guide to replacing all expert advice", "The history of one failed survey"], 0, "The passage connects rigorous evidence, local context and practical action.", base + 12, "matching"),
      mcq("Which statement best summarises the writer's view?", ["Research should guide action but remain open to revision", "Only universal solutions are worth testing", "Initial data collection is sufficient", "Local participants should replace researchers"], 0, "The final paragraph says careful evidence can guide action while leaving room for revision.", base + 13),
      ...(index % 3 === 2 ? [mcq("What does the passage suggest about follow-up checks?", ["They are part of responsible long-term work", "They should replace initial research", "They are needed only for advertising", "They make local participation impossible"], 0, "The researchers recommend budgeting for follow-up checks instead of treating the first stage as final.", base + 14)] : []),
    ],
  };
}

function q(qtype, text, options = [], correctOption = 0, acceptedAnswers = "", explanation = "", sortOrder = 0) {
  return { qtype, text, optionA: options[0] || "", optionB: options[1] || "", optionC: options[2] || "", optionD: options[3] || "", correctOption, acceptedAnswers, explanation, sortOrder };
}

function listeningSection(testNumber, sectionNumber, info) {
  const [venue, activity, day, time, price, location, month, item, room, duration] = info;
  const contexts = [
    [`Caller: Hello, I am interested in the ${activity} at ${venue}.`, `Receptionist: It starts on ${day} at ${time}. The fee is ${price}, and the entrance is on ${location}.`, `Caller: Is there anything I should bring?`, `Receptionist: Please bring ${item}. Meet us in ${room}. The programme begins in ${month} and runs for ${duration}.`],
    [`Guide: Welcome to ${venue}. This short orientation explains our ${activity}.`, `The first group meets on ${day} at ${time}. The cost is ${price}; please enter from ${location}.`, `Before you arrive, remember to bring ${item}. Staff will be waiting in ${room}. This programme opens in ${month} and lasts ${duration}.`],
    [`Student A: I am comparing options at ${venue}. Is the ${activity} practical?`, `Student B: Yes. It is held on ${day}, beginning at ${time}. It costs ${price}, and registration is at ${location}.`, `Tutor: Bring ${item}. We will work in ${room}. The first session is in ${month}, and the full programme lasts ${duration}.`],
    [`Lecturer: Today I will outline the ${activity} offered by ${venue}.`, `Participants attend on ${day} at ${time}. The standard charge is ${price}. Use the entrance at ${location}.`, `For the activity, bring ${item}. The briefing takes place in ${room}. It is scheduled for ${month} and continues for ${duration}.`],
  ];
  const transcript = contexts[sectionNumber - 1].join("\n\n");
  const values = [["day", day], ["start time", time], ["fee", price], ["entrance", location], ["item to bring", item], ["meeting room", room], ["month", month], ["duration", duration]];
  const questions = values.slice(0, 6).map(([label, answer], i) => {
    const rawAnswer = String(answer).toLowerCase();
    const accepted = rawAnswer.startsWith("£") ? `${rawAnswer}|${rawAnswer.slice(1)}|${rawAnswer.slice(1)} pounds` : rawAnswer;
    return q("gap", `Complete the form. ${label}: ______`, [], 0, accepted, `The speaker states the ${label}.`, (sectionNumber - 1) * 10 + i + 1);
  });
  questions.push(q("mcq", "What is the main purpose of the information?", ["To explain arrangements for an activity", "To advertise a new building", "To compare travel routes", "To describe a past research project"], 0, "", "The recording gives practical arrangements for the activity.", (sectionNumber - 1) * 10 + 7));
  questions.push(q("mcq", "Which detail should participants check before attending?", ["The meeting place and required item", "Their previous examination score", "A hotel reservation", "The weather in another country"], 0, "", "The speaker gives a meeting location and an item to bring.", (sectionNumber - 1) * 10 + 8));
  questions.push(q("mcq", "What is mentioned about the programme?", ["Its timing and length", "Its international television coverage", "Its final examination", "Its transport subsidy"], 0, "", "The schedule includes a start time and duration.", (sectionNumber - 1) * 10 + 9));
  questions.push(q("mcq", "Which statement is correct?", ["The venue gives joining instructions", "The event has already finished", "No equipment is needed", "The time is not announced"], 0, "", "The recording provides joining instructions, including what to bring.", (sectionNumber - 1) * 10 + 10));
  return { title: `Section ${sectionNumber}`, passageTitle: `${venue}: ${activity}`, passageText: transcript, instruction: `Questions ${(sectionNumber - 1) * 10 + 1}–${sectionNumber * 10}: Listen once and complete the questions. Write NO MORE THAN FIVE WORDS AND/OR A NUMBER where required.`, audioUrl: `/audio/ielts-listening/academic-listening-${String(testNumber).padStart(2, "0")}-full.mp3`, questions };
}

async function insertExam(client, exam, sections) {
  const inserted = await client.query(
    `INSERT INTO lhbd_app.exams (title,description,category,module,duration_minutes,marks_per_question,negative_mark,is_live,rules,access_level) VALUES ($1,$2,$3,$4,$5,1,0,true,$6::jsonb,'free') RETURNING id`,
    [exam.title, exam.description, exam.category, exam.module, exam.durationMinutes, JSON.stringify(exam.rules || { showExplanations: true })],
  );
  const examId = inserted.rows[0].id;
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const insertedSection = await client.query(
      `INSERT INTO lhbd_app.sections (exam_id,title,passage_title,passage_text,instruction,audio_url,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [examId, section.title, section.passageTitle, section.passageText, section.instruction, section.audioUrl || "", index + 1],
    );
    const sectionId = insertedSection.rows[0].id;
    for (const question of section.questions || []) {
      await client.query(
        `INSERT INTO lhbd_app.questions (exam_id,section_id,qtype,text,option_a,option_b,option_c,option_d,correct_option,accepted_answers,explanation,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [examId, sectionId, question.qtype, question.text, question.optionA, question.optionB, question.optionC, question.optionD, question.correctOption, question.acceptedAnswers, question.explanation, question.sortOrder],
      );
    }
  }
}

export async function applyAcademicMockLibrary(pool) {
  const marker = await pool.query(`SELECT value FROM lhbd_app.settings WHERE key = 'academic_mock_library_version'`);
  if (marker.rows[0]?.value === ACADEMIC_LIBRARY_VERSION && process.env.RESET_ACADEMIC_LIBRARY !== "1") {
    console.log("✓ Original Academic mock library is already installed.");
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Explicitly requested fresh library: old exams and their linked attempts/sessions are removed.
    await client.query("DELETE FROM lhbd_app.attempts");
    await client.query("DELETE FROM lhbd_app.exam_sessions");
    await client.query("DELETE FROM lhbd_app.exams");

    for (let test = 0; test < 10; test++) {
      const offset = test * 3;
      const sections = [0, 1, 2].map((part) => readingPassage(readingTopics[offset + part], offset + part));
      await insertExam(client, {
        title: `Academic Reading Mock ${test + 1}`,
        description: "Original Academic English Reading mock: 3 passages, 40 questions, 60 minutes. Independent practice material; not an official IELTS paper.",
        category: "Academic IELTS-style Mocks",
        module: "reading",
        durationMinutes: 60,
      }, sections);
    }

    for (let test = 0; test < 10; test++) {
      const scenario = listeningScenarios[test];
      const sections = [1, 2, 3, 4].map((section) => listeningSection(test + 1, section, scenario));
      await insertExam(client, {
        title: `Academic Listening Mock ${test + 1}`,
        description: "Original Listening mock: 4 sections, 40 questions, one-play audio and 32-minute computer-delivered practice timing. Independent practice material; not an official IELTS paper.",
        category: "Academic IELTS-style Mocks",
        module: "listening",
        durationMinutes: 32,
      }, sections);
    }

    for (let test = 0; test < 10; test++) {
      const [taskOne, taskTwo] = writingTasks[test];
      await insertExam(client, {
        title: `Academic Writing Mock ${test + 1}`,
        description: "Original Academic Writing mock: Task 1 report (suggested 20 minutes, 150 words) and Task 2 essay (suggested 40 minutes, 250 words), 60 minutes total. Independent practice material; not an official IELTS paper.",
        category: "Academic IELTS-style Mocks",
        module: "writing",
        durationMinutes: 60,
        rules: { showExplanations: false, writingTasks: 2 },
      }, [
        { title: "Writing Task 1", passageTitle: "Academic report", passageText: taskOne, instruction: "You should spend about 20 minutes on this task. Write at least 150 words.", audioUrl: "", questions: [] },
        { title: "Writing Task 2", passageTitle: "Academic essay", passageText: taskTwo, instruction: "You should spend about 40 minutes on this task. Write at least 250 words.", audioUrl: "", questions: [] },
      ]);
    }

    await client.query(
      `INSERT INTO lhbd_app.settings (key,value) VALUES ('academic_mock_library_version',$1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [ACADEMIC_LIBRARY_VERSION],
    );
    await client.query("COMMIT");
    console.log("✓ Installed 10 original Academic Reading, 10 Listening, and 10 Writing mocks.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
