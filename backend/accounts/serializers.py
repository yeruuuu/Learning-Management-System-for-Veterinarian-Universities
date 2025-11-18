from django.contrib.auth import get_user_model
from rest_framework import serializers 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed  #CHECK need to check this import

User = get_user_model()



#this is get the valies and inputs for the registration
class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)


    class Meta:
        model = User
        fields = ['role','first_name','last_name', 'email', 'password'] #this fields base is based on what the client said

    def create(self, validated_data):
        role = validated_data.get('role')


        if role == 'student':
        
            validated_data['is_approved'] = True  #this is because the students dont need to be approved
            validated_data['is_staff'] = False # making the students not staff
        elif role == 'teacher':
            validated_data['is_approved'] = False  #this is because teachers need to be approved by admin
            validated_data['is_staff'] = True # making the teachers staff

        user = User(
            
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role,
            is_approved=validated_data['is_approved'],
            is_staff=validated_data.get('is_staff', False),
           
        )


        #setting the password and the username
        user.username = validated_data['email']
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id','email', 'role', 'is_approved', 'first_name', 'last_name', 'avatar_url']
        extra_kwargs = {
            'password': {'write_only': True}} #dont want it to be read 

    def get_avatar_url(self, obj):
           request = self.context.get("request")
           if obj.avatar:
               url = obj.avatar.url
               return request.build_absolute_uri(url) if request else url
           return None

    #creating of the token, with custom stuff,  will be used by the frontend :o

class ModifiedObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        #extending the token to include the role and the email
        token['email'] = user.email
        token['role'] = user.role
    
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        #will be using this for testing in the rest framework to see the user
        data['email'] = self.user.email
        data['role'] = self.user.role


        if self.user.role == 'teacher' and not self.user.is_approved:
            raise AuthenticationFailed('The teacher account is not approved yet.')

        return data


class AccountMeSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'first_name', 'last_name', 'avatar', 'avatar_url']
        read_only_fields = ['id', 'email', 'role']

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar:
            url = obj.avatar.url
            return request.build_absolute_uri(url) if request else url
        return None


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return attrs




