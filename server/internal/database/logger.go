// database/logger.go
package database

import (
	"database/sql"
	"fmt"
	"reflect"
	"strings"
)

// QueryLogger is a wrapper around sql.DB that logs queries
type QueryLogger struct {
    db *sql.DB
}

// DebugParams formats query parameters for logging
func DebugParams(args ...interface{}) string {
    params := make([]string, len(args))
    for i, arg := range args {
        switch v := arg.(type) {
        case nil:
            params[i] = "NULL"
        case string:
            params[i] = fmt.Sprintf("'%s'", v)
        case []byte:
            params[i] = fmt.Sprintf("'%s'", string(v))
        case bool:
            params[i] = fmt.Sprintf("%t", v)
        case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
            params[i] = fmt.Sprintf("%d", v)
        case float32, float64:
            params[i] = fmt.Sprintf("%f", v)
        case []interface{}:
            if len(v) == 0 {
                params[i] = "NULL"
            } else {
                params[i] = fmt.Sprintf("ARRAY[%s]", DebugParams(v...))
            }
        default:
            // Handle pointer types
            if reflect.TypeOf(arg).Kind() == reflect.Ptr {
                if reflect.ValueOf(arg).IsNil() {
                    params[i] = "NULL"
                } else {
                    params[i] = fmt.Sprintf("'%v'", reflect.ValueOf(arg).Elem().Interface())
                }
            } else {
                params[i] = fmt.Sprintf("'%v'", v)
            }
        }
    }
    return strings.Join(params, ", ")
}

// InterpolateQuery replaces placeholders with actual values for debugging
func InterpolateQuery(query string, args ...interface{}) string {
    for i, arg := range args {
        placeholder := fmt.Sprintf("$%d", i+1)
        var value string
        switch v := arg.(type) {
        case nil:
            value = "NULL"
        case string:
            value = fmt.Sprintf("'%s'", v)
        case []byte:
            value = fmt.Sprintf("'%s'", string(v))
        case bool:
            value = fmt.Sprintf("%t", v)
        default:
            if reflect.TypeOf(arg).Kind() == reflect.Ptr {
                if reflect.ValueOf(arg).IsNil() {
                    value = "NULL"
                } else {
                    value = fmt.Sprintf("'%v'", reflect.ValueOf(arg).Elem().Interface())
                }
            } else {
                value = fmt.Sprintf("'%v'", v)
            }
        }
        query = strings.Replace(query, placeholder, value, 1)
    }
    return query
}