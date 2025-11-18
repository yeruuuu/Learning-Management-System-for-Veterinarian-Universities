import { useCallback } from "react";
import { Lock } from "lucide-react";

const LessonCard = ({
  lessonId,
  courseId,
  lessonTitle,
  lessonDescription,
  view = "grid",
  onClick,
  number,
  locked = false
}) => {
  const handleOnClick = useCallback(() => {
    if (locked) return;
    if (onClick) onClick({ lessonId, courseId });
  }, [onClick, lessonId, courseId, locked]);

  if (view === "list") {
    return (
      <div
        onClick={handleOnClick}
        className={`flex items-center gap-4 p-3 bg-cookie-lightcream rounded-md shadow-sm ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="w-20 h-16 bg-cookie-lightorange rounded-md flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-cookie-darkbrown text-lg whitespace-normal break-words">
            {typeof number === "number" ? `Lesson ${number}: ` : ""}
            {lessonTitle}
          </h3>
          <p className="text-sm text-cookie-darkbrown opacity-80 line-clamp-2">
            {lessonDescription}
          </p>
        </div>
        {locked && (
          <div className="flex items-center gap-1 text-cookie-darkbrown">
            <Lock className="size-4" />
            <span className="text-sm">Locked</span>
          </div>
        )}
      </div>
    );
  }

  // Grid view: fixed-height card to keep grid consistent (shorter height)
  return (
    <div
      className={`relative w-full h-40 ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={handleOnClick}
    >
      <div className="absolute inset-0 bg-cookie-lightorange rounded-xl" />
      <div className="absolute inset-x-0 top-4 bottom-4">
        <div className="relative bg-cookie-lightcream rounded-lg shadow-xl p-4 w-[92%] h-full mx-auto flex flex-col overflow-hidden">
          <h2 className="font-semibold text-cookie-darkbrown whitespace-normal break-words">
            {typeof number === "number" ? `Lesson ${number}: ` : ""}
            {lessonTitle}
          </h2>
          <p className="text-cookie-darkbrown opacity-90 mt-1 whitespace-normal break-words line-clamp-2">
            {lessonDescription}
          </p>
          {locked && (
            <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cookie-lightorange text-cookie-darkbrown text-xs">
              <Lock className="size-3" />
              Locked
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LessonCard;
