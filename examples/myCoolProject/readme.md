
### My Cool Project

do `backstop init`  then replace scenario with...

```
    {
      "label": "My Homepage",
      "url": "index.html",
      "hideSelectors": [],
      "removeSelectors": [],
      "selectors": [
        "nav",
        ".jumbotron",
        "body .col-md-4:nth-of-type(1)",
        "body .col-md-4:nth-of-type(2)",
        "body .col-md-4:nth-of-type(3)",
        "footer"
      ],
      "readyEvent": null,
      "delay": 500,
      "misMatchThreshold" : 0.1,
      "onBeforeScript": "onBefore.js",
      "onReadyScript": "onReady.js"
    }

```


