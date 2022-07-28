# Connect TruBudget to PowerBI with Dynamic Token Request
This readme explains how to connect PowerBI to TruBudget via it's API. As a core element, the necessary Power Query M script to dynamically generate a bearer token will be provided. As a result, you will be able to automatically fetch data from TruBudget into PowerBI for further evaluation and visualisation.

Note: all fields you have to modify in this readme are indicated by "<...>". 

## Get Token Manually from Postman 
Use the user.authenticate POST-request in Postman to obtain a bearer token manually. Copy this token as you will need it in the next step to initially connect PowerBI to the TruBudget API. 

## Connect PowerBI to TruBudget via API
In the next step PowerBI will be connected to TruBudget via the API using - for now - the manually generated bearer token. 

To set up the API connection to TruBudget, you have to:
1) add a new web source in PowerBI Desktop
2) go to the advanced settings
3) paste the API URL of the data source you want to connect (can be obtained from Postman)
4) in the "HTTP request header parameters" field, write "Authorization" and for the value enter "Bearer <Token you have generate manually in Postman>". Pay attention that a space is between "Bearer" and the token you entered.
5) connect to the API. The according data of the API URL will appear in PowerBI. 

## Generate token dynamically

1) in the Power Query editor, add a blank query as a new source
2) open the blank query in the advanced editor

Use this skript to generate a dynamic token - modify all fields indicated by the "<..>": 

```
let

url = "<API URL>",

headers = [#"Content-Type" = "application/json"],

postData = Json.Document("{""apiVersion"":""1.0"",""data"":{""user"":{""id"":""<Username>"",""password"":""<Password>""}}}"),

response = Web.Contents(

url,

[

Headers = headers,

Content = Text.ToBinary("{""apiVersion"":""1.0"",""data"":{""user"":{""id"":""<Username>"",""password"":""<Password>""}}}")

]

),

res = Json.Document(response),

data = Record.Field(res,"data"),

user = Record.Field(data, "user"),

access_token = Record.Field(user, "token")

in

access_token

```

If the query is working correctly, you will receive a bearer token as a result.

### Convert Query to Function
3) rename the query to "GetToken"
4) in the Advanced Editor for the query, add "()=> " at the very beginning of the script before "let"

This will transform the query into a function.

### Replace Access Token of Dataset with Function 
In this step, you need to replace the hardcoded access token (you entered manually for the first API connection) with the just created GetToken() function.
1) open the Advanced Editor for the dataset you fetched from the API
2) in the script, replace the hardcoded access token in the Source Headers section with "&GetToken()". Make sure there is a space between the "Bearer" and "&GetToken()". 

To verify the successful API connection, click on "refresh data set", which should run smoothly. 

