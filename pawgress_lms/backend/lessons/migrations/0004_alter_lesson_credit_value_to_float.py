from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lessons", "0003_lesson_additional_notes"),
    ]

    operations = [
        migrations.AlterField(
            model_name="lesson",
            name="credit_value",
            field=models.FloatField(default=0.0),
        ),
    ]

