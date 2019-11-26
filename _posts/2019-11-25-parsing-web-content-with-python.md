---
layout: post
title:  "Parsing Web Content With Python"
date:   2019-11-25 00:00:00 -0000
categories: python
---

Let's download the complete works of H.P. Lovecraft. We will accomplish this by parsing webpages that have the stories as text on them.

I'm assuming you have Python 3 installed, and have an understanding of the syntax. But perhaps you don't have a couple of the required libraries installed.

### Installing Required Libraries
```console
pip3 install requests
pip3 install beautifulsoup4
```
And if sudo is needed for either of these commands:
```console
sudo !!
```
Using ```!!``` is a nice way to copy the same command that was previously entered.


### Parsing the Web Content

Let's first set things up with the necessary imports, and get the content we want to parse. I also recommend following the URL in the code snippet to understand what we are parsing. *Note that you will want to make a new directory to run this code in. It will fill up what ever directory you run it in, with the stories we are about the parse.*

```python
import requests
import re
from bs4 import BeautifulSoup
import json

# replace this url with any valid website's url 
url = "http://www.hplovecraft.com/writings/sources/hplcf.aspx"
# retrieve all of the html content on the web page
source = requests.get(url)
# create a Beutiful Soup object to assist in parsing
soup = BeautifulSoup(source.text, "html.parser")
```

This is where things get messy. After using a suitable browser's developer tools to inspect the pages of interest, I was able to come up with a solution to parsing the pages.

```python
# this turned out to be the base url for each story
storiesBaseURL = "http://www.hplovecraft.com/writings/texts/fiction/"
# find all anchor links using a regular expression to match on the href attribute
anchors = soup.find_all("a", href=re.compile("../fiction/*"))
stories = []
# gather a list of the stories
for anchor in anchors:
    # use get_text() to exclude all html tags from the object, and just get the text
    title = anchor.get_text()
    # grab the href attribute on the anchor link
    href = anchor["href"]
    # we only want the file name at the end of the href attribute
    filename = href.split("/")[-1]
    fullURL = storiesBaseURL + filename 
    # append each story title and URL, in a tuple, to the stories list
    stories.append( (title, fullURL) )
```

Now that we have the URLs to each story, we can parse over each one of these pages, and get the content of each story. This is done in a similar fashion to how we parsed the main page before.

```python
for story in stories:
    title, url = story[0], story[1]
    source = requests.get(url)
    soup = BeautifulSoup(source.text, "html.parser")
    # find all div tags where the html attribute align equals "justify"
    divs = soup.find_all("div", align="justify")
    # save all content to a file with the title as the filename
    with open(title + ".txt", 'w') as fout:
        fout.write("H.P. Lovecrafts's " + title)
        fout.write(divs[0].get_text())
```

Now you can enjoy all the cosmic horror H.P. Lovecraft has to offer!

[Beautiful Soup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)

[Requests Documentation](https://requests.readthedocs.io/en/master/)
