onRecordAfterConfirmVerificationRequest((e) => {
    const confirmedEmail = e.record.email();
    console.log('email', confirmedEmail);
    const creditsColl = $app.dao().findCollectionByNameOrId('credits');
    const record = new Record(creditsColl, {
        email: confirmedEmail,
        credits: 300,
    })
    $app.dao().saveRecord(record);
})

routerAdd('POST', '/query', (c) => {
    const user = c.get("authRecord");
    if (!user) {
        return c.json(403, {message: "Click the extension icon in the top right to login first"});
    }
    if (!user.verified) {
        console.log("user not verified");
        return c.json(400, {message: "You need to verify your email first!"});
    }
    const numCreditsRecord = $app.dao().findFirstRecordByData("credits", "email", user.email())
    const credits = numCreditsRecord.getInt('credits');
    if (credits <= 0) {
        return c.json(400, {message:"You don't have any credits left. DM me"})
    }

    numCreditsRecord.set("credits", credits - 1);
    $app.dao().saveRecord(numCreditsRecord);

    const query = $apis.requestInfo(c).data;
    const systemPrompt = "You are a helpful assistant helping a medical student study for their board exams.";
    const userPrompt = `\
  I am working on this question:
  <Question>
  ${query.question}
  </Question>
  
  Here are the answer choices:
  <Answers>
  ${query.answers}
  </Answers>
  
  And here is an in-depth explanation:
  <Explanation>
  ${query.explanation}
  </Explanation>
  
  With that in mind, here's what I want to know from you:
  ${query.input}
  `;

    const res = $http.send({
        url:    "https://api.endpoints.anyscale.com/v1/chat/completions",
        method: "POST",
        body:   JSON.stringify({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1", // "Open-Orca/Mistral-7B-OpenOrca"
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3000,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + $os.getenv('ANYSCALE_API_KEY')
        }
    });
    const res_json = res.json;
    
    console.log(JSON.stringify(res_json));
    const reply = res_json.choices[0].message.content;
    console.log(res_json.usage.total_tokens);

    return c.json(200, {message: '' + reply, credits: credits - 1});
})