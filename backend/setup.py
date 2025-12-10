from setuptools import setup, find_packages

setup(
    name='benkyfy-backend',
    version='2.0.0',
    packages=find_packages(),
    python_requires='>=3.9',
    install_requires=[
        'Flask==3.0.0',
        'Flask-Dance==7.0.0',
        'Flask-Session==0.5.0',
        'Flask-RESTX==1.3.0',
        'Flask-CORS==4.0.0',
        'Flask-SQLAlchemy==3.1.1',
        'requests==2.31.0',
        'python-dotenv==1.0.0',
        'gunicorn==21.2.0',
        'oauthlib==3.2.2',
        'itsdangerous==2.1.2',
        'psycopg2-binary==2.9.9',
        'colorama==0.4.6',
    ],
)
