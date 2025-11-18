from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lessons", "0004_alter_lesson_credit_value_to_float"),
    ]

    operations = [
        migrations.AddField(
            model_name="lessoncompletion",
            name="grade",
            field=models.CharField(blank=True, choices=[("HD", "High Distinction"), ("D", "Distinction"), ("C", "Credit"), ("P", "Pass"), ("F", "Fail")], max_length=2, null=True),
        ),
        migrations.AddField(
            model_name="lessoncompletion",
            name="graded_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

