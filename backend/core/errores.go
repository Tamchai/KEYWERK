package core

type AppError struct {
	StatusCode int
	Message    string
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(code int, msg string) *AppError {
	return &AppError{StatusCode: code, Message: msg}
}

func NewNotFoundError(msg string) *AppError {
	return &AppError{StatusCode: 404, Message: msg}
}

func NewBadRequestError(msg string) *AppError {
	return &AppError{StatusCode: 400, Message: msg}
}

func NewInternalServerError(msg string) *AppError {
	return &AppError{StatusCode: 500, Message: msg}
}

func NewUnauthorizedError(msg string) *AppError {
	return &AppError{StatusCode: 401, Message: msg}
}

func NewForbiddenError(msg string) *AppError {
	return &AppError{StatusCode: 403, Message: msg}
}

func NewConflictError(msg string) *AppError {
	return &AppError{StatusCode: 409, Message: msg}
}
