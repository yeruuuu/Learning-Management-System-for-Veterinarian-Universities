from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lessons", "0005_lessoncompletion_grade"),
    ]

    operations = [
        migrations.AddField(
            model_name="lessoncompletion",
            name="comment",
            field=models.TextField(blank=True),
        ),
    ]

