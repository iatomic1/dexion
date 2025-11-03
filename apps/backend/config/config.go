package config

import (
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Environment    string `mapstructure:"ENVIROMENT"`
	ApiPrefixStr   string `mapstructure:"API_V1_PREFIX_STRING"`
	DbURL          string `mapstructure:"DB_URL"`
	HttpAddress    string `mapstructure:"HTTP_SERVER_ADDRESS"`
	Host           string `mapstructure:"HOST"`
	FrontendURL    string `mapstructure:"FRONTEND_URL"`
	RdbURL         string `mapstructure:"REDIS_URL"`
	InternalSecret string `mapstructure:"INTERNAL_SECRET"`
	// AllowedOrigins specifies the list of allowed origins for CORS configuration.
	// Expected format: comma-separated list of origins (e.g., "https://example.com,https://another.com").
	// Used to configure CORS middleware to restrict cross-origin requests.
	AllowedOrigins string `mapstructure:"ALLOWED_ORIGINS"`
}

func Load(path string) (*Config, error) {
	env := os.Getenv("ENVIROMENT")
	if env == "" {
		env = "development"
	}
	return LoadEnvironmentVariables(path, env)
}

func LoadEnvironmentVariables(p string, env string) (*Config, error) {
	// Initialize config with default values
	cfg := &Config{}

	// Only try to load local .env if in development or local environment
	if env == "development" || env == "local" {
		viper.SetConfigFile(p + "/.env")
		viper.SetConfigType("env")
		_ = viper.ReadInConfig() // Ignore error if .env doesn't exist

		// Use viper to unmarshal for local development
		if err := viper.Unmarshal(cfg); err != nil {
			return nil, err
		}
	}

	// Directly load all environment variables, overriding any values from .env file

	// String variables

	if val := os.Getenv("ENVIROMENT"); val != "" {
		cfg.Environment = val
	}

	if val := os.Getenv("API_V1_PREFIX_STRING"); val != "" {
		cfg.ApiPrefixStr = val
	}

	if val := os.Getenv("DB_URL"); val != "" {
		cfg.DbURL = val
	}
	if val := os.Getenv("HTTP_SERVER_ADDRESS"); val != "" {
		cfg.HttpAddress = val
	}
	if val := os.Getenv("HOST"); val != "" {
		cfg.Host = val
	}

	if val := os.Getenv("FRONTEND_URL"); val != "" {
		cfg.FrontendURL = val
	}

	if val := os.Getenv("REDIS_DB"); val != "" {
		cfg.RdbURL = val
	}
	if val := os.Getenv("ALLOWED_ORIGINS"); val != "" {
		cfg.AllowedOrigins = val
	}
	if val := os.Getenv("INTERNAL_SECRET"); val != "" {
		cfg.InternalSecret = val
	}

	return cfg, nil
}
