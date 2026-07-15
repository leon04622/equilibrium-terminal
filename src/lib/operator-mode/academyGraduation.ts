import { LIVE_ACADEMY_LESSON_IDS } from "@/lib/education/ACADEMY_FRAMEWORK_V1";
import {
  buildLessonStatuses,
  lessonProgress,
  type RawAcademyProgress,
} from "@/lib/education/learningAcademy";

/** True when every live academy lesson has reached mastery. */
export function isAcademyGraduated(raw: RawAcademyProgress): boolean {
  const statuses = buildLessonStatuses(raw);
  return LIVE_ACADEMY_LESSON_IDS.every((id) => {
    const status = statuses.get(id);
    if (status !== "completed") return false;
    return lessonProgress(id, raw).mastery;
  });
}
