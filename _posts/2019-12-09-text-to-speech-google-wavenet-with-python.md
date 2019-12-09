---
layout: post
title:  "Text-to-Speech - Google WaveNet, with Python"
date:   "2019-12-09 00:00:00"
categories: python
---

In the 1999 film, The Matrix, Morpheus says to Neo, as an option to reveal the Matrix to him, the following:

> "This is your last chance. After this there is no turning back. 
> You take the blue pill, the story ends; you wake up in your bed and believe whatever you want to believe. 
> You take the red pill, you stay in Wonderland and I show you how deep the rabbit hole goes."

Let's have a computer generated voice read this quote to us.

# WaveNet Web Request

The format of this web request came from watching the network activity on this [WaveNet](https://cloud.google.com/text-to-speech/#convert-your-text-to-speech-right-now) web page. I then copied the format of the POST request, made when using the tool under "Convert your text to speech right now". 

The token is generated after CAPTCHA verification, and pressing "RESUME". You will need to copy the new generated token, found in the POST request, into the code below.

```python
import requests, base64, json
import urllib.parse

params = {
    "url" : "https://texttospeech.googleapis.com/v1beta1/text:synthesize",
    "token" : "" # replace with newly generated token
}

queryString = urllib.parse.urlencode(params)
url = "https://cxl-services.appspot.com/proxy" + '?' + queryString 
```

The body of request contains the customizable parameters, as well as the actual text to use for audio generation. I've raised the pitch to my liking, in this example. 

```python
# change this text to any suitable string
text = "This is your last chance. After this there is no turning back. You take the blue pill, the story ends; you wake up in your bed and believe whatever you want to believe. You take the red pill, you stay in Wonderland and I show you how deep the rabbit hole goes."

body = {
  "audioConfig": {
    "audioEncoding": "LINEAR16",
    "pitch": 2, # change the pitch, default 1
    "speakingRate": 1 # change the speed of speaking, default 1
  },
  "input": {
    "text": text
  },
  "voice": {
    "languageCode": "en-US",
    "name": "en-US-Wavenet-E"
  }
}
```
Now it's time to send a POST request, and get the audio in response. Here I am writing the audio to a file, to play anytime.

```python
response = requests.post(url, json=body)
data = json.loads(response.text)
audio = data["audioContent"]

with open("voice.wav", "wb") as fout:
    # decode and write the audio data to a file
    fout.write( base64.b64decode(audio) ) 
```
