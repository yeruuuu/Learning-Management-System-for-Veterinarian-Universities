from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lessons", "0002_lessoncompletion"),
    ]

    operations = [
        migrations.AddField(
            model_name="lesson",
            name="additional_notes",
            field=models.TextField(blank=True),
        ),
    ]

