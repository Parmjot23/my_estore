from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_user_additional_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(
                default=False,
                help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.',
                verbose_name='active',
            ),
        ),
    ]
