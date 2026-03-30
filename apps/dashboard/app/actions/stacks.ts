"use server";

import { revalidatePath } from "next/cache";
import {
  createDb,
  stackSessions,
  stackMessages,
  eq,
  and,
  desc,
  asc,
  sql,
} from "@cmd/db";
import { getQuestion, STACK_QUESTIONS } from "@/lib/stack-questions";
import type { StackType, Core4Domain } from "@/lib/stack-questions";

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

// ---------------------------------------------------------------------------
// Create a new stack session
// ---------------------------------------------------------------------------

export async function createStackSession(formData: FormData) {
  const db = getDb();
  const title = formData.get("title") as string;
  const stackType = formData.get("stackType") as StackType;
  const core4Domain = formData.get("core4Domain") as Core4Domain;
  const subjectEntity = formData.get("subjectEntity") as string;
  const userId = formData.get("userId") as string;

  // Questions 0-2 are captured via the form (title, domain, subject).
  // The session starts at question index 3 (the 4th question).
  const currentQuestionIndex = 3;

  const [session] = await db
    .insert(stackSessions)
    .values({
      userId,
      title,
      stackType,
      core4Domain,
      subjectEntity,
      status: "in_progress",
      currentQuestionIndex,
    })
    .returning();

  // Insert the first assistant message (question 4, index 3)
  const questionText = getQuestion(stackType, currentQuestionIndex, subjectEntity);

  if (questionText && session) {
    await db.insert(stackMessages).values({
      sessionId: session.id,
      role: "assistant",
      content: questionText,
      questionNumber: currentQuestionIndex,
    });
  }

  revalidatePath("/life");
  return session;
}

// ---------------------------------------------------------------------------
// Add a message to a session (user answer + next assistant question)
// ---------------------------------------------------------------------------

export async function addStackMessage(formData: FormData) {
  const db = getDb();
  const sessionId = formData.get("sessionId") as string;
  const content = formData.get("content") as string;
  const questionNumber = parseInt(formData.get("questionNumber") as string, 10);

  // Save the user's answer
  await db.insert(stackMessages).values({
    sessionId,
    role: "user",
    content,
    questionNumber,
  });

  // Fetch the session to determine next question
  const [session] = await db
    .select()
    .from(stackSessions)
    .where(eq(stackSessions.id, sessionId))
    .limit(1);

  if (!session) return null;

  const stackType = session.stackType as StackType;
  const totalQuestions = STACK_QUESTIONS[stackType].totalQuestions;
  const nextIndex = questionNumber + 1;

  if (nextIndex >= totalQuestions) {
    // Last question answered — mark session completed
    await db
      .update(stackSessions)
      .set({
        status: "completed",
        currentQuestionIndex: questionNumber,
        completedAt: new Date(),
      })
      .where(eq(stackSessions.id, sessionId));
  } else {
    // Serve the next question
    const nextQuestion = getQuestion(stackType, nextIndex, session.subjectEntity);
    if (nextQuestion) {
      await db.insert(stackMessages).values({
        sessionId,
        role: "assistant",
        content: nextQuestion,
        questionNumber: nextIndex,
      });
    }

    await db
      .update(stackSessions)
      .set({ currentQuestionIndex: nextIndex })
      .where(eq(stackSessions.id, sessionId));
  }

  revalidatePath("/life");
  return { nextIndex, completed: nextIndex >= totalQuestions };
}

// ---------------------------------------------------------------------------
// Fetch sessions
// ---------------------------------------------------------------------------

export async function getStackSessions(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(stackSessions)
    .where(eq(stackSessions.userId, userId))
    .orderBy(desc(stackSessions.createdAt));
}

export async function getStackSession(sessionId: string) {
  const db = getDb();
  const [session] = await db
    .select()
    .from(stackSessions)
    .where(eq(stackSessions.id, sessionId))
    .limit(1);
  return session ?? null;
}

// ---------------------------------------------------------------------------
// Fetch messages for a session
// ---------------------------------------------------------------------------

export async function getStackMessages(sessionId: string) {
  const db = getDb();
  return db
    .select()
    .from(stackMessages)
    .where(eq(stackMessages.sessionId, sessionId))
    .orderBy(asc(stackMessages.createdAt));
}

// ---------------------------------------------------------------------------
// Edit a message (and delete all subsequent messages)
// ---------------------------------------------------------------------------

export async function editStackMessage(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const newContent = formData.get("newContent") as string;

  // Get the message being edited
  const [message] = await db
    .select()
    .from(stackMessages)
    .where(eq(stackMessages.id, id))
    .limit(1);

  if (!message) return null;

  // Update the message content
  await db
    .update(stackMessages)
    .set({ content: newContent })
    .where(eq(stackMessages.id, id));

  // Delete all messages created after this one in the same session
  await db.delete(stackMessages).where(
    and(
      eq(stackMessages.sessionId, message.sessionId),
      sql`${stackMessages.createdAt} > ${message.createdAt}`
    )
  );

  // Recalculate currentQuestionIndex based on remaining messages
  const remaining = await db
    .select()
    .from(stackMessages)
    .where(eq(stackMessages.sessionId, message.sessionId))
    .orderBy(desc(stackMessages.createdAt))
    .limit(1);

  const lastQuestionNumber = remaining[0]?.questionNumber ?? 0;

  await db
    .update(stackSessions)
    .set({
      currentQuestionIndex: lastQuestionNumber,
      status: "in_progress",
      completedAt: null,
    })
    .where(eq(stackSessions.id, message.sessionId));

  revalidatePath("/life");
  return { sessionId: message.sessionId, currentQuestionIndex: lastQuestionNumber };
}

// ---------------------------------------------------------------------------
// Delete a session and all its messages
// ---------------------------------------------------------------------------

export async function deleteStackSession(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  // Messages are cascade-deleted via the FK constraint
  await db.delete(stackSessions).where(eq(stackSessions.id, id));

  revalidatePath("/life");
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function getStackStats(userId: string) {
  const db = getDb();

  const sessions = await db
    .select()
    .from(stackSessions)
    .where(eq(stackSessions.userId, userId));

  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === "completed").length;
  const inProgress = sessions.filter((s) => s.status === "in_progress").length;

  const byType: Record<string, number> = {};
  for (const s of sessions) {
    byType[s.stackType] = (byType[s.stackType] || 0) + 1;
  }

  return { total, completed, inProgress, byType };
}
