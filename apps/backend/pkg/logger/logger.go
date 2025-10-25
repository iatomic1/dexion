package logger

import (
	"io"
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func Init() {
	env := os.Getenv("ENVIRONMENT")
	level := os.Getenv("LOG_LEVEL")

	switch level {
	case "debug":
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	case "warn":
		zerolog.SetGlobalLevel(zerolog.WarnLevel)
	case "error":
		zerolog.SetGlobalLevel(zerolog.ErrorLevel)
	default:
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	}

	var output io.Writer = os.Stderr
	timeFormat := zerolog.TimeFormatUnix
	if env == "development" {
		timeFormat = time.RFC3339
		output = zerolog.ConsoleWriter{
			Out:        os.Stderr,
			TimeFormat: timeFormat,
		}
	}
	zerolog.TimeFieldFormat = timeFormat

	log.Logger = zerolog.New(output).With().
		Timestamp().
		Str("env", env).
		Logger()
}
