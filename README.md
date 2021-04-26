# Ocean

## A social media platform made to aid people suffering from mental health issues and to provide them with help through our features.

#### [Click here for the youtube video link](https://youtu.be/keqzEagBX9w) 

#### [Click here for the PPT](Round%202%20Submission.pdf)

## Prequisites on the local machine to project to be run:

1. Python 3.6 or above 
2. Node JS v12.0.0 or above 
3. Yarn 1.22.4
4. Expo SDK 38
5. pip 3 v20.0.x or above
 
<hr>

## Steps to run the project on the local machine

1. Clone this repository into your local machine by using<br> 
    `git clone https://github.com/tanmaypardeshi/PULSE-X.git`

* ### Setting up the django and flask development server:

1. Install virtualenv using **pip3 install virtualenv**
2. Create a new virtualenv using **virtualenv venv**
3. Activate virtualenv using **source venv/bin/activate**
4. Install all required dependencies using **pip install -r requirements.txt**
5. cd into the <i>backend</i> directory and run the migrations using <i>makemigrations</i> and <i>migrate</i>. Navigate to [settings.py](backend/backend/settings.py) and add your email and password to use the mailer facility.
6. To run the django development server **python manage.py runserver**.
7. Deactivate the virtualenv using **deactivate**.
8. To run the flask server, cd into coral and enter the necessary details in [coral_config.json](coral/apis/coral_config.json). 
9. Run **python run.py**.

**Note: Step 1,2,4,5 and 8 are one time process to set up data and dependencies**.

* ### Setting up the react local server:

1. cd into the <i>frontend</i> directory.
2. Use command **yarn** to install node modules for the front end.
3. Keep the django server up and running to make the website functional.
4. Once the node modules have been installed, run **yarn start** to start the development server.

* ### Setting up expo SDK for the mobile app:

1. cd into the <i>mobile</i> directory.
2. Use command **yarn** to install node modules for the mobile app.
3. Keep the django server up and running on your local network to make the app functional.
    **Note that the command for the django server in this case will be python manage.py runserver <ip-address>:8000**
4. Once the node modules have been installed, run **yarn start** to start the expo server.
5. Scan the QR code on your mobile device using the expo app available on play store.

<hr>



