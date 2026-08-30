package port

import (
	"context"

	"github.com/keywerk/internal/core/domain/dto"
)

type ImageRepository interface {
	UploadToSeaweed(ctx context.Context, imageData dto.ReqImageData) (string, error)
	SaveImageMetadata(ctx context.Context, image dto.Image) error
}
