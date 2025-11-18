from django.forms import ValidationError
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction, models
from django.db.models import Count, Q, BooleanField, Case, When, F
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Classroom, Enrollment, Waitlist
from .serializer import ClassroomCreateSerializer, ClassroomSerializer

User = get_user_model()

# API ROOTS
class ClassroomApiRoot(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base = request.build_absolute_uri(".")
        return Response({
           "teacher_classrooms_list": f"{base}teacher/classrooms/",
            "teacher_classroom_detail": f"{base}teacher/classrooms/<classroom_id>/",
            "teacher_classroom_create": f"{base}teacher/classrooms/create/",
            "teacher_classroom_allocate": f"{base}teacher/classrooms/<classroom_id>/allocate/",
            "teacher_classroom_waitlist": f"{base}teacher/classrooms/<classroom_id>/waitlist/",
            "student_classrooms_available":f"{base}student/classrooms/available/",
            "student_classrooms_list": f"{base}student/classrooms/",
            "student_classroom_detail": f"{base}student/classrooms/<classroom_id>/",
            "student_classroom_enroll":f"{base}student/classrooms/<classroom_id>/enroll/",
            "student_classroom_unenroll": f"{base}student/classrooms/<classroom_id>/unenroll/",
            "student_classroom_join_waitlist": f"{base}student/classrooms/<classroom_id>/join-waitlist/"
        })

STUDENT_ENROLLED_FILTER = Q(
    enrollments__status=Enrollment.STATUS_ENROLLED,
    enrollments__student__role="student")

WAITLIST_FILTER = Q(
    enrollments__status=Enrollment.STATUS_WAITLISTED, 
    enrollments__student__role="student")

def annotate_occupancy(queryset):
    annotated = queryset.annotate(
        occupancy_count=Count("enrollments", filter=STUDENT_ENROLLED_FILTER, distinct=True),
        waitlisted_count=Count("enrollments", filter=WAITLIST_FILTER, distinct=True),
    ).annotate(
        has_space_flag=Case(
            When(occupancy_count__lt=F("capacity"), then=models.Value(True)),
            default=models.Value(False),
            output_field=BooleanField(),
        )
    )
    return annotated

def seats_left(classroom: Classroom) -> int:
    current = classroom.enrollments.filter(
        status=Enrollment.STATUS_ENROLLED,
        student__role="student",
    ).count()
    return max(classroom.capacity - current, 0)

# TEACHER VIEWS
class TeacherClassroomCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ClassroomCreateSerializer
    queryset = Classroom.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != 'teacher':
            raise PermissionDenied("Only teachers can create classrooms")
        serializer.save(teacher=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class TeacherClassroomListView(generics.ListAPIView):
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'teacher':
            return Classroom.objects.all()
        return Classroom.objects.none()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class TeacherClassroomDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, classroom_id):
        """Get classroom details for editing"""
        if request.user.role != 'teacher':
            return Response(
                {'error': 'Only teachers can edit classrooms'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            serializer = ClassroomSerializer(classroom, context={'request': request})
            return Response(serializer.data)
        except Classroom.DoesNotExist:
            return Response(
                {'error': 'Classroom not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, classroom_id):
        """Update classroom details"""
        if request.user.role != 'teacher':
            return Response(
                {'error': 'Only teachers can edit classrooms'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            serializer = ClassroomSerializer(classroom, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Classroom.DoesNotExist:
            return Response(
                {'error': 'Classroom not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, classroom_id):
        """Delete a classroom"""
        if request.user.role != 'teacher':
            return Response(
                {"detail": "Only teachers can delete classrooms"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            classroom = get_object_or_404(Classroom, id=classroom_id)
            
            # Check if the teacher owns this classroom
            if classroom.teacher != request.user:
                return Response(
                    {"detail": "You can only delete your own classrooms"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if there are enrolled students
            enrolled_count = Enrollment.objects.filter(
                classroom=classroom,
                status=Enrollment.STATUS_ENROLLED
            ).count()
            
            if enrolled_count > 0:
                return Response(
                    {"detail": f"Cannot delete classroom with {enrolled_count} enrolled students"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            classroom.delete()
            
            return Response(
                {"detail": "Classroom deleted successfully"}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {"detail": "Failed to delete classroom"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TeacherClassroomEditView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, classroom_id):
        """Get classroom details for editing"""
        if request.user.role != 'teacher':
            return Response(
                {'error': 'Only teachers can edit classrooms'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            serializer = ClassroomSerializer(classroom, context={'request': request})
            return Response(serializer.data)
        except Classroom.DoesNotExist:
            return Response(
                {'error': 'Classroom not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, classroom_id):
        """Update classroom details"""
        if request.user.role != 'teacher':
            return Response(
                {'error': 'Only teachers can edit classrooms'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            serializer = ClassroomSerializer(classroom, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Classroom.DoesNotExist:
            return Response(
                {'error': 'Classroom not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

# TEACHER ALLOCATE
class TeacherAllocateView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, classroom_id: int):
        classroom = get_object_or_404(Classroom.objects.select_for_update(), pk=classroom_id)

        if classroom.teacher_id != request.user.id and not getattr(request.user, "is_superuser", False):
            raise PermissionDenied("You do not own this classroom.")

        if classroom.status != "scheduled":
            raise PermissionDenied("This classroom is not open for enrollment.")

        user_id = request.data.get("user_id")
        if user_id is None:
            raise RuntimeError("Test error: missing user_id")
        try:
            target = User.objects.get(pk=int(user_id))
        except (ValueError, TypeError, User.DoesNotExist):
            raise ValidationError({"user_id": "Invalid user."})

        target_role = (getattr(target, "role", "") or "").lower()
        is_target_teacher = (target_role == "teacher")
        is_target_student = (target_role == "student")

        if is_target_teacher and target.id != classroom.teacher_id:
            raise PermissionDenied("Only the assigned teacher can be allocated to this classroom.")

        left = seats_left(classroom)

        if is_target_teacher and target.id == classroom.teacher_id:
            desired = Enrollment.STATUS_ENROLLED  
        elif is_target_student and left > 0:
            desired = Enrollment.STATUS_ENROLLED
        elif is_target_student and left <= 0:
            desired = Enrollment.STATUS_WAITLISTED
        else:
            desired = Enrollment.STATUS_ENROLLED if left > 0 else Enrollment.STATUS_WAITLISTED

        enroll = Enrollment.objects.filter(student=target, classroom=classroom).first()
        if enroll:
            if enroll.status == desired:
                msg = "Already enrolled." if desired == Enrollment.STATUS_ENROLLED else "Already waitlisted."
                return Response({"detail": msg, "status": enroll.status, "seats_left": left}, status=status.HTTP_200_OK)
            enroll.status = desired
            enroll.save(update_fields=["status"])
            return Response(
                {"detail": "Enrollment updated.", "status": desired, "seats_left": seats_left(classroom)},
                status=status.HTTP_200_OK,
            )

        Enrollment.objects.create(student=target, classroom=classroom, status=desired)
        return Response(
            {
                "detail": "Enrolled successfully." if desired == Enrollment.STATUS_ENROLLED else "Added to waitlist.",
                "status": desired,
                "seats_left": seats_left(classroom),
            },
            status=status.HTTP_201_CREATED if desired == Enrollment.STATUS_ENROLLED else status.HTTP_202_ACCEPTED,
        )

class TeacherClassroomWaitlistView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, classroom_id):
        """Get all students on the waitlist for this classroom"""
        if request.user.role != 'teacher':
            return Response(
                {"detail": "Only teachers can view waitlists"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        classroom = get_object_or_404(Classroom, id=classroom_id)
        
        if classroom.teacher != request.user:
            return Response(
                {"detail": "Only the classroom teacher can view this waitlist"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        waitlisted_enrollments = Enrollment.objects.filter(
            classroom=classroom,
            status=Enrollment.STATUS_WAITLISTED,
            student__role="student"
        ).select_related('student').order_by('created_at')
        
        waitlist_data = []
        for enrollment in waitlisted_enrollments:
            waitlist_data.append({
                'enrollment_id': enrollment.id,
                'student_id': enrollment.student.id,
                'student_name': f"{enrollment.student.first_name} {enrollment.student.last_name}",
                'student_email': enrollment.student.email,
                'joined_waitlist': enrollment.created_at,
                'student_username': enrollment.student.username
            })
        
        return Response({
            'classroom_id': classroom.id,
            'classroom_title': classroom.title,
            'waitlist_count': len(waitlist_data),
            'available_seats': seats_left(classroom),
            'waitlist': waitlist_data
        }, status=status.HTTP_200_OK)
    
    @transaction.atomic
    def post(self, request, classroom_id):
        """Allocate a student from waitlist to enrolled status"""
        if request.user.role != 'teacher':
            return Response(
                {"detail": "Only teachers can allocate from waitlist"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        classroom = get_object_or_404(Classroom.objects.select_for_update(), id=classroom_id)
        
        if classroom.teacher != request.user:
            return Response(
                {"detail": "Only the classroom teacher can allocate from this waitlist"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        student_id = request.data.get('student_id')
        if not student_id:
            return Response(
                {"detail": "student_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            student = User.objects.get(id=student_id, role='student')
        except User.DoesNotExist:
            return Response(
                {"detail": "Student not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        available_seats = seats_left(classroom)
        if available_seats <= 0:
            return Response(
                {"detail": "No available seats in classroom"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            enrollment = Enrollment.objects.get(
                classroom=classroom,
                student=student,
                status=Enrollment.STATUS_WAITLISTED
            )
        except Enrollment.DoesNotExist:
            return Response(
                {"detail": "Student is not on the waitlist for this classroom"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        enrollment.status = Enrollment.STATUS_ENROLLED
        enrollment.save(update_fields=['status'])
        
        return Response({
            'detail': f'Successfully allocated {student.first_name} {student.last_name} to the classroom',
            'student_name': f"{student.first_name} {student.last_name}",
            'seats_left': seats_left(classroom)
        }, status=status.HTTP_200_OK)

class TeacherAllWaitlistsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all waitlists for teacher's classrooms"""
        if request.user.role != 'teacher':
            return Response(
                {"detail": "Only teachers can view all waitlists"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        teacher_classrooms = Classroom.objects.filter(teacher=request.user)
        all_waitlists = []
        
        for classroom in teacher_classrooms:
            waitlisted_enrollments = Enrollment.objects.filter(
                classroom=classroom,
                status=Enrollment.STATUS_WAITLISTED,
                student__role="student"
            ).select_related('student').order_by('id')
            
            waitlist_data = []
            for enrollment in waitlisted_enrollments:
                waitlist_data.append({
                    'enrollment_id': enrollment.id,
                    'student_id': enrollment.student.id,
                    'student_name': f"{enrollment.student.first_name} {enrollment.student.last_name}",
                    'student_email': enrollment.student.email,
                    'student_username': enrollment.student.username,
                    'joined_waitlist': enrollment.id,
                })
            
            if waitlist_data:
                all_waitlists.append({
                    'classroom_id': classroom.id,
                    'classroom_title': classroom.title,
                    'classroom_capacity': classroom.capacity,
                    'available_seats': seats_left(classroom),
                    'waitlist_count': len(waitlist_data),
                    'waitlist': waitlist_data
                })
        
        all_students_on_waitlist = Enrollment.objects.filter(
            classroom__teacher=request.user,
            status=Enrollment.STATUS_WAITLISTED,
            student__role="student"
        ).select_related('student', 'classroom').order_by('id')
        
        global_waitlist = []
        for enrollment in all_students_on_waitlist:
            global_waitlist.append({
                'enrollment_id': enrollment.id,
                'student_id': enrollment.student.id,
                'student_name': f"{enrollment.student.first_name} {enrollment.student.last_name}",
                'student_email': enrollment.student.email,
                'student_username': enrollment.student.username,
                'current_classroom_title': enrollment.classroom.title,
                'current_classroom_id': enrollment.classroom.id,
                'joined_waitlist': enrollment.id,
            })
        
        return Response({
            'classroom_waitlists': all_waitlists,
            'global_waitlist': global_waitlist,
            'teacher_classrooms': [
                {
                    'id': classroom.id,
                    'title': classroom.title,
                    'available_seats': seats_left(classroom)
                } for classroom in teacher_classrooms
            ]
        }, status=status.HTTP_200_OK)
    
    @transaction.atomic
    def post(self, request):
        """Allocate a student from any waitlist to any classroom"""
        if request.user.role != 'teacher':
            return Response(
                {"detail": "Only teachers can allocate students"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        student_id = request.data.get('student_id')
        target_classroom_id = request.data.get('target_classroom_id')
        
        if not student_id or not target_classroom_id:
            return Response(
                {"detail": "student_id and target_classroom_id are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            student = User.objects.get(id=student_id, role='student')
            target_classroom = Classroom.objects.get(id=target_classroom_id, teacher=request.user)
        except User.DoesNotExist:
            return Response(
                {"detail": "Student not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Classroom.DoesNotExist:
            return Response(
                {"detail": "Classroom not found or not owned by teacher"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        available_seats = seats_left(target_classroom)
        if available_seats <= 0:
            return Response(
                {"detail": "No available seats in target classroom"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        existing_enrollment = Enrollment.objects.filter(
            student=student,
            classroom__teacher=request.user,
            status=Enrollment.STATUS_WAITLISTED
        ).first()
        
        if not existing_enrollment:
            return Response(
                {"detail": "Student is not on any waitlist for your classrooms"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        target_enrollment = Enrollment.objects.filter(
            student=student,
            classroom=target_classroom
        ).first()
        
        if target_enrollment:
            if target_enrollment.status == Enrollment.STATUS_ENROLLED:
                return Response(
                    {"detail": "Student is already enrolled in target classroom"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                target_enrollment.status = Enrollment.STATUS_ENROLLED
                target_enrollment.save()
                Enrollment.objects.filter(
                    student=student,
                    classroom__teacher=request.user,
                    status=Enrollment.STATUS_WAITLISTED
                ).exclude(id=target_enrollment.id).delete()
        else:
            Enrollment.objects.create(
                student=student,
                classroom=target_classroom,
                status=Enrollment.STATUS_ENROLLED
            )
            Enrollment.objects.filter(
                student=student,
                classroom__teacher=request.user,
                status=Enrollment.STATUS_WAITLISTED
            ).delete()
        
        return Response({
            'detail': f'Successfully allocated {student.first_name} {student.last_name} to {target_classroom.title}',
            'student_name': f"{student.first_name} {student.last_name}",
            'classroom_title': target_classroom.title,
            'seats_left': seats_left(target_classroom)
        }, status=status.HTTP_200_OK)

# STUDENT VIEWS
class StudentAvailableClassroomsView(generics.ListAPIView):
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'student':
            return Classroom.objects.none()
        
        queryset = Classroom.objects.all()
        annotated_queryset = annotate_occupancy(queryset)
        return annotated_queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class StudentMyClassroomsListView(generics.ListAPIView):
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'student':
            return Classroom.objects.none()
        
        queryset = Classroom.objects.filter(
            enrollments__student=self.request.user,
            enrollments__status=Enrollment.STATUS_ENROLLED
        ).distinct()
        
        return annotate_occupancy(queryset)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class StudentClassroomDetailView(generics.RetrieveAPIView):
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'classroom_id'
    
    def get_queryset(self):
        if self.request.user.role != 'student':
            return Classroom.objects.none()
        
        return annotate_occupancy(Classroom.objects.all())
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class StudentEnrollView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, classroom_id):
        """Enroll student in classroom or add to waitlist if full"""
        if request.user.role != 'student':
            return Response(
                {"detail": "Only students can enroll in classrooms"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        classroom = get_object_or_404(Classroom, id=classroom_id)
        
        if hasattr(classroom, 'course'):
            existing_enrollment_in_course = Enrollment.objects.filter(
                student=request.user,
                classroom__course=classroom.course,
                status=Enrollment.STATUS_ENROLLED
            ).exists()
            
            if existing_enrollment_in_course:
                return Response({
                    "detail": "You are already enrolled in a classroom for this course"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        existing_enrollment = Enrollment.objects.filter(
            student=request.user,
            classroom=classroom
        ).first()
        
        available_seats = seats_left(classroom)
        
        if existing_enrollment:
            if existing_enrollment.status == Enrollment.STATUS_ENROLLED:
                return Response({
                    "detail": "Already enrolled",
                }, status=status.HTTP_200_OK)
            elif existing_enrollment.status == Enrollment.STATUS_WAITLISTED:
                if available_seats > 0:
                    existing_enrollment.status = Enrollment.STATUS_ENROLLED
                    existing_enrollment.save()
                    return Response({
                        "detail": "Successfully enrolled (promoted from waitlist)",
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "detail": "Already on waitlist - classroom is full",
                        "available_seats": 0
                    }, status=status.HTTP_200_OK)
            else:
                if available_seats > 0:
                    existing_enrollment.status = Enrollment.STATUS_ENROLLED
                    existing_enrollment.save()
                    return Response({
                        "detail": "Successfully enrolled",
                    }, status=status.HTTP_200_OK)
                else:
                    existing_enrollment.status = Enrollment.STATUS_WAITLISTED
                    existing_enrollment.save()
                    return Response({
                        "detail": "Classroom is full - added to waitlist",
                        "available_seats": 0
                    }, status=status.HTTP_202_ACCEPTED)
        
        try:
            if available_seats > 0:
                enrollment_status = Enrollment.STATUS_ENROLLED
                detail_message = "Successfully enrolled"
                response_status = status.HTTP_201_CREATED
            else:
                enrollment_status = Enrollment.STATUS_WAITLISTED
                detail_message = "Classroom is full - added to waitlist"
                response_status = status.HTTP_202_ACCEPTED
            
            enrollment = Enrollment.objects.create(
                student=request.user,
                classroom=classroom,
                status=enrollment_status
            )
            
            response_data = {
                "detail": detail_message,
                "available_seats": seats_left(classroom)
            }
            
            if enrollment_status == Enrollment.STATUS_WAITLISTED:
                try:
                    if hasattr(enrollment, 'created_at'):
                        waitlist_position = Enrollment.objects.filter(
                            classroom=classroom,
                            status=Enrollment.STATUS_WAITLISTED,
                            created_at__lte=enrollment.created_at
                        ).count()
                    else:
                        waitlist_position = Enrollment.objects.filter(
                            classroom=classroom,
                            status=Enrollment.STATUS_WAITLISTED
                        ).count()
                except AttributeError:
                    waitlist_position = Enrollment.objects.filter(
                        classroom=classroom,
                        status=Enrollment.STATUS_WAITLISTED
                    ).count()
                
                response_data["waitlist_position"] = waitlist_position
            
            return Response(response_data, status=response_status)
            
        except IntegrityError:
            existing_enrollment = Enrollment.objects.get(
                student=request.user,
                classroom=classroom
            )
            if existing_enrollment.status == Enrollment.STATUS_ENROLLED:
                return Response({
                    "detail": "Already enrolled",
                }, status=status.HTTP_200_OK)
            elif existing_enrollment.status == Enrollment.STATUS_WAITLISTED:
                return Response({
                    "detail": "Already on waitlist",
                    "available_seats": seats_left(classroom)
                }, status=status.HTTP_200_OK)
            else:
                if available_seats > 0:
                    existing_enrollment.status = Enrollment.STATUS_ENROLLED
                    existing_enrollment.save()
                    return Response({
                        "detail": "Successfully enrolled",
                    }, status=status.HTTP_200_OK)
                else:
                    existing_enrollment.status = Enrollment.STATUS_WAITLISTED
                    existing_enrollment.save()
                    return Response({
                        "detail": "Classroom is full - added to waitlist",
                        "available_seats": 0
                    }, status=status.HTTP_202_ACCEPTED)

class StudentUnenrollView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def delete(self, request, classroom_id):
        """Unenroll student from classroom"""
        if request.user.role != 'student':
            return Response(
                {"detail": "Only students can unenroll from classrooms"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        classroom = get_object_or_404(Classroom, id=classroom_id)
        
        try:
            enrollment = Enrollment.objects.get(
                student=request.user, 
                classroom=classroom
            )
            
            if enrollment.status == Enrollment.STATUS_ENROLLED:
                enrollment.delete()
                return Response({
                    "detail": "Successfully unenrolled"
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "detail": "Not currently enrolled in this classroom"
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Enrollment.DoesNotExist:
            return Response({
                "detail": "Not enrolled in this classroom"
            }, status=status.HTTP_404_NOT_FOUND)

class StudentJoinWaitlistView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, classroom_id):
        """Join the waitlist for a classroom"""
        if request.user.role != 'student':
            return Response(
                {"detail": "Only students can join waitlists"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        classroom = get_object_or_404(Classroom, id=classroom_id)
        
        if hasattr(classroom, 'course'):
            existing_enrollment_in_course = Enrollment.objects.filter(
                student=request.user,
                classroom__course=classroom.course,
                status=Enrollment.STATUS_ENROLLED
            ).exists()
            
            if existing_enrollment_in_course:
                return Response({
                    "detail": "You are already enrolled in a classroom for this course"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        existing_enrollment = Enrollment.objects.filter(
            student=request.user,
            classroom=classroom
        ).first()
        
        if existing_enrollment:
            if existing_enrollment.status == Enrollment.STATUS_ENROLLED:
                return Response({
                    "detail": "Already enrolled in this classroom"
                }, status=status.HTTP_200_OK)
            elif existing_enrollment.status == Enrollment.STATUS_WAITLISTED:
                return Response({
                    "detail": "Already on the waitlist for this classroom"
                }, status=status.HTTP_200_OK)
            else:
                existing_enrollment.status = Enrollment.STATUS_WAITLISTED
                existing_enrollment.save()
                return Response({
                    "detail": "Successfully joined the waitlist"
                }, status=status.HTTP_200_OK)
        
        try:
            enrollment = Enrollment.objects.create(
                student=request.user,
                classroom=classroom,
                status=Enrollment.STATUS_WAITLISTED
            )
            
            try:
                if hasattr(enrollment, 'created_at'):
                    waitlist_position = Enrollment.objects.filter(
                        classroom=classroom,
                        status=Enrollment.STATUS_WAITLISTED,
                        created_at__lte=enrollment.created_at
                    ).count()
                else:
                    waitlist_position = Enrollment.objects.filter(
                        classroom=classroom,
                        status=Enrollment.STATUS_WAITLISTED
                    ).count()
            except AttributeError:
                waitlist_position = Enrollment.objects.filter(
                    classroom=classroom,
                    status=Enrollment.STATUS_WAITLISTED
                ).count()
            
            return Response({
                "detail": "Successfully joined the waitlist",
                "waitlist_position": waitlist_position,
                "available_seats": seats_left(classroom)
            }, status=status.HTTP_201_CREATED)
            
        except IntegrityError:
            existing_enrollment = Enrollment.objects.get(
                student=request.user,
                classroom=classroom
            )
            if existing_enrollment.status == Enrollment.STATUS_WAITLISTED:
                return Response({
                    "detail": "Already on the waitlist for this classroom"
                }, status=status.HTTP_200_OK)
            else:
                existing_enrollment.status = Enrollment.STATUS_WAITLISTED
                existing_enrollment.save()
                return Response({
                    "detail": "Successfully joined the waitlist"
                }, status=status.HTTP_200_OK)

class StudentLeaveWaitlistView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def delete(self, request, classroom_id):
        """Leave the waitlist for a classroom"""
        if request.user.role != 'student':
            return Response(
                {"detail": "Only students can leave waitlists"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        classroom = get_object_or_404(Classroom, id=classroom_id)
        
        try:
            enrollment = Enrollment.objects.get(
                student=request.user,
                classroom=classroom,
                status=Enrollment.STATUS_WAITLISTED
            )
            enrollment.delete()
            
            return Response({
                "detail": "Successfully left the waitlist"
            }, status=status.HTTP_200_OK)
            
        except Enrollment.DoesNotExist:
            return Response({
                "detail": "You are not on the waitlist for this classroom"
            }, status=status.HTTP_404_NOT_FOUND)

class StudentMyWaitlistsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get student's current waitlists"""
        if request.user.role != 'student':
            return Response(
                {"detail": "Only students can view their waitlists"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        waitlists = Enrollment.objects.filter(
            student=request.user,
            status=Enrollment.STATUS_WAITLISTED
        ).select_related('classroom')
        
        waitlist_data = []
        for enrollment in waitlists:
            try:
                if hasattr(enrollment, 'created_at'):
                    position = Enrollment.objects.filter(
                        classroom=enrollment.classroom,
                        status=Enrollment.STATUS_WAITLISTED,
                        created_at__lte=enrollment.created_at
                    ).count()
                    joined_date = enrollment.created_at
                else:
                    position = Enrollment.objects.filter(
                        classroom=enrollment.classroom,
                        status=Enrollment.STATUS_WAITLISTED,
                        id__lte=enrollment.id
                    ).count()
                    joined_date = None
            except AttributeError:
                position = Enrollment.objects.filter(
                    classroom=enrollment.classroom,
                    status=Enrollment.STATUS_WAITLISTED,
                    id__lte=enrollment.id
                ).count()
                joined_date = None
            
            waitlist_data.append({
                'classroom_id': enrollment.classroom.id,
                'classroom_title': enrollment.classroom.title,
                'joined_date': joined_date,
                'position': position
            })
        
        return Response(waitlist_data, status=status.HTTP_200_OK)

# for non-API usage
@login_required
def classroom_detail(request, classroom_id):
    classroom = get_object_or_404(Classroom, id=classroom_id)
    user = request.user
    
    in_waitlist = False
    if hasattr(user, 'student_profile'):
        in_waitlist = Waitlist.objects.filter(student=user, classroom=classroom).exists()
    
    is_enrolled = classroom.students.filter(id=user.id).exists()
    
    enrolled_students = None
    if hasattr(user, 'teacher_profile') or user.is_staff:
        enrolled_students = classroom.students.all().order_by('first_name', 'last_name')
    
    waitlist_students = None
    if hasattr(user, 'teacher_profile') or user.is_staff:
        waitlist_students = Waitlist.objects.filter(classroom=classroom).select_related('student').order_by('joined_at')
    
    context = {
        'classroom': classroom,
        'in_waitlist': in_waitlist,
        'is_enrolled': is_enrolled,
        'enrolled_students': enrolled_students,
        'waitlist_students': waitlist_students,
    }
    
    return render(request, 'classroom_detail.html', context)

@login_required
def join_waitlist(request, classroom_id):
    classroom = get_object_or_404(Classroom, id=classroom_id)
    user = request.user
    
    if classroom.students.filter(id=user.id).exists():
        messages.warning(request, "You are already enrolled in this classroom.")
        return redirect('classroom_detail', classroom_id=classroom_id)
    
    existing_waitlist = Waitlist.objects.filter(student=user, classroom=classroom)
    if existing_waitlist.exists():
        messages.info(request, "You are already on the waitlist for this classroom.")
        return redirect('classroom_detail', classroom_id=classroom_id)
    
    waitlist_entry = Waitlist.objects.create(student=user, classroom=classroom)
    messages.success(request, "You have been added to the waitlist!")
    
    return redirect('classroom_detail', classroom_id=classroom_id)

@login_required
def add_from_waitlist(request, classroom_id, student_id):
    classroom = get_object_or_404(Classroom, id=classroom_id)
    
    if not hasattr(request.user, 'teacher_profile') and not request.user.is_staff:
        messages.error(request, "You don't have permission to add students.")
        return redirect('classroom_detail', classroom_id=classroom_id)
    
    waitlist_entry = get_object_or_404(Waitlist, classroom=classroom, student_id=student_id)
    classroom.students.add(waitlist_entry.student)
    waitlist_entry.delete()
    
    messages.success(request, f"{waitlist_entry.student.username} has been added to the classroom!")
    return redirect('classroom_detail', classroom_id=classroom_id)

@login_required
def remove_student(request, classroom_id, student_id):
    classroom = get_object_or_404(Classroom, id=classroom_id)
    
    if not hasattr(request.user, 'teacher_profile') and not request.user.is_staff:
        messages.error(request, "You don't have permission to remove students.")
        return redirect('classroom_detail', classroom_id=classroom_id)
    
    student = get_object_or_404(User, id=student_id)
    classroom.students.remove(student)
    
    messages.success(request, f"{student.username} has been removed from the classroom!")
    return redirect('classroom_detail', classroom_id=classroom_id)

class StudentEnrollmentStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, classroom_id):
        """Check student's enrollment status for a classroom and its course"""
        if request.user.role != 'student':
            return Response(
                {"detail": "Only students can check enrollment status"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        classroom = get_object_or_404(Classroom, id=classroom_id)
        
        current_enrollment = Enrollment.objects.filter(
            student=request.user,
            classroom=classroom
        ).first()
        
        enrolled_in_course = False
        if hasattr(classroom, 'course'):
            enrolled_in_course = Enrollment.objects.filter(
                student=request.user,
                classroom__course=classroom.course,
                status=Enrollment.STATUS_ENROLLED
            ).exists()
        
        response_data = {
            'classroom_id': classroom.id,
            'enrolled_in_course': enrolled_in_course,
            'can_enroll': not enrolled_in_course,
            'can_join_waitlist': not enrolled_in_course,
            'current_status': None
        }
        
        if current_enrollment:
            response_data['current_status'] = current_enrollment.status
        
        return Response(response_data, status=status.HTTP_200_OK)