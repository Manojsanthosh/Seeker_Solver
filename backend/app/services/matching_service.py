import re

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.availability import SolverAvailability
from app.db.models.problem import Problem
from app.db.models.user import User
from app.schemas.problem import SolverMatchItemSchema
from app.schemas.user import SolverDetailsSchema, UserSchema


def extract_keywords(text: str) -> set:
    words = re.findall(r'\b[a-zA-Z0-9+#.-]{2,}\b', text.lower())
    stop_words = {
        'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'need', 'help',
        'looking', 'issue', 'problem', 'solve', 'error', 'when', 'using', 'can', 'not'
    }
    return {w for w in words if w not in stop_words}


class MatchingService:
    @staticmethod
    async def match_solvers_for_problem(
        db: AsyncSession,
        problem: Problem,
        limit: int = 10
    ) -> list[SolverMatchItemSchema]:
        # Query all active solvers with their details and availability
        query = (
            select(User)
            .options(
                selectinload(User.solver_details)
            )
            .where(User.role == "solver", User.is_active == True)
        )
        result = await db.execute(query)
        solvers = result.scalars().all()
        
        # Also query solver availabilities
        av_query = select(SolverAvailability)
        av_res = await db.execute(av_query)
        availabilities = {av.solver_id: av for av in av_res.scalars().all()}

        problem_text = f"{problem.title} {problem.category} {problem.description}".lower()
        problem_keywords = extract_keywords(problem_text)
        
        ranked_matches = []

        for solver in solvers:
            if not solver.solver_details:
                continue
            
            details = solver.solver_details
            score = 0.0
            reasons = []

            # 1. Skill overlap (50% max)
            solver_skills = [s.lower() for s in (details.skills or [])]
            matched_skills = [s for s in solver_skills if any(kw in s or s in kw for kw in problem_keywords)]
            
            if matched_skills:
                skill_score = min(50.0, len(matched_skills) * 15.0)
                score += skill_score
                display_matched = [s.title() for s in matched_skills[:3]]
                reasons.append(f"Matched skills: {', '.join(display_matched)}")
            elif any(s in problem_text for s in solver_skills):
                score += 20.0
                reasons.append("Relevant skill domain alignment")

            # 2. Category & Education alignment (25% max)
            category_lower = problem.category.lower()
            field_lower = (details.field_of_study or "").lower()
            if any(term in category_lower for term in ["tech", "software", "web", "mobile"]) and any(term in field_lower for term in ["cs", "computer", "software", "engineering", "tech"]):
                score += 25.0
                reasons.append(f"Strong qualification: {details.highest_qualification} in {details.field_of_study}")
            elif field_lower and (field_lower in category_lower or category_lower in field_lower):
                score += 20.0
                reasons.append(f"Field of study aligns with {problem.category}")
            else:
                score += 10.0

            # 3. Experience & Star Rating (15% max)
            exp_years = details.experience_years or 0
            rating = details.rating or 5.0
            exp_score = min(7.5, exp_years * 1.5)
            rating_score = (rating / 5.0) * 7.5
            total_exp_rating = exp_score + rating_score
            score += total_exp_rating
            if rating >= 4.8:
                reasons.append(f"Top rated solver ({rating:.2f}★) with {exp_years}+ yrs experience")

            # 4. Preferred Mode & Availability overlap (10% max)
            av = availabilities.get(solver.id)
            has_availability_overlap = False
            if av:
                # Mode match
                preferred_modes = av.preferred_modes or ["video", "audio", "chat"]
                if problem.preferred_mode in preferred_modes:
                    score += 5.0
                    has_availability_overlap = True
                    reasons.append(f"Supports your preferred mode ({problem.preferred_mode.capitalize()})")
                
                # Preferred windows check
                if av.weekly_schedule and len(av.weekly_schedule) > 0:
                    score += 5.0
                    has_availability_overlap = True
            else:
                score += 5.0
                has_availability_overlap = True

            # Final normalized score (0 - 100)
            final_score = round(min(100.0, max(10.0, score)), 1)
            
            user_schema = UserSchema(
                id=solver.id,
                name=solver.name,
                email=solver.email,
                phone=solver.phone,
                role=solver.role,
                city=solver.city,
                bio=solver.bio,
                avatarUrl=solver.avatar_url,
                createdAt=solver.created_at.isoformat(),
                solverDetails=SolverDetailsSchema(
                    highestQualification=details.highest_qualification,
                    fieldOfStudy=details.field_of_study,
                    institution=details.institution,
                    completionYear=details.completion_year,
                    experienceYears=details.experience_years,
                    skills=details.skills or [],
                    certifications=details.certifications or [],
                    documents=details.documents or [],
                    linkedIn=details.linked_in,
                    instagram=details.instagram,
                    verified=details.verified,
                    rating=details.rating,
                    completedJobsCount=details.completed_jobs_count,
                    activeJobsCount=details.active_jobs_count,
                    totalEarnings=details.total_earnings,
                    hourlyRate=details.hourly_rate
                )
            )

            ranked_matches.append(
                SolverMatchItemSchema(
                    solver=user_schema,
                    matchScore=final_score,
                    matchReasons=reasons,
                    availabilityOverlap=has_availability_overlap
                )
            )

        ranked_matches.sort(key=lambda m: m.matchScore, reverse=True)
        return ranked_matches[:limit]
