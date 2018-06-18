BackstopJS allows you to import all config parameters as a node module (as an option instead of JSON) which allows you to use comments, variables and logic etc. inside of your config.

To use a js module based config file, explicitly specify your config filepath when running a command. e.g.

```sh
$ backstop test --config=backstopTests/backstopConfig
```
_1. You don't actually need to specify a file extension as part of your config parameter -- but you can add one if you like._

_2. See the the main readme for more info on setting the config file path._
