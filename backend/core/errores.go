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
