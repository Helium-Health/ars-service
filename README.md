# Antenatal Risk Stratification (ARS) Service

An open-source implementation of the Antenatal Risk Stratification (ARS) engine to assess and determine pregnancy risk levels in pregnant women, guiding them to the appropriate level of care based on specific health criteria.

## Author

**Helium Health**  
Contact: Adeola Victor Banjo - [adeola@heliumhealth.com]

## Overview

The ARS service assesses pregnancy risk exposure levels by analyzing responses to a structured set of stratification questions. This questionnaire, developed by medical professionals, gathers key details about a patient’s health, allowing the system to categorize responses into risk levels. This risk stratification aims to direct women to suitable levels of antenatal care.

The stratification questionnaire is divided into sections that probe different aspects of health, including:

- **Biodata**: Captures background information of the respondent.
- **Obstetric History**: Records previous pregnancies and details related to the current one.
- **Pregnancy Symptoms**: Gathers information on symptoms during the current pregnancy.
- **Physical Examination Findings**: Collects data on the physical state of the respondent.
- **Medical History**: Looks into past medical or surgical conditions that could impact pregnancy.
- **Investigation Results**: Records results from medical tests conducted during antenatal visits.
- **Drug History**: Establishes a record of any drug, alcohol, or smoking history.

## Features

The ARS system supports both web and USSD interfaces for seamless access to antenatal care information and risk assessment:

- **ARS Web Interface**: Facilitates pregnancy risk stratification through API endpoints for web applications.

  ### Web API Endpoints

  - **Questionnaire Submission and Risk Stratification Endpoint**  
    Accepts patient responses to the stratification questionnaire and categorizes the risk level:
    - **High Risk**: Risk score > 7
    - **Medium Risk**: Risk score between 2 and 6
    - **Low Risk**: Risk score = 1

  ### Endpoint: `POST /ars/stratify`
  The endpoint helps to stratify patients response to the risk categories, and give recommendations on the required action based on the risk exposure.

  #### Sample Request Payload

  ```json
    {
      "patient_id": "12345",
      "response": [
          {
              "id": 1,
              "questions": [
                  {
                      "number": "a",
                      "response": 24
                  }
              ]
          },
          {
              "id": 2,
              "questions": [
                  {
                      "number": "a",
                      "response": "Married"
                  },
                  {
                      "number": "b",
                      "response": "No"
                  }
              ]
          },
          {
              "id": 3,
              "questions": [
                  {
                      "number": "a",
                      "response": "No"
                  },
                  {
                      "number": "b",
                      "response": 3
                  }
              ]
          },
          {
              "id": 4,
              "questions": [
                  {
                      "number": "a",
                      "response": "No"
                  },
                  {
                      "number": "b",
                      "response": "2023-10-17"
                  },
                  {
                      "number": "c",
                      "response": "No"
                  }
              ]
          },
          {
              "id": 5,
              "questions": [
                  {
                      "number": "a",
                      "response": "More than one baby"
                  }
              ]
          },
          {
              "id": 6,
              "questions": [
                  {
                      "number": "a",
                      "response": "Miscarriage"
                  },
                  {
                      "number": "b",
                      "response": 3
                  },
                  {
                      "number": "c",
                      "response": "No"
                  }
              ]
          },
          {
              "id": 7,
              "questions": [
                  {
                      "number": "a",
                      "response": "No"
                  }
              ]
          },
          {
              "id": 8,
              "questions": [
                  {
                      "number": "a",
                      "response": [
                          "Normal delivery (vaginal delivery)"
                      ]
                  }
              ]
          },
          {
              "id": 9,
              "questions": [
                  {
                      "number": "a",
                      "response": [
                          "Not sure"
                      ]
                  }
              ]
          },
          {
              "id": 10,
              "questions": [
                  {
                      "number": "a",
                      "response": "Yes"
                  },
                  {
                      "number": "b",
                      "response": [
                          "Child did not cry at birth"
                      ]
                  }
              ]
          },
          {
              "id": 11,
              "questions": [
                  {
                      "number": "a",
                      "response": "Yes"
                  },
                  {
                      "number": "b",
                      "response": "In-vitro fertilization"
                  }
              ]
          },
          {
              "id": 12,
              "questions": [
                  {
                      "number": "a",
                      "response": "Yes"
                  },
                  {
                      "number": "b",
                      "response": "Slightly heavy (up to 3 pads a day for over 2 days)"
                  }
              ]
          },
          {
              "id": 13,
              "questions": [
                  {
                      "number": "a",
                      "response": "No"
                  },
                  {
                      "number": "b",
                      "response": 6
                  }
              ]
          },
          {
              "id": 14,
              "questions": [
                  {
                      "number": "a",
                      "response": "No"
                  }
              ]
          },
          {
              "id": 15,
              "questions": [
                  {
                      "number": "a",
                      "response": "Yes"
                  }
              ]
          },
          {
              "id": 16,
              "questions": [
                  {
                      "number": "a",
                      "response": "Yes"
                  }
              ]
          },
          {
              "id": 17,
              "questions": [
                  {
                      "number": "a",
                      "response": "Normal baby movement (12 or more kicks within 12 hours)"
                  }
              ]
          },
          {
              "id": 18,
              "questions": [
                  {
                      "number": "a",
                      "response": "Severe headache ,abnormal body movement and difficulty with seeing"
                  }
              ]
          },
          {
              "id": 19,
              "questions": [
                  {
                      "number": "a",
                      "response": ["Weight loss", "Dizziness"]
                  }
              ]
          },
          {
              "id": 20,
              "questions": [
                  {
                      "number": "a",
                      "response": "Fever & mild abdominal pain only"
                  }
              ]
          },
          {
              "id": 21,
              "questions": [
                  {
                      "number": "a",
                      "response": [
                          "HIV"
                      ]
                  },
                  {
                      "number": "b",
                      "response": "No"
                  },
                  {
                      "number": "c",
                      "response": 200
                  }
              ]
          },
          {
              "id": 22,
              "questions": [
                  {
                      "number": "a",
                      "response": [
                          "Bone/ Joint pain that comes and goes, body pain, and shortness of breath"
                      ]
                  }
              ]
          },
          {
              "id": 23,
              "questions": [
                  {
                      "number": "a",
                      "response": [
                          "None of the above"
                      ]
                  }
              ]
          },
          {
              "id": 24,
              "questions": [
                  {
                      "number": "a",
                      "response": ["Cocaine"]
                  }
              ]
          },
          {
              "id": 25,
              "questions": [
                  {
                      "number": "a",
                      "response": "Yes"
                  },
                  {
                      "number": "b",
                      "response": ["Physical disability"]
                  }
              ]
          },
          {
              "id": 26,
              "questions": [
                  {
                      "number": "a",
                      "response": ["Blood present (+)",  "Protein present (+)"]
                  }
              ]
          },
          {
              "id": 27,
              "questions": [
                  {
                      "number": "a",
                      "response": "Positive on ART"
                  }
              ]
          },
          {
              "id": 28,
              "questions": [
                  {
                      "number": "a",
                      "response": ["Normal results/ none of the above"]
                  }
              ]
          },
          {
              "id": 29,
              "questions": [
                  {
                      "number": "a",
                      "response": "Negative"
                  }
              ]
          },
          {
              "id": 30,
              "questions": [
                  {
                      "number": "a",
                      "response": "Positive"
                  }
              ]
          },
          {
              "id": 31,
              "questions": [
                  {
                      "number": "a",
                      "response": "Negative"
                  }
              ]
          },
          {
              "id": 32,
              "questions": [
                  {
                      "number": "a",
                      "response": "A-,  B-, AB-, O-"
                  }
              ]
          },
          {
              "id": 33,
              "questions": [
                  {
                      "number": "a",
                      "response": "PCV between 24% to 32%"
                  }
              ]
          },
          {
              "id": 34,
              "questions": [
                  {
                      "number": "a",
                      "response": ["Breech presentation"]
                  }
              ]
          }
      ]
  }
  ```

  #### Sample Response
  ```json
      {
      "patient_id": "abc12345",
      "risk_level": "high",
      "risk_value": 105,
      "patient_response": "[{\"id\":1,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":24,\"riskValue\":0}]},{\"id\":2,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":\"Married\",\"riskValue\":0}]},{\"id\":3,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":\"No\",\"riskValue\":7},{\"number\":\"b\",\"response\":3,\"riskValue\":0}]},{\"id\":4,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":\"No\",\"riskValue\":1},{\"number\":\"b\",\"response\":13,\"riskValue\":0},{\"number\":\"c\",\"response\":\"No\",\"riskValue\":1}]},{\"id\":5,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"More than one baby\",\"riskValue\":7}]},{\"id\":6,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"Miscarriage\",\"riskValue\":7},{\"number\":\"b\",\"response\":3,\"riskValue\":7},{\"number\":\"c\",\"response\":\"No\",\"riskValue\":7}]},{\"id\":7,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"No\",\"riskValue\":7}]},{\"id\":8,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":[\"Normal delivery (vaginal delivery)\"],\"riskValue\":0}]},{\"id\":9,\"riskValue\":1,\"questions\":[{\"number\":\"a\",\"response\":[\"Not sure\"],\"riskValue\":1}]},{\"id\":10,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"Yes\",\"riskValue\":7},{\"number\":\"b\",\"response\":[\"Child did not cry at birth\"],\"riskValue\":7}]},{\"id\":11,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"Yes\",\"riskValue\":7},{\"number\":\"b\",\"response\":\"In-vitro fertilization\",\"riskValue\":7}]},{\"id\":12,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"Yes\",\"riskValue\":7},{\"number\":\"b\",\"response\":\"Slightly heavy (up to 3 pads a day for over 2 days)\",\"riskValue\":7}]},{\"id\":13,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":\"No\",\"riskValue\":0}]},{\"id\":14,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":\"No\",\"riskValue\":0}]},{\"id\":15,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"Yes\",\"riskValue\":7}]},{\"id\":16,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":\"Yes\",\"riskValue\":0}]},{\"id\":17,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":\"Normal baby movement (12 or more kicks within 12 hours)\",\"riskValue\":0}]},{\"id\":18,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"Severe headache ,abnormal body movement and difficulty with seeing\",\"riskValue\":7}]},{\"id\":19,\"riskValue\":1,\"questions\":[{\"number\":\"a\",\"response\":[\"Weight loss\",\"Dizziness\"],\"riskValue\":1}]},{\"id\":20,\"riskValue\":1,\"questions\":[{\"number\":\"a\",\"response\":\"Fever & mild abdominal pain only\",\"riskValue\":1}]},{\"id\":21,\"riskValue\":1,\"questions\":[{\"number\":\"a\",\"response\":[\"HIV\"],\"riskValue\":7},{\"number\":\"b\",\"response\":\"No\",\"riskValue\":7},{\"number\":\"c\",\"response\":200,\"riskValue\":1}]},{\"id\":22,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":[\"Bone/ Joint pain that comes and goes, body pain, and shortness of breath\"],\"riskValue\":7}]},{\"id\":23,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":[\"None of the above\"],\"riskValue\":0}]},{\"id\":24,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":[\"Cocaine\"],\"riskValue\":7}]},{\"id\":25,\"riskValue\":1,\"questions\":[{\"number\":\"a\",\"response\":\"Yes\",\"riskValue\":7},{\"number\":\"b\",\"response\":[\"Physical disability\"],\"riskValue\":1}]},{\"id\":26,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":[\"Blood present (+)\",\"Protein present (+)\"],\"riskValue\":7}]},{\"id\":27,\"riskValue\":1,\"questions\":[{\"number\":\"a\",\"response\":\"Positive on ART\",\"riskValue\":1}]},{\"id\":28,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":[\"Normal results/ none of the above\"],\"riskValue\":0}]},{\"id\":29,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":\"Negative\",\"riskValue\":0}]},{\"id\":30,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"Positive\",\"riskValue\":7}]},{\"id\":31,\"riskValue\":0,\"questions\":[{\"number\":\"a\",\"response\":\"Negative\",\"riskValue\":0}]},{\"id\":32,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":\"A-,  B-, AB-, O-\",\"riskValue\":7}]},{\"id\":33,\"riskValue\":1,\"questions\":[{\"number\":\"a\",\"response\":\"PCV between 24% to 32%\",\"riskValue\":1}]},{\"id\":34,\"riskValue\":7,\"questions\":[{\"number\":\"a\",\"response\":[\"Reduced/Increased liquor volume\",\"Breech presentation\"],\"riskValue\":7}]}]",
      "recommendation": "Thank you for completing the questionnaire. Based on the information provided, your pregnancy requires a high level of attention and we recommend that you visit any of our facilities closest to you to continue this survey within the next 24 hours.",
      "platform": "web",
      "id": "921bc793",
      "createdAt": "2024-11-08T15:21:10.000Z",
      "updatedAt": "2024-11-08T15:21:10.000Z"
    }

- **Retrieve Stratification Results Endpoint**  
  This endpoint retrieves the stratification results for a specific patient, categorized by risk levels. It provides detailed information about each patient’s assessment, enabling healthcare providers to review and act on the stratified data.

  ### Endpoint: `GET /ars/results`
  
  - **Query Parameters:**
    - `patient_id` (optional): Retrieve results for a specific patient by ID. If omitted, results for all patients will be returned.
    - `risk_level` (optional): Filter results by risk category (`high`, `medium`, `low`).

  #### Sample Request
  ```bash
  GET /ars/results?patient_id=12345&risk_level=high


- **Create Patient Profile Endpoint**  
  This endpoint allows the creation of a new patient profile in the ARS system.

  ### Endpoint: `POST /patients`
  
  - **Request Payload:**
    ```json
    {
      "firstName": "Queen",
      "lastName": "Elizabeth",
      "state": "Lagos",
      "lga": "Alimosho",
      "phoneNumber": "+2347069639117",
      "email": "queen@gmail.com"
    }
    ```

  #### Field Descriptions:
  - **firstName:** The patient’s first name.
  - **lastName:** The patient’s last name.
  - **state:** State of residence for the patient.
  - **lga:** Local government area of residence.
  - **phoneNumber:** Contact phone number of the patient.
  - **email:** Contact email for the patient.

  #### Sample Response
  ```json
  {
    "status": "success",
    "message": "Patient created successfully",
    "data": {
      "id": "abc12345",
      "firstName": "Queen",
      "lastName": "Elizabeth",
      "state": "Lagos",
      "lga": "Alimosho",
      "code": "234786",
      "phoneNumber": "+2347069639117",
      "email": "queen@gmail.com",
      "createdAt": "2024-10-15T12:00:00Z"
    }
  }


- **ARS USSD Interface**: Facilitates pregnancy risk stratification through ussd application.

The ARS USSD Interface allows patients to provide response regarding each of the questionnaire sections through a ussd application.
On completion of the questionnaire, the responses to each question are combined and the stratification rule is applied to get the overall risk.

  ### USSD API Endpoints

  - **Assessment taking and Risk Stratification Endpoint** 

    Allows patients to take the questionnaires and stratifies the overall response on completion of the questionnaire
    - **High Risk**: Risk score > 7
    - **Medium Risk**: Risk score between 2 and 6
    - **Low Risk**: Risk score = 1

  ### Endpoint: `POST /ussd/chat`
 This endpoint enables interaction with the USSD chat system, allowing users to send responses to the ARS service through USSD. The process flow involves:

 - Questionnaire Prompting: The endpoint receives incoming messages from RapidPro, which presents the questionnaire in sequence to patients.

 - Live System Setup: In the live environment, the setup is integrated with the Africa's Talking (AIT) API. This integration connects the ARS Service with Telecom providers, allowing for seamless delivery of questions to patients.

 - Response Collection: AIT transmits the questions from RapidPro directly to patients, allowing them to respond to each question in real time.

  #### Sample Request
  
  ```bash
  curl -X POST "/ussd/chat" \
  -F "phoneNumber=+2347087654312" \
  -F "serviceCode=*123#" \
  -F "text=1*2*3" \
  -F "sessionId=abc12345"

- **Endpoint to Receive from Rapid-Pro** 

### Endpoint: `POST /ussd/from-rapid-pro`

- **Description:**  
  This endpoint receives the next question to be answered by the patient from Rapid-Pro in a predefined order. It is connected to the chat endpoint through an event-driven mechanism, ensuring seamless communication between Rapid-Pro and the USSD chat system.

- **Functionality:**
  - **Question Delivery:**  
    Rapid-Pro sends the next question in the sequence to this endpoint, which then triggers the USSD chat to present the question to the patient.
  
  - **Event Connection:**  
    The connection between this endpoint and the chat endpoint is established via events, enabling real-time updates and interactions within the questionnaire flow.

- **Setup Requirements:**
  - **Rapid-Pro API Integration:**  
    To achieve a complete setup of the USSD application, the Rapid-Pro API must be spun up. This integration allows for the seamless ordering and flow of the questionnaire, ensuring that questions are delivered to patients in the correct sequence.

  - **Configuration Steps:**
    1. **Start Rapid-Pro API:**  
       Ensure that the Rapid-Pro API is running and properly configured to send questions to the ARS service.
    
    2. **Connect to Chat Endpoint:**  
       Verify that the event connection between the Rapid-Pro receiver endpoint and the USSD chat endpoint is active and functioning correctly.
    
    3. **Test Questionnaire Flow:**  
       Conduct tests to confirm that questions are being received from Rapid-Pro and presented to patients in the intended order without any disruptions.


## Framework and Technologies

- Node.js (Nest.js)
- Rapid-Pro (For USSD questionnaire flows)
- Docker
- Sqlite
- Redis

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## USSD Application

The USSD interface of the ARS system enables patients without good access to smart phone and internet to get stratified for their pregnancies via ussd application.
The USSD application requires Rapid-pro and Redis to be up to work as expected. The Rapid-pro (https://home.rapidpro.io/)
helps to control the flow and order of the questions in the questionnaire while redis help to manage user sessions while taking the questionnaires so that a single session is maintained from the beginning to end of the questionnaire.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
