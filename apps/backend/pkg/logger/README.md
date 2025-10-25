# Logger

This package provides a structured logger using [zerolog](https://github.com/rs/zerolog).

## Initialization

The logger is initialized in the `main` function of the application:

```go
func main() {
	logger.Init()
	// ...
}
```

## Usage

To use the logger, import the `log` package from `zerolog`:

```go
import "github.com/rs/zerolog/log"
```

Then you can use the logger as follows:

```go
log.Info().Msg("Hello, world!")
log.Error().Err(err).Msg("Something went wrong")
log.Debug().Msgf("this is a debug message: %s", "some value")
```

For more information on how to use `zerolog`, please refer to the [official documentation](https://github.com/rs/zerolog#usage).
