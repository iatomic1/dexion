// Package docs Code generated by swaggo/swag. DO NOT EDIT
package docs

import "github.com/swaggo/swag"

const docTemplate = `{
    "schemes": {{ marshal .Schemes }},
    "swagger": "2.0",
    "info": {
        "description": "{{escape .Description}}",
        "title": "{{.Title}}",
        "contact": {
            "name": "Atomic",
            "url": "https://github.com/iatomic1",
            "email": "atomic.k.2739@gmail.com"
        },
        "version": "{{.Version}}"
    },
    "host": "{{.Host}}",
    "basePath": "{{.BasePath}}",
    "paths": {
        "/auth/login": {
            "post": {
                "description": "Logs a user into his/her account",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Auth"
                ],
                "summary": "Login to your account",
                "parameters": [
                    {
                        "description": "Login data",
                        "name": "EmailAndPassword",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/backend_internal_db_repository.RegisterUserParams"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "Login success",
                        "schema": {
                            "allOf": [
                                {
                                    "$ref": "#/definitions/backend_api_http.Response"
                                },
                                {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "$ref": "#/definitions/backend_internal_domain.AuthResponse"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "400": {
                        "description": "Invalid request data",
                        "schema": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "string"
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            }
        },
        "/auth/refresh": {
            "get": {
                "security": [
                    {
                        "RefreshTokenBearer": []
                    }
                ],
                "description": "Refreshes token to get new token pair",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Auth"
                ],
                "summary": "Refresh Token",
                "responses": {
                    "200": {
                        "description": "TokenPair",
                        "schema": {
                            "allOf": [
                                {
                                    "$ref": "#/definitions/backend_api_http.SuccessResponse"
                                },
                                {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "$ref": "#/definitions/backend_pkg_jwt.TokenPair"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "401": {
                        "description": "Unauthorized",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.UnauthorizedResponse"
                        }
                    },
                    "404": {
                        "description": "Profile not found",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.NotFoundResponse"
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            }
        },
        "/auth/signup": {
            "post": {
                "description": "Create an account on unwind",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Auth"
                ],
                "summary": "Create an account",
                "parameters": [
                    {
                        "description": "Signup data",
                        "name": "EmailAndPassword",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/backend_internal_domain.RegisterRequest"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "User created successfully",
                        "schema": {
                            "allOf": [
                                {
                                    "$ref": "#/definitions/backend_api_http.Response"
                                },
                                {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "$ref": "#/definitions/backend_internal_domain.AuthResponse"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            }
        },
        "/auth/signup/tg": {
            "post": {
                "description": "Create an account on dexion",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Auth"
                ],
                "summary": "Create an account",
                "parameters": [
                    {
                        "description": "Signup data",
                        "name": "EmailAndPassword",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/api_http_handlers_auth.TelegramRegisterRequest"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "User created successfully",
                        "schema": {
                            "allOf": [
                                {
                                    "$ref": "#/definitions/backend_api_http.Response"
                                },
                                {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "$ref": "#/definitions/backend_internal_db_repository.User"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            }
        },
        "/wallets": {
            "get": {
                "security": [
                    {
                        "ApiKeyAuth": []
                    }
                ],
                "description": "Retrieve all wallets tracked by the user",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Wallets"
                ],
                "summary": "Get tracked wallets",
                "responses": {
                    "200": {
                        "description": "Wallets retrieved",
                        "schema": {
                            "allOf": [
                                {
                                    "$ref": "#/definitions/backend_api_http.Response"
                                },
                                {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "type": "array",
                                            "items": {
                                                "$ref": "#/definitions/backend_internal_db_repository.GetUserTrackedWalletsRow"
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            },
            "post": {
                "security": [
                    {
                        "ApiKeyAuth": []
                    }
                ],
                "description": "Add a wallet to user's tracking list",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Wallets"
                ],
                "summary": "Track a new wallet",
                "parameters": [
                    {
                        "description": "Wallet tracking data",
                        "name": "WalletRequest",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/backend_internal_db_repository.UpsertUserWalletParams"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "Wallet tracked successfully",
                        "schema": {
                            "allOf": [
                                {
                                    "$ref": "#/definitions/backend_api_http.Response"
                                },
                                {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "$ref": "#/definitions/backend_internal_db_repository.UserWallet"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "400": {
                        "description": "Invalid request data",
                        "schema": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "string"
                            }
                        }
                    },
                    "409": {
                        "description": "Wallet already tracked",
                        "schema": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "string"
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            }
        },
        "/wallets/all": {
            "get": {
                "description": "Retrieve all wallets in the system",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Wallets"
                ],
                "summary": "Get all wallets",
                "responses": {
                    "200": {
                        "description": "All wallets retrieved",
                        "schema": {
                            "allOf": [
                                {
                                    "$ref": "#/definitions/backend_api_http.Response"
                                },
                                {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "type": "array",
                                            "items": {
                                                "$ref": "#/definitions/backend_internal_db_repository.Wallet"
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            }
        },
        "/wallets/{address}": {
            "delete": {
                "security": [
                    {
                        "ApiKeyAuth": []
                    }
                ],
                "description": "Remove a wallet from user's tracking list",
                "tags": [
                    "Wallets"
                ],
                "summary": "Untrack wallet",
                "parameters": [
                    {
                        "type": "string",
                        "description": "Wallet address",
                        "name": "address",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "204": {
                        "description": "Wallet untracked"
                    },
                    "404": {
                        "description": "Wallet not found",
                        "schema": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "string"
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            },
            "patch": {
                "security": [
                    {
                        "ApiKeyAuth": []
                    }
                ],
                "description": "Update nickname or emoji for a tracked wallet",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Wallets"
                ],
                "summary": "Update wallet preferences",
                "parameters": [
                    {
                        "type": "string",
                        "description": "Wallet address",
                        "name": "address",
                        "in": "path",
                        "required": true
                    },
                    {
                        "description": "Update data",
                        "name": "preferences",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/backend_internal_db_repository.UpdateWalletPreferencesParams"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Preferences updated",
                        "schema": {
                            "allOf": [
                                {
                                    "$ref": "#/definitions/backend_api_http.Response"
                                },
                                {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "$ref": "#/definitions/backend_internal_db_repository.UserWallet"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "400": {
                        "description": "Invalid request data",
                        "schema": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "string"
                            }
                        }
                    },
                    "404": {
                        "description": "Wallet not found",
                        "schema": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "string"
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            }
        },
        "/wallets/{address}/watchers": {
            "get": {
                "description": "Retrieve all wallets in the system",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Wallets"
                ],
                "summary": "Get all wallets",
                "responses": {
                    "200": {
                        "description": "All wallets retrieved",
                        "schema": {
                            "allOf": [
                                {
                                    "$ref": "#/definitions/backend_api_http.Response"
                                },
                                {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "type": "array",
                                            "items": {
                                                "$ref": "#/definitions/backend_internal_db_repository.Wallet"
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "schema": {
                            "$ref": "#/definitions/backend_api_http.InternalServerErrorResponse"
                        }
                    }
                }
            }
        }
    },
    "definitions": {
        "api_http_handlers_auth.TelegramRegisterRequest": {
            "type": "object",
            "required": [
                "telegram_chat_id",
                "type"
            ],
            "properties": {
                "password": {
                    "type": "string"
                },
                "telegram_chat_id": {
                    "type": "string"
                },
                "type": {
                    "$ref": "#/definitions/backend_internal_db_repository.UserType"
                }
            }
        },
        "backend_api_http.InternalServerErrorResponse": {
            "type": "object",
            "properties": {
                "errors": {},
                "message": {
                    "type": "string"
                },
                "status": {
                    "type": "string",
                    "example": "Internal Server Error"
                }
            }
        },
        "backend_api_http.NotFoundResponse": {
            "type": "object",
            "properties": {
                "errors": {},
                "message": {
                    "type": "string"
                },
                "status": {
                    "type": "string",
                    "example": "Not Found"
                }
            }
        },
        "backend_api_http.Response": {
            "type": "object",
            "properties": {
                "data": {},
                "errors": {},
                "message": {
                    "type": "string"
                },
                "status": {
                    "type": "string"
                }
            }
        },
        "backend_api_http.SuccessResponse": {
            "type": "object",
            "properties": {
                "data": {},
                "message": {
                    "type": "string"
                },
                "status": {
                    "type": "string",
                    "example": "OK"
                }
            }
        },
        "backend_api_http.UnauthorizedResponse": {
            "type": "object",
            "properties": {
                "errors": {},
                "message": {
                    "type": "string"
                },
                "status": {
                    "type": "string",
                    "example": "Unauthorized"
                }
            }
        },
        "backend_internal_db_repository.GetUserTrackedWalletsRow": {
            "type": "object",
            "required": [
                "address",
                "nickname"
            ],
            "properties": {
                "address": {
                    "type": "string",
                    "example": "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1"
                },
                "createdAt": {
                    "$ref": "#/definitions/pgtype.Timestamptz"
                },
                "emoji": {
                    "type": "string"
                },
                "nickname": {
                    "type": "string",
                    "example": "iatomic"
                },
                "notifications": {
                    "type": "boolean"
                }
            }
        },
        "backend_internal_db_repository.RegisterUserParams": {
            "type": "object",
            "required": [
                "email",
                "password",
                "type"
            ],
            "properties": {
                "email": {
                    "type": "string",
                    "example": "mosh@mail.com"
                },
                "password": {
                    "type": "string",
                    "example": "Hello"
                },
                "type": {
                    "allOf": [
                        {
                            "$ref": "#/definitions/backend_internal_db_repository.UserType"
                        }
                    ],
                    "example": "APP"
                }
            }
        },
        "backend_internal_db_repository.UpdateWalletPreferencesParams": {
            "type": "object",
            "required": [
                "nickname",
                "walletAddress"
            ],
            "properties": {
                "id": {
                    "type": "string"
                },
                "nickname": {
                    "type": "string",
                    "example": "iatomic"
                },
                "notifications": {
                    "type": "boolean"
                },
                "walletAddress": {
                    "type": "string",
                    "example": "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1"
                }
            }
        },
        "backend_internal_db_repository.UpsertUserWalletParams": {
            "type": "object",
            "required": [
                "nickname",
                "walletAddress"
            ],
            "properties": {
                "emoji": {
                    "type": "string"
                },
                "nickname": {
                    "type": "string",
                    "example": "iatomic"
                },
                "userId": {
                    "type": "string"
                },
                "walletAddress": {
                    "type": "string",
                    "example": "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1"
                }
            }
        },
        "backend_internal_db_repository.User": {
            "type": "object",
            "required": [
                "email",
                "password",
                "type"
            ],
            "properties": {
                "createdAt": {
                    "$ref": "#/definitions/pgtype.Timestamptz"
                },
                "email": {
                    "type": "string",
                    "example": "mosh@mail.com"
                },
                "id": {
                    "type": "string"
                },
                "password": {
                    "type": "string",
                    "example": "Hello"
                },
                "telegramChatId": {
                    "type": "string"
                },
                "type": {
                    "allOf": [
                        {
                            "$ref": "#/definitions/backend_internal_db_repository.UserType"
                        }
                    ],
                    "example": "APP"
                },
                "updatedAt": {
                    "type": "string"
                }
            }
        },
        "backend_internal_db_repository.UserType": {
            "type": "string",
            "enum": [
                "APP",
                "TELEGRAM"
            ],
            "x-enum-varnames": [
                "UserTypeAPP",
                "UserTypeTELEGRAM"
            ]
        },
        "backend_internal_db_repository.UserWallet": {
            "type": "object",
            "required": [
                "nickname",
                "walletAddress"
            ],
            "properties": {
                "createdAt": {
                    "type": "string"
                },
                "emoji": {
                    "type": "string"
                },
                "nickname": {
                    "type": "string",
                    "example": "iatomic"
                },
                "notifications": {
                    "type": "boolean"
                },
                "updatedAt": {
                    "type": "string"
                },
                "userId": {
                    "type": "string"
                },
                "walletAddress": {
                    "type": "string",
                    "example": "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1"
                }
            }
        },
        "backend_internal_db_repository.Wallet": {
            "type": "object",
            "required": [
                "address"
            ],
            "properties": {
                "address": {
                    "type": "string",
                    "example": "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1"
                },
                "createdAt": {
                    "$ref": "#/definitions/pgtype.Timestamptz"
                }
            }
        },
        "backend_internal_domain.AuthResponse": {
            "type": "object",
            "properties": {
                "accessToken": {
                    "type": "string"
                },
                "refreshToken": {
                    "type": "string"
                },
                "refreshTokenId": {
                    "description": "Added to hold the refresh token ID",
                    "type": "string"
                },
                "userId": {
                    "type": "string"
                }
            }
        },
        "backend_internal_domain.RegisterRequest": {
            "type": "object",
            "required": [
                "email",
                "password",
                "type"
            ],
            "properties": {
                "email": {
                    "type": "string",
                    "example": "mosh@mail.com"
                },
                "password": {
                    "type": "string",
                    "example": "Hello"
                },
                "type": {
                    "allOf": [
                        {
                            "$ref": "#/definitions/backend_internal_db_repository.UserType"
                        }
                    ],
                    "example": "APP"
                }
            }
        },
        "backend_pkg_jwt.TokenPair": {
            "type": "object",
            "properties": {
                "accessToken": {
                    "type": "string"
                },
                "refreshToken": {
                    "type": "string"
                },
                "refreshTokenId": {
                    "description": "Added to hold the refresh token ID",
                    "type": "string"
                }
            }
        },
        "pgtype.InfinityModifier": {
            "type": "integer",
            "enum": [
                1,
                0,
                -1
            ],
            "x-enum-varnames": [
                "Infinity",
                "Finite",
                "NegativeInfinity"
            ]
        },
        "pgtype.Timestamptz": {
            "type": "object",
            "properties": {
                "infinityModifier": {
                    "$ref": "#/definitions/pgtype.InfinityModifier"
                },
                "time": {
                    "type": "string"
                },
                "valid": {
                    "type": "boolean"
                }
            }
        }
    },
    "securityDefinitions": {
        "AccessTokenBearer": {
            "description": "AccessTokenBearer Authentication",
            "type": "apiKey",
            "name": "Authorization",
            "in": "header"
        },
        "Google OAuth2": {
            "type": "oauth2",
            "flow": "accessCode",
            "authorizationUrl": "https://accounts.google.com/o/oauth2/auth",
            "tokenUrl": "https://oauth2.googleapis.com/token",
            "scopes": {
                "email": "Grants access to user's email",
                "profile": "Grants access to user's basic profile info"
            }
        },
        "RefreshTokenBearer": {
            "description": "RefreshTokenBearer Authentication",
            "type": "apiKey",
            "name": "Authorization",
            "in": "header"
        }
    },
    "tags": [
        {
            "description": "Authentication endpoints",
            "name": "Auth"
        }
    ]
}`

// SwaggerInfo holds exported Swagger Info so clients can modify it
var SwaggerInfo = &swag.Spec{
	Version:          "1.0",
	Host:             "localhost:8080",
	BasePath:         "/api/v1",
	Schemes:          []string{"http", "https"},
	Title:            "DEXION API",
	Description:      "API for Dexion",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
	LeftDelim:        "{{",
	RightDelim:       "}}",
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
