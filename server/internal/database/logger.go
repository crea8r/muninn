// database/logger.go
package database

import (
	"fmt"
	"reflect"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// DebugParams formats query parameters for logging
func DebugParams(args ...interface{}) string {
    params := make([]string, len(args))
    for i, arg := range args {
        switch v := arg.(type) {
        case nil:
            params[i] = "NULL"
        case string:
            params[i] = fmt.Sprintf("'%s'", strings.ReplaceAll(v, "'", "''"))
        case []byte:
            params[i] = fmt.Sprintf("'%s'", strings.ReplaceAll(string(v), "'", "''"))
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
            if reflect.TypeOf(arg).Kind() == reflect.Ptr {
                if reflect.ValueOf(arg).IsNil() {
                    params[i] = "NULL"
                } else {
                    params[i] = formatValue(reflect.ValueOf(arg).Elem().Interface())
                }
            } else {
                params[i] = formatValue(v)
            }
        }
    }
    return strings.Join(params, ", ")
}

// formatValue is a helper function to safely format values for SQL
func formatValue(v interface{}) string {
    // Handle slice types
    if reflect.TypeOf(v).Kind() == reflect.Slice {
        value := reflect.ValueOf(v)
        elements := make([]string, value.Len())
        for i := 0; i < value.Len(); i++ {
            elements[i] = formatValue(value.Index(i).Interface())
        }
        return fmt.Sprintf("ARRAY[%s]", strings.Join(elements, ","))
    }

    // Handle special types that might need custom formatting
    switch val := v.(type) {
    case []byte:
        return fmt.Sprintf("'%s'", strings.ReplaceAll(string(val), "'", "''"))
    default:
        return fmt.Sprintf("'%v'", v)
    }
}

// InterpolateQuery replaces placeholders with actual values for debugging
func InterpolateQuery(query string, args ...interface{}) string {
    if len(args) == 0 {
        return query
    }

    // Find all placeholders
    placeholderRegex := regexp.MustCompile(`\$(\d+)`)
    matches := placeholderRegex.FindAllStringSubmatch(query, -1)

    // Get unique placeholder numbers and sort them in descending order
    placeholders := make([]int, 0, len(matches))
    seen := make(map[int]bool)
    for _, match := range matches {
        num, _ := strconv.Atoi(match[1])
        if !seen[num] {
            placeholders = append(placeholders, num)
            seen[num] = true
        }
    }
    sort.Sort(sort.Reverse(sort.IntSlice(placeholders)))

    // Replace placeholders with values, starting from the highest number
    result := query
    for _, num := range placeholders {
        if num <= len(args) {
            placeholder := fmt.Sprintf("$%d", num)
            value := formatParamForQuery(args[num-1])
            result = strings.ReplaceAll(result, placeholder, value)
        }
    }

    return result
}

// formatParamForQuery formats a parameter value for SQL query debugging
func formatParamForQuery(arg interface{}) string {
    if arg == nil {
        return "NULL"
    }

    switch v := arg.(type) {
    case string:
        return fmt.Sprintf("'%s'", strings.ReplaceAll(v, "'", "''"))
    case []byte:
        return fmt.Sprintf("'%s'", strings.ReplaceAll(string(v), "'", "''"))
    case bool:
        return fmt.Sprintf("%t", v)
    case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
        return fmt.Sprintf("%d", v)
    case float32, float64:
        return fmt.Sprintf("%f", v)
    case []interface{}:
        if len(v) == 0 {
            return "NULL"
        }
        values := make([]string, len(v))
        for i, item := range v {
            values[i] = formatParamForQuery(item)
        }
        return fmt.Sprintf("ARRAY[%s]", strings.Join(values, ","))
    default:
        // Handle pointer types
        if reflect.TypeOf(arg).Kind() == reflect.Ptr {
            if reflect.ValueOf(arg).IsNil() {
                return "NULL"
            }
            return formatParamForQuery(reflect.ValueOf(arg).Elem().Interface())
        }
        // Handle slice types
        if reflect.TypeOf(arg).Kind() == reflect.Slice {
            value := reflect.ValueOf(arg)
            if value.Len() == 0 {
                return "NULL"
            }
            elements := make([]string, value.Len())
            for i := 0; i < value.Len(); i++ {
                elements[i] = formatParamForQuery(value.Index(i).Interface())
            }
            return fmt.Sprintf("ARRAY[%s]", strings.Join(elements, ","))
        }
        // Default formatting
        return fmt.Sprintf("'%v'", arg)
    }
}