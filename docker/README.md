# BackstopJS Docker Image

A self-contained Docker image to run [BackstopJS](https://github.com/garris/BackstopJS) with no external dependencies.

[Visual Regression Testing with BackstopJS in a Docker container](https://blog.docksal.io/visual-regression-testing-with-backstopjs-in-a-docker-container-dfd1b9ae8582)

Features:

- [BackstopJS 3.x](https://github.com/garris/BackstopJS)
- [Chrome-headless](https://www.google.com/chrome/browser/canary.html)
- [CasperJS](http://casperjs.org/)
- [PhantomJS](http://phantomjs.org/)
- [SlimerJS](https://slimerjs.org/) (with Firefox ESR)


## Versions

- `backstopjs/backstopjs` - BackstopJS v3 with Chrome Headless support


## Usage

Use this image as if you were using a binary.  
Working directory is expected to be mounted at `/src` in the container.

```
$ docker run --rm -v $(pwd):/src backstopjs/backstopjs --version
BackstopJS v3.x.x
```

You can also add a shell alias (in `.bashrc`, `.zshrc`, etc.) for convenience.

```
alias backstop='docker run --rm -v $(pwd):/src backstopjs/backstopjs "$@"'
```

Restart your shell or open a new one, then

```
$ backstopjs --version
BackstopJS v3.x.x
```


## Sample test

```
docker run --rm -v $(pwd):/src backstopjs/backstopjs init
docker run --rm -v $(pwd):/src backstopjs/backstopjs reference
docker run --rm -v $(pwd):/src backstopjs/backstopjs test
```


## Browser engines

By default BackstopJS is using Headless Chrome to take screenshots.

You can also use PhantomJS or SlimerJS/Firefox by setting `"engine": "phantomjs"` or `"engine": "slimerjs"` respectively 
in `backstop.json`.

Chrome, PhantomJS, SlimerJS and Firefox ESR (extended support release) are pre-installed in the container.


## Limitations

`backstop openReport` is not (yet) supported.

When running SlimerJS, the user you are running the container as must have a home directory in order for Slimer 
to start properly. You can work around this by setting the `HOME` variable:

```
docker run --rm --user 1000 -e HOME=/tmp/home backstopjs/backstopjs test
```


## Debugging

The following command will start a bash session in the container.

```
docker run --rm -v $(pwd):/src -it --entrypoint=bash backstopjs/backstopjs
```
