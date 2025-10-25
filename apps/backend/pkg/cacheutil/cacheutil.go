package cacheutil

import (
	"context"
	"fmt"
	"reflect"
	"time"

	"database/sql"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
)

// CacheStruct converts any struct (including pgx/v5 types) into a Redis hash.
// It respects `json` tags for field names and skips fields tagged with `json:"-"`.
func CacheStruct(ctx context.Context, rdb *redis.Client, key string, v any) error {
	m, err := toMap(v)
	if err != nil {
		return err
	}
	if len(m) == 0 {
		return nil
	}
	return rdb.HSet(ctx, key, m).Err()
}

func toMap(v any) (map[string]interface{}, error) {
	out := make(map[string]interface{})
	val := reflect.ValueOf(v)
	typ := reflect.TypeOf(v)

	if val.Kind() == reflect.Ptr {
		val = val.Elem()
		typ = typ.Elem()
	}

	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldType := typ.Field(i)

		// Respect JSON tag name
		tag := fieldType.Tag.Get("json")
		if tag == "-" {
			continue
		}
		key := fieldType.Name
		if tag != "" {
			key = tag
		}

		// Handle pointer fields
		if field.Kind() == reflect.Ptr {
			if field.IsNil() {
				continue
			}
			field = field.Elem()
		}

		switch field.Interface().(type) {

		// --- pgx/v5 types ---
		case pgtype.Text:
			txt := field.Interface().(pgtype.Text)
			if txt.Valid {
				out[key] = txt.String
			}
		case pgtype.Int8:
			i := field.Interface().(pgtype.Int8)
			if i.Valid {
				out[key] = i.Int64
			}
		case pgtype.Float8:
			f := field.Interface().(pgtype.Float8)
			if f.Valid {
				out[key] = f.Float64
			}
		case pgtype.Bool:
			b := field.Interface().(pgtype.Bool)
			if b.Valid {
				out[key] = b.Bool
			}
		case pgtype.Timestamptz:
			t := field.Interface().(pgtype.Timestamptz)
			if t.Valid {
				out[key] = t.Time.Format(time.RFC3339)
			}

		// --- sql.Null* types ---
		case sql.NullString:
			ns := field.Interface().(sql.NullString)
			if ns.Valid {
				out[key] = ns.String
			}
		case sql.NullInt64:
			ni := field.Interface().(sql.NullInt64)
			if ni.Valid {
				out[key] = ni.Int64
			}
		case sql.NullFloat64:
			nf := field.Interface().(sql.NullFloat64)
			if nf.Valid {
				out[key] = nf.Float64
			}
		case sql.NullBool:
			nb := field.Interface().(sql.NullBool)
			if nb.Valid {
				out[key] = nb.Bool
			}

		// --- Common Go types ---
		case time.Time:
			t := field.Interface().(time.Time)
			out[key] = t.Format(time.RFC3339)
		case uuid.UUID:
			out[key] = field.Interface().(uuid.UUID).String()

		default:
			// For regular fields
			if field.IsZero() {
				continue
			}
			if field.Kind() == reflect.Bool {
				out[key] = fmt.Sprintf("%t", field.Bool()) // "true" / "false"
				continue
			}

			out[key] = field.Interface()
		}
	}
	return out, nil
}
