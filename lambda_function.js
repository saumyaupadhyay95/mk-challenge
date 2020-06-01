console.log('Loading function');
const AWS = require('aws-sdk'); 
let db = new AWS.DynamoDB();
exports.handler = (event, context, callback) => {

    function formatResponse(data, code) {
      return { 
        statusCode: code,
        headers: {
          'Access-Control-Allow-Origin': '*' 
        },
        body: JSON.stringify(data)
      }
    }

    let item = {
      
      "name" : event.name,
      "message" : event.message,
      "email": event.email,
      "date": Date.now()
    };

    console.log(item)
    let params = {
      TableName: "Emails", 
      Item: { 
        "name" :
              { S : event.name},
        "message" : 
              { S : event.message},
      "email": 
              { S : event.email },
       "date":
              { S : Date.now().toString()}
        
      }
    };

    console.log(params);

    db.putItem(params, function(err, data) {
      if (err) {
        console.log(err);
        return formatResponse(err, 400);
      }
      else return formatResponse(data, 200);
    });
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <p>Hi, ${event.name}</p>
        <p>Your message was: ${event.message}</p>
      </body>
    </html>
  `;
  const textBody = `
    Hi ${event.name},
    Your message was: ${event.message}
  `;
  const email_params = {
    Destination: {
      ToAddresses: [event.email]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Message submitted"
      }
    },
    Source: "saumyaupadhyay09@gmail.com"
  };

  // Create the promise and SES service object
  const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(email_params)
    .promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(data => {
      console.log(data.MessageId);
      context.done(null, "Success");
    })
    .catch(err => {
      console.error(err, err.stack);
      context.done(null, "Failed");
    });
};
