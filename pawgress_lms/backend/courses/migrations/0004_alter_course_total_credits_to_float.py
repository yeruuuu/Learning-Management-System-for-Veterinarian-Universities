from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0003_alter_courseenrollment_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="course",
            name="total_credits",
            field=models.FloatField(default=0.0),
        ),
    ]
