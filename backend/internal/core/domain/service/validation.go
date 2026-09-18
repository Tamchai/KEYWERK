package service

import (
	"errors"
	"math"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/errs"
	"github.com/lib/pq"
)

func validateUUID(id, field string) error {
	if _, err := uuid.Parse(id); err != nil {
		return errs.BadRequest("invalid "+field, errors.New("value must be a UUID"))
	}
	return nil
}

func amountToCents(amount float64) int64 {
	return int64(math.Round(amount * 100))
}

func centsToAmount(cents int64) float64 {
	return float64(cents) / 100
}

func isPostgresError(err error, code pq.ErrorCode) bool {
	var pqErr *pq.Error
	return errors.As(err, &pqErr) && pqErr.Code == code
}

func isUniqueViolation(err error) bool {
	return isPostgresError(err, pq.ErrorCode("23505"))
}

func isForeignKeyViolation(err error) bool {
	return isPostgresError(err, pq.ErrorCode("23503"))
}
