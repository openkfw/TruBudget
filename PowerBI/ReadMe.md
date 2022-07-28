# Connect TruBudget to PowerBI with Dynamic Token Request
This readme explains how to connect PowerBI to TruBudget via it's API. As a core issue, this explanation will provide the necessary Power Query M skript to dynamically generate a token, which will in turn be used to get the respective data from TruBudget.

## Get Token Manually from Postman 
Use the user.authenticate POST request in Postman to obtain a bearer token manually. Copy this token as you will need it to connect PowerBI to the TruBudget API. 

## Connect PowerBI to TruBudget via API
In the next step PowerBI will be connected to TruBudget via the API using - for now - the manually generated token. 

1) to set up the API connection you have to add a new web source
2) go to the advanced settings
3) paste the API URL of the data source you want to connect
4) in the "HTTP request header parameters" write "Authorization" and for the value enter "Bearer [Token you have generate manually in Postman]". 
5) connect to the API. The according data to the API URL will appear in PowerBI. 

## Generate token dynamically

1) in the Power Query editor add a blank query as a new source.
2) open the advanced editor


Use this skript to generate a dynamic token - modify all fields indicated with the "<..>": 

```
let

url = "<URL>",

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

If the call is working correctly, you will receive the token as a result.

### Convert Query to Function
3) Rename the Query to "GetToken"
4) in the Advanced Editor for the query add "()=> " at the very beginning before "let"

This will transform the Query into a function.

### Replace Access Token of Dataset with Function 
In this step, you need to replace the hardcoded access token (you entered manually for the first API connection) with the just created GetToken() function.
1) Open the Advanced Editor for the dataset you pulled from the API
2) in the skript, replace the hardcoded access token with "&GetToken()". Make sure there is a space between the "Bearer" and "&GetToken()". 

To verify the successful API connection, click on refresh data set, which should run smoothly. 

