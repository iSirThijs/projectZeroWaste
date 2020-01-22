# Zero Waste tool

![Zero Waste Previes](/zerowastepreview.png)

This tool is made for the Urban Analytics professorship. It visualizes the contracts made for garbage collection of bussiness garbage.

It includes: 
- A Interactive map of Amsterdam displaying the average garbage per square kilometers
- A chart displaying the categories in which business operate
- Details of an area with a comparison of average garbage per square miles
- Progressive enhanced visualizations allowing to view the basics without JavaScript
- A progressive enhance data upload tool which allows to add more collection companies and create a better visualization

To be added:
- A sunburst chart going into details about the categories
- Zoom into areas of AMS


## Installation

### Prerequisites
To use the tool you need a [mongoDB database](https://www.mongodb.com) to store the data.

### Installation

1. Clone this repo
	```bash
	git clone https://github.com/iSirThijs/projectZeroWaste.git
	```
2. Install dependencies
   ```
   npm install
   ```
3. Create an .env file
   ```
	MONGODB=''
	DB_NAME=''
	SESSION_SECRET= ''
	LOG_LEVEL='debug'
   ```
4. (Optional) Adjust the mongod.conf if needed
5. Start the app with ``` npm start ```
6. The app should now be local on `localhost:8000`

## Usage
### Logger
The app uses [Winston](https://github.com/winstonjs/winston) to log events to the console. Use the environment variable ```LOG_LEVEL``` to adjust the verbosity.

Log levels:
- Error: Logs errors that impact the use of the app
- Warning: Logs non-fatal warnings and errors that don't impact the app now
- Info: For information
- Debug: Logs the major events that the app goes through
- Silly: Logs every event that the app goes through




##

## Used libaries and frameworks
The app uses multiple libaries and frameworks for both front- en backend:

### Linter

* [Eslint]

### Backend
The backend is a node.js webserver. 

  * [Express Web framework](https://expressjs.com) Used to serve the webapp and api for the frontend
  * [EJS - Template rendering](https://ejs.co) Renders the pages server side
  * [D3.js - Rendering Chart](https://d3js.org) Creates the charts (using JSdom)
  * [JSdom - DOM in Node.js](https://github.com/jsdom/jsdom) Used to create server-side charts together with D3
  * [Mongoose - MongoDB object modeling](https://mongoosejs.com) Application layer for use with mongo to model objects
  * [Winston](https://github.com/winstonjs/winston) Used to log
  * [Axios - Node HTTP client](https://github.com/axios/axios) Fetch for node

### Frontend
 * [D3.js - Rendering Chart](https://d3js.org) Creates interactive charts


### Data processing
#### Job Queue
This app processes the trash data through uploading a csv file. These files contain all the businesses in Amsterdam that a collection company visits. 

A file can contain a lot of entries (for example: there are almost 30000 businesses in Amsterdam Zuid). Uploading and processing this takes time and would block node/express from serving the website. The app uses a node.js child process to create a diffent node environment to process the data using a job-queue. 

The job-queue allows the data to be saved and processed in the background:

1. Once a CSV file is uploaded it's metadata is saved as a job into the data base using this model: 
2. The webserver sends a message to the job-queue process, telling there is a job to do.
3. The child_process/job-queue then starts with processing the data: checking the values and saving the entries to the database
4. After saving to the database, the process starts computing totals for areas in Amsterdam
5. When its done with processing the dataset, it checks to see if a new task is added trought the webserver
   * It will process jobs as longs as they are in the queue
   * If there are no jobs anymore, the process goes idle and waits for the webserver to tell if there is a new dataset

#### Wrong and missing data
The data is checked in several ways, it checks if all the needed columns are in the CSV and checks if their values are correct. It will fail a job if this is the case. 

Using mongoose helps with parsing data like numbers and booleans, but most values are strings.

If SBI code is missing, it is assigned to the 'No category' group. 
  
#### Data model

![Datamodel](datamodel.png)