package config

import (
	"os"
	"strconv"

	"github.com/spf13/viper"
)

type Config struct {
	RedisAddress          string  `mapstructure:"REDIS_ADDRESS"`
	AccessJwtKey          string  `mapstructure:"ACCESS_JWT_KEY"`
	Environment           string  `mapstructure:"ENVIROMENT"`
	DbType                string  `mapstructure:"DB_TYPE"`
	RedisPassword         string  `mapstructure:"REDIS_PASSWORD"`
	RefreshJwtKey         string  `mapstructure:"REFRESH_JWT_KEY"`
	ApiPrefixStr          string  `mapstructure:"API_V1_PREFIX_STRING"`
	RedisUsername         string  `mapstructure:"REDIS_USERNAME"`
	DbURL                 string  `mapstructure:"DB_URL"`
	HttpAddress           string  `mapstructure:"HTTP_SERVER_ADDRESS"`
	Host                  string  `mapstructure:"HOST"`
	CoudinaryURL          string  `mapstructure:"CLOUDINARY_URL"`
	FrontendURL           string  `mapstructure:"FRONTEND_URL"`
	GoogleClientSecret    string  `mapstructure:"GOOGLE_CLIENT_SECRET"`
	GoogleClientID        string  `mapstructure:"GOOGLE_CLIENT_ID"`
	GoogleSigningKey      string  `mapstructure:"GOOGLE_SIGNING_KEY"`
	GoogleMaxAge          int     `mapstructure:"GOOGLE_MAX_AGE"`
	AccessExpirationHour  float64 `mapstructure:"ACCESS_EXPIRATION_HOUR"`
	RedisDB               int     `mapstructure:"REDIS_DB"`
	RefreshExpirationHour float64 `mapstructure:"REFRESH_EXPIRATION_HOUR"`
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
	if val := os.Getenv("REDIS_ADDRESS"); val != "" {
		cfg.RedisAddress = val
	}
	if val := os.Getenv("ACCESS_JWT_KEY"); val != "" {
		cfg.AccessJwtKey = val
	}
	if val := os.Getenv("ENVIROMENT"); val != "" {
		cfg.Environment = val
	}
	if val := os.Getenv("DB_TYPE"); val != "" {
		cfg.DbType = val
	}
	if val := os.Getenv("REDIS_PASSWORD"); val != "" {
		cfg.RedisPassword = val
	}
	if val := os.Getenv("REFRESH_JWT_KEY"); val != "" {
		cfg.RefreshJwtKey = val
	}
	if val := os.Getenv("API_V1_PREFIX_STRING"); val != "" {
		cfg.ApiPrefixStr = val
	}
	if val := os.Getenv("REDIS_USERNAME"); val != "" {
		cfg.RedisUsername = val
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
	if val := os.Getenv("CLOUDINARY_URL"); val != "" {
		cfg.CoudinaryURL = val
	}
	if val := os.Getenv("FRONTEND_URL"); val != "" {
		cfg.FrontendURL = val
	}
	if val := os.Getenv("GOOGLE_CLIENT_SECRET"); val != "" {
		cfg.GoogleClientSecret = val
	}
	if val := os.Getenv("GOOGLE_CLIENT_ID"); val != "" {
		cfg.GoogleClientID = val
	}
	if val := os.Getenv("GOOGLE_SIGNING_KEY"); val != "" {
		cfg.GoogleSigningKey = val
	}

	// Integer variables
	if val := os.Getenv("GOOGLE_MAX_AGE"); val != "" {
		if intVal, err := strconv.Atoi(val); err == nil {
			cfg.GoogleMaxAge = intVal
		}
	}
	if val := os.Getenv("REDIS_DB"); val != "" {
		if intVal, err := strconv.Atoi(val); err == nil {
			cfg.RedisDB = intVal
		}
	}

	// Float variables
	if val := os.Getenv("ACCESS_EXPIRATION_HOUR"); val != "" {
		if floatVal, err := strconv.ParseFloat(val, 64); err == nil {
			cfg.AccessExpirationHour = floatVal
		}
	}
	if val := os.Getenv("REFRESH_EXPIRATION_HOUR"); val != "" {
		if floatVal, err := strconv.ParseFloat(val, 64); err == nil {
			cfg.RefreshExpirationHour = floatVal
		}
	}

	return cfg, nil
}
