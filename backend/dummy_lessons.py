import json
from accounts.models import User
from courses.models import Course
from lessons.models import Lesson

# Ensure dummy_courses are available so titles we tailor for exist.
try:
    from dummy_courses import dummy_courses as _dummy_courses  # noqa: F401
except Exception:
    _dummy_courses = []


def _json_resources(items):
    return json.dumps(items)


def generate_lesson_specs(course: Course, base_status: str):
    title = course.title
    common = {"status": base_status}

    overrides = {
        "D100 Introduction to Dogs": [
            {
                "title": "Dog Basics",
                "description": "History of domestication, lifespan, and care overview.",
                "objectives": "- Understand domestication\n- Identify basic needs\n- Recognize breeds",
                "additional_notes": "Skim the syllabus before class.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "Dog 101", "url": "https://example.com/dog101", "description": "Primer"},
                ]),
            },
            {
                "title": "Care & Welfare",
                "description": "Feeding, exercise, grooming, and common health checks.",
                "objectives": "- Build a care routine\n- Spot warning signs",
                "additional_notes": "Bring care questions.",
                "credit_value": 1,
                "estimated_duration": "2_hours",
                "resources": _json_resources([
                    {"title": "Care Guide", "url": "https://example.com/care", "description": "Daily routine"},
                ]),
            },
            {
                "title": "Training Intro",
                "description": "Positive reinforcement and basic commands.",
                "objectives": "- Use positive reinforcement\n- Teach sit/stay",
                "additional_notes": "Practice with a stuffed toy if no dog.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "Training Basics", "url": "https://example.com/train", "description": "Worksheet"},
                ]),
            },
        ],
        "D200 Advanced Dog Training": [
            {
                "title": "Behavior Theory",
                "description": "Operant conditioning, cues, and shaping.",
                "objectives": "- Explain reinforcement schedules",
                "additional_notes": "Revise D100 training.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "Behavior Theory", "url": "https://example.com/behavior", "description": "Reading"},
                ]),
            },
            {
                "title": "Complex Skills",
                "description": "Chain behaviors and advanced cues.",
                "objectives": "- Plan a behavior chain",
                "additional_notes": "Prepare a 3-step chain.",
                "credit_value": 1,
                "estimated_duration": "2_hours",
                "resources": _json_resources([
                    {"title": "Chaining", "url": "https://example.com/chaining", "description": "Guide"},
                ]),
            },
            {
                "title": "Troubleshooting",
                "description": "Common issues and corrective strategies.",
                "objectives": "- Diagnose training issues",
                "additional_notes": "Submit a training log.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "Fix It", "url": "https://example.com/fix", "description": "Examples"},
                ]),
            },
        ],
        "A101 Animal Care Basics": [
            {
                "title": "Ethics & Welfare",
                "description": "Five freedoms and welfare principles.",
                "objectives": "- Apply five freedoms",
                "additional_notes": "Bring one case study.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "Five Freedoms", "url": "https://example.com/freedoms", "description": "Reading"},
                ]),
            },
            {
                "title": "Husbandry",
                "description": "Habitat, nutrition, and enrichment.",
                "objectives": "- Create a husbandry plan",
                "additional_notes": "Draft a weekly plan.",
                "credit_value": 1,
                "estimated_duration": "2_hours",
                "resources": _json_resources([
                    {"title": "Enrichment", "url": "https://example.com/enrich", "description": "Ideas"},
                ]),
            },
            {
                "title": "Safety",
                "description": "Handling and first-aid basics.",
                "objectives": "- Build a first-aid kit",
                "additional_notes": "Check local vet contacts.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "First Aid", "url": "https://example.com/aid", "description": "Checklist"},
                ]),
            },
        ],
        "A201 Exotic Animals": [
            {
                "title": "Legal & Ethical",
                "description": "Regulations and ethical sourcing.",
                "objectives": "- Identify permits",
                "additional_notes": "Local laws vary.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "Regs", "url": "https://example.com/regs", "description": "Guide"},
                ]),
            },
            {
                "title": "Specialized Care",
                "description": "Temperature, humidity, and diet needs.",
                "objectives": "- Design a habitat",
                "additional_notes": "Bring a species example.",
                "credit_value": 1,
                "estimated_duration": "2_hours",
                "resources": _json_resources([
                    {"title": "Habitat", "url": "https://example.com/habitat", "description": "Template"},
                ]),
            },
            {
                "title": "Health",
                "description": "Common illnesses and prevention.",
                "objectives": "- Draft a health checklist",
                "additional_notes": "Consult a vet.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "Vet Guide", "url": "https://example.com/vet", "description": "Signs"},
                ]),
            },
        ],
        "D300 Dog Breeds and Genetics": [
            {
                "title": "Genetics 101",
                "description": "Mendelian genetics and inheritance.",
                "objectives": "- Explain genotype vs phenotype",
                "additional_notes": "Review Punnett squares.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "Genetics Intro", "url": "https://example.com/genetics", "description": "Reading"},
                ]),
            },
            {
                "title": "Breeds",
                "description": "Groupings, traits, and lineage.",
                "objectives": "- Compare breed groups",
                "additional_notes": "Focus on behavior traits.",
                "credit_value": 1,
                "estimated_duration": "2_hours",
                "resources": _json_resources([
                    {"title": "Breed Atlas", "url": "https://example.com/breeds", "description": "Reference"},
                ]),
            },
            {
                "title": "Ethics of Breeding",
                "description": "Health screening and responsible practices.",
                "objectives": "- Plan ethical breeding",
                "additional_notes": "Consider rescue options.",
                "credit_value": 1,
                "estimated_duration": "1_hour",
                "resources": _json_resources([
                    {"title": "Ethics", "url": "https://example.com/ethics", "description": "Guidelines"},
                ]),
            },
        ],
    }

    if title in overrides:
        return [{**spec, **common} for spec in overrides[title]]

    # Fallback generic spec (3 lessons)
    return [
        {
            "title": "Introduction",
            "description": (
                f"Welcome to {title}! In this lesson, you will get an overview of the "
                f"key themes, learning outcomes, and how assessments and participation work. "
                f"We also outline how lessons build on each other to help you progress."
            ),
            "objectives": (
                "- Understand course scope and structure\n"
                "- Identify key outcomes and expectations\n"
                "- Get familiar with resources and support channels"
            ),
            "additional_notes": "Take note of key dates and milestones.",
            "credit_value": 1,
            "estimated_duration": "1_hour",
            "status": base_status,
            "resources": _json_resources([
                {"title": "Course Introduction", "url": "https://example.com/intro", "description": "Overview and expectations."},
                {"title": "Syllabus", "url": "https://example.com/syllabus", "description": "Full course outline."},
            ]),
        },
        {
            "title": "Deep Dive",
            "description": (
                f"We explore core concepts of {title} with practical examples. "
                f"You will connect theory to real-world applications and learn common pitfalls."
            ),
            "objectives": (
                "- Explain core concepts in your own words\n"
                "- Apply concepts to guided examples\n"
                "- Recognize and avoid common mistakes"
            ),
            "additional_notes": "Bring questions to the next session for discussion.",
            "credit_value": 2,
            "estimated_duration": "2_hours",
            "status": base_status,
            "resources": _json_resources([
                {"title": "Reading 1", "url": "https://example.com/reading1", "description": "Core concepts."},
                {"title": "Lecture Video", "url": "https://example.com/video1", "description": "Deep dive session."},
            ]),
        },
        {
            "title": "Practice",
            "description": (
                f"Reinforce your learning from {title} with hands-on exercises. "
                f"Reflect on your approach and discuss alternative solutions."
            ),
            "objectives": (
                "- Solve practice tasks end-to-end\n"
                "- Reflect on solution choices\n"
                "- Identify next steps for improvement"
            ),
            "additional_notes": "Submit your practice work before the deadline.",
            "credit_value": 1,
            "estimated_duration": "1_hour",
            "status": base_status,
            "resources": _json_resources([
                {"title": "Exercises", "url": "https://example.com/exercises", "description": "Practice problems."},
                {"title": "Hints", "url": "https://example.com/hints", "description": "Guidance for exercises."},
            ]),
        },
    ]


def create_lessons_for_course(course: Course):
    """
    Generate a few lessons per course created via dummy_courses
    """
    author = course.teacher

    base_status = "published" if course.status == "published" else "draft"
    lesson_specs = generate_lesson_specs(course, base_status)

    created_lessons = []
    for spec in lesson_specs:
        # Ensure lessons exist; update dummy content for existing dummy lessons
        defaults = {
            "author": author,
            "description": spec["description"],
            "objectives": spec["objectives"],
            "additional_notes": spec.get("additional_notes", ""),
            "credit_value": spec["credit_value"],
            "estimated_duration": spec["estimated_duration"],
            "status": spec["status"],
            "resources": spec["resources"],
        }
        lesson, created = Lesson.objects.get_or_create(
            course=course, title=spec["title"], defaults={**defaults}
        )
        if not created:
            # Update only content-ish fields; keep existing status as-is to avoid overriding manual changes
            lesson.description = spec["description"]
            lesson.objectives = spec["objectives"]
            lesson.additional_notes = spec.get("additional_notes", "")
            lesson.credit_value = spec["credit_value"]
            lesson.estimated_duration = spec["estimated_duration"]
            lesson.resources = spec["resources"]
            lesson.save(update_fields=[
                "description",
                "objectives",
                "additional_notes",
                "credit_value",
                "estimated_duration",
                "resources",
                "updated_at",
            ])
        created_lessons.append(lesson)

    # Set a simple prerequisite chain if we created at least 2 lessons
    if len(created_lessons) >= 2:
        later = created_lessons[1]
        earlier = created_lessons[0]
        later.prerequisites.add(earlier)
    if len(created_lessons) >= 3:
        created_lessons[2].prerequisites.add(created_lessons[1])


def main():
    # Prefer approved teachers
    teacher = User.objects.filter(role="teacher", is_approved=True).first()
    if not teacher:
        print("No approved teacher found. Proceeding using course.teacher for each course.")

    courses = Course.objects.all()
    if not courses.exists():
        print("No courses found. Please run dummy_courses first.")
        return

    for course in courses:
        create_lessons_for_course(course)

    print("Created the dummy lessons.")
