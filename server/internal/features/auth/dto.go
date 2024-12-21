package auth

import "encoding/json"

type SignUpRequest struct {
	OrgName  string `json:"org_name"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
}

type UpdateCreatorPasswordRequest struct {
	NewPassword      string `json:"password"`
}

type UpdateCreatorProfileRequest struct {
	Profile json.RawMessage `json:"profile"`
}

type UpdateCreatorRoleAndStatusRequest struct {
	Role   string `json:"role"`
	Status bool		`json:"status"`
}

type UpdateOrgDetailsRequest struct {
	Name    string          `json:"name"`
	Profile json.RawMessage `json:"profile"`
}

type AddNewOrgCreatorRequest struct {
	Username string          `json:"username"`
	Password string          `json:"password"`
	Role     string          `json:"role"`
	Profile  json.RawMessage `json:"profile"`
}